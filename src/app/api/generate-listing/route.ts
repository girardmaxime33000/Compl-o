import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai";
import { FREE_MONTHLY_LISTINGS, PLATFORMS } from "@/lib/platforms";

export const maxDuration = 60;

const requestSchema = z.object({
  service: z.string().trim().min(3).max(120),
  city: z.string().trim().min(2).max(80),
  platform: z.enum(["leboncoin", "allovoisins", "gensdeconfiance"]),
});

const outputSchema = z.object({
  title: z.string().describe("Titre accrocheur et optimisé SEO, 70 caractères maximum"),
  intro: z.string().describe("Une à deux phrases d'accroche"),
  advantages: z.array(z.string()).min(3).max(5).describe("Avantages pour le client"),
  skills: z.array(z.string()).min(3).max(5).describe("Compétences et expérience, sans inventer de diplôme"),
  pricing: z.string().describe("Tarif indicatif, ex. « À partir de 22 €/h, devis gratuit »"),
  callToAction: z.string().describe("Appel à l'action court"),
  hashtags: z.array(z.string()).length(3).describe("3 hashtags pertinents, sans espaces, commençant par #"),
  priceSuggested: z.number().describe("Tarif horaire moyen suggéré en euros"),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  const { service, city, platform } = parsed.data;

  const { data: profile } = await supabase.from("profiles").select("subscription_status").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });

  if (profile.subscription_status !== "active") {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());
    if ((count ?? 0) >= FREE_MONTHLY_LISTINGS) {
      return NextResponse.json(
        { error: `Limite de ${FREE_MONTHLY_LISTINGS} annonces par mois atteinte. Passez Premium pour en générer sans limite.`, code: "LIMIT_REACHED" },
        { status: 403 },
      );
    }
  }

  let object: z.infer<typeof outputSchema>;
  try {
    ({ object } = await generateObject({
      model: getModel(),
      schema: outputSchema,
      system:
        "Tu rédiges des annonces de services pour des particuliers français qui débutent une micro-activité. " +
        "Écris en français, avec un ton honnête et professionnel. N'invente ni diplôme, ni certification, ni avis clients, " +
        "ni numéro SIRET. Les tarifs doivent rester réalistes pour le marché français.",
      prompt:
        `Service : ${service}\nVille : ${city}\nPlateforme : ${PLATFORMS[platform].label} (${PLATFORMS[platform].hint})\n` +
        "Rédige l'annonce optimisée pour cette plateforme.",
    }));
  } catch (error) {
    console.error("generate-listing", error);
    return NextResponse.json({ error: "La génération a échoué. Réessayez dans un instant." }, { status: 502 });
  }

  const body = [
    object.intro,
    `Mes avantages :\n${object.advantages.map((a) => `• ${a}`).join("\n")}`,
    `Mes compétences :\n${object.skills.map((s) => `• ${s}`).join("\n")}`,
    `Tarifs : ${object.pricing}`,
    object.callToAction,
    object.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "),
  ].join("\n\n");

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      title: object.title,
      platform,
      description: body,
      price_suggested: Math.max(0, object.priceSuggested),
    })
    .select("id, title, platform, description, price_suggested, created_at")
    .single();

  if (error || !listing) return NextResponse.json({ error: "Enregistrement de l'annonce impossible." }, { status: 500 });
  return NextResponse.json({ listing });
}
