import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai";
import { DEFAULT_PLATFORMS, GENERATOR_PLATFORMS, MAX_PLATFORMS_PER_LISTING } from "@/lib/platforms";
import { buildListingPrompt, formatListingBody, outputSchemaFor, SYSTEM_PROMPT, type ListingVersion } from "@/lib/listing";
import type { ListingVariant } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQuota } from "@/lib/quota";
import { clientFingerprint, withinRateLimit } from "@/lib/rate-limit";
import { GENERATE_PER_IP, GENERATE_PER_USER, generateDailyCap } from "@/lib/limits";
import { recordEvent } from "@/lib/analytics-server";

export const maxDuration = 60;

const optionalText = (max: number) => z.string().trim().max(max).optional();

const requestSchema = z.object({
  service: z.string().trim().min(3).max(120),
  city: z.string().trim().min(2).max(80),
  skills: optionalText(400),
  experience: optionalText(300),
  availability: optionalText(200),
  zone: optionalText(150),
  rate: z.number().min(5).max(300).optional(),
  tone: z.enum(["chaleureux", "professionnel"]).optional(),
  platforms: z
    .array(z.enum(GENERATOR_PLATFORMS))
    .min(1)
    .max(MAX_PLATFORMS_PER_LISTING)
    .transform((list) => [...new Set(list)])
    .default(DEFAULT_PLATFORMS as typeof GENERATOR_PLATFORMS),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const admin = createAdminClient();

  // Limitation de débit avant toute lecture coûteuse : par compte, puis par adresse (empreinte).
  const ipKey = clientFingerprint(request.headers);
  const allowed =
    (await withinRateLimit(admin, `gen:user:${user.id}`, GENERATE_PER_USER.limit, GENERATE_PER_USER.windowSeconds)) &&
    (!ipKey || (await withinRateLimit(admin, `gen:ip:${ipKey}`, GENERATE_PER_IP.limit, GENERATE_PER_IP.windowSeconds)));
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de demandes en peu de temps. Réessayez dans quelques minutes.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  const { platforms, ...input } = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_plan")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });

  // Quota du plan (gratuit : mois, mensuel : jour, annuel : illimité), puis crédits du pack ponctuel.
  // La place est réservée de façon atomique en base : des requêtes simultanées ne dépassent pas le plafond.
  const quota = await getQuota(supabase, user.id, profile);
  let reservationId: string | null = null;
  let creditsLeft: number | undefined;
  let creditConsumed = false;
  if (quota.limit !== null) {
    const { data: slot, error: slotError } = await admin.rpc("claim_listing_slot", {
      p_user: user.id,
      p_limit: quota.limit,
      p_period: quota.period,
    });
    if (slotError) {
      console.error("generate-listing claim", slotError.message);
      return NextResponse.json({ error: "Service momentanément indisponible. Réessayez dans un instant." }, { status: 503 });
    }
    reservationId = typeof slot === "string" ? slot : null;
    if (!reservationId) {
      const { data: remaining, error: creditError } = await admin.rpc("consume_listing_credit", { p_user: user.id });
      if (creditError || typeof remaining !== "number" || remaining < 0) {
        const message =
          quota.period === "day"
            ? `Limite de ${quota.limit} annonces par jour atteinte. Revenez demain, passez à l'abonnement annuel ou achetez un pack d'annonces.`
            : `Limite de ${quota.limit} annonces par mois atteinte. Achetez un pack d'annonces ou abonnez-vous pour en générer davantage.`;
        return NextResponse.json({ error: message, code: "LIMIT_REACHED" }, { status: 403 });
      }
      creditConsumed = true;
      creditsLeft = remaining;
    }
  }

  const releaseSlot = async () => {
    if (reservationId) await admin.rpc("release_listing_slot", { p_id: reservationId });
  };
  const refundCredit = async () => {
    if (creditConsumed) await admin.rpc("grant_listing_credits", { p_user: user.id, p_amount: 1 });
  };

  // Plafond global journalier : protège la dépense du fournisseur d'IA. Le quota réservé est rendu.
  if (!(await withinRateLimit(admin, "gen:global:day", generateDailyCap(), 86_400))) {
    await releaseSlot();
    await refundCredit();
    return NextResponse.json(
      { error: "Le service est très sollicité aujourd'hui. Réessayez demain.", code: "DAILY_CAP" },
      { status: 503 },
    );
  }

  let object: { versions: Record<string, ListingVersion>; priceSuggested: number };
  try {
    ({ object } = await generateObject({
      model: getModel(),
      schema: outputSchemaFor(platforms),
      system: SYSTEM_PROMPT,
      prompt: buildListingPrompt(input, platforms),
    }));
  } catch (error) {
    console.error("generate-listing", error);
    await releaseSlot();
    await refundCredit();
    return NextResponse.json({ error: "La génération a échoué. Réessayez dans un instant." }, { status: 502 });
  }

  // Une génération = une ligne, donc une seule unité de quota ou un seul crédit, quel que soit le nombre de plateformes.
  const variants: ListingVariant[] = platforms.map((platform) => {
    const version = object.versions[platform] as ListingVersion;
    return { platform, title: version.title, description: formatListingBody(version) };
  });
  const [first] = variants as [ListingVariant, ...ListingVariant[]];

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      title: first.title,
      platform: first.platform,
      description: first.description,
      variants,
      price_suggested: input.rate ?? Math.max(0, object.priceSuggested),
    })
    .select("id, title, platform, description, price_suggested, variants, created_at")
    .single();

  // L'annonce enregistrée compte désormais dans le quota : la réservation est rendue.
  await releaseSlot();

  if (error || !listing) {
    await refundCredit();
    return NextResponse.json({ error: "Enregistrement de l'annonce impossible." }, { status: 500 });
  }
  await recordEvent("listing_generated", { platform: "multi" }, "/dashboard/listings");
  return NextResponse.json({ listing, credits: creditsLeft });
}
