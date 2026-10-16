import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai";
import { GENERATOR_PLATFORMS } from "@/lib/platforms";
import { buildListingPrompt, formatListingBody, SYSTEM_PROMPT } from "@/lib/listing";
import type { ListingVariant } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQuota, quotaExhausted } from "@/lib/quota";
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
});

const versionSchema = z.object({
  title: z.string().describe("Titre accrocheur et optimisé SEO, 70 caractères maximum"),
  intro: z.string().describe("Une à deux phrases d'accroche"),
  advantages: z.array(z.string()).min(3).max(5).describe("Avantages pour le client"),
  skills: z.array(z.string()).min(3).max(5).describe("Compétences et expérience, sans inventer de diplôme"),
  pricing: z.string().describe("Tarif indicatif, ex. « À partir de 22 €/h, devis gratuit »"),
  callToAction: z.string().describe("Appel à l'action court"),
  hashtags: z.array(z.string()).length(3).describe("3 hashtags pertinents, sans espaces, commençant par #"),
});

const outputSchema = z.object({
  leboncoin: versionSchema,
  allovoisins: versionSchema,
  gensdeconfiance: versionSchema,
  priceSuggested: z.number().describe("Tarif horaire moyen suggéré en euros"),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  const input = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_plan")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });

  // Quota du plan (gratuit : mois, mensuel : jour, annuel : illimité), puis crédits du pack ponctuel.
  const quota = await getQuota(supabase, user.id, profile);
  let creditsLeft: number | undefined;
  let creditConsumed = false;
  if (quotaExhausted(quota)) {
    const { data: remaining, error: creditError } = await createAdminClient().rpc("consume_listing_credit", { p_user: user.id });
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

  const refundCredit = async () => {
    if (creditConsumed) await createAdminClient().rpc("grant_listing_credits", { p_user: user.id, p_amount: 1 });
  };

  let object: z.infer<typeof outputSchema>;
  try {
    ({ object } = await generateObject({
      model: getModel(),
      schema: outputSchema,
      system: SYSTEM_PROMPT,
      prompt: buildListingPrompt(input),
    }));
  } catch (error) {
    console.error("generate-listing", error);
    await refundCredit();
    return NextResponse.json({ error: "La génération a échoué. Réessayez dans un instant." }, { status: 502 });
  }

  // Une génération = une ligne, donc une seule unité de quota ou un seul crédit, quel que soit le nombre de plateformes.
  const variants: ListingVariant[] = GENERATOR_PLATFORMS.map((platform) => {
    const version = object[platform as "leboncoin" | "allovoisins" | "gensdeconfiance"];
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

  if (error || !listing) {
    await refundCredit();
    return NextResponse.json({ error: "Enregistrement de l'annonce impossible." }, { status: 500 });
  }
  await recordEvent("listing_generated", { platform: "multi" }, "/dashboard/listings");
  return NextResponse.json({ listing, credits: creditsLeft });
}
