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

/**
 * Où et comment publier. Les sites évoluent : les étapes restent générales et renvoient vers la page d'accueil du site.
 * Compléo ne publie rien à la place de l'utilisateur.
 */
export const PUBLISH_GUIDE: Partial<Record<Platform, { url: string; steps: string[] }>> = {
  leboncoin: {
    url: "https://www.leboncoin.fr",
    steps: [
      "Connectez-vous ou créez un compte gratuit sur LeBonCoin.",
      "Choisissez de déposer une annonce, dans la catégorie des services.",
      "Collez le titre et le texte, ajoutez une photo de vous ou de votre matériel, indiquez votre ville, puis validez.",
    ],
  },
  allovoisins: {
    url: "https://www.allovoisins.com",
    steps: [
      "Créez un compte gratuit sur AlloVoisins.",
      "Choisissez de proposer vos services, puis la catégorie qui correspond.",
      "Collez le titre et le texte, ajoutez votre zone d'intervention, puis publiez.",
    ],
  },
  gensdeconfiance: {
    url: "https://www.gensdeconfiance.com",
    steps: [
      "Connectez-vous ou créez un compte sur GensDeConfiance.",
      "Choisissez de publier une annonce de service.",
      "Collez le titre et le texte, complétez votre profil pour inspirer confiance, puis publiez.",
    ],
  },
};
