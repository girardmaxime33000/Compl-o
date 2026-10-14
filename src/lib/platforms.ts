import type { Platform } from "@/types/database";

export const PLATFORMS: Record<Platform, { label: string; hint: string }> = {
  leboncoin: { label: "LeBonCoin", hint: "Annonce de services locale, titre court et concret." },
  allovoisins: { label: "AlloVoisins", hint: "Ton chaleureux, proximité, entraide entre voisins." },
  gensdeconfiance: { label: "GensDeConfiance", hint: "Mise en avant de la fiabilité et de la confiance." },
  vinted: { label: "Vinted", hint: "Dépôt-vente, photos, état des articles." },
  taskrabbit: { label: "Taskrabbit", hint: "Tâches ponctuelles, disponibilité et efficacité." },
};

/** Plateformes proposées dans le générateur d'annonces. */
export const GENERATOR_PLATFORMS: Platform[] = ["leboncoin", "allovoisins", "gensdeconfiance"];

export const FREE_MONTHLY_LISTINGS = 2;

/** Plan mensuel : plafond d'annonces par jour (heure de Paris). L'annuel est illimité. */
export const MONTHLY_PLAN_DAILY_LISTINGS = 10;
/** Pack ponctuel : annonces créditées à l'achat. */
export const PACK_LISTING_CREDITS = 4;
