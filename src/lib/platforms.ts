import type { Platform } from "@/types/database";

export type PlatformGroup = "services" | "quartier" | "transport" | "animaux" | "colis" | "troc" | "autre";

export interface PlatformInfo {
  label: string;
  /** Consigne de rédaction donnée au modèle pour ce site. */
  hint: string;
  group: PlatformGroup;
  /** Page d'accueil du site, sans chemin profond (les sites changent). Absente si non vérifiée. */
  url?: string;
  /** Point d'attention affiché à l'utilisateur avant et après la rédaction. */
  note?: string;
}

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  leboncoin: { label: "LeBonCoin", group: "quartier", url: "https://www.leboncoin.fr", hint: "Annonce de services locale, titre court et concret." },
  allovoisins: { label: "AlloVoisins", group: "services", url: "https://www.allovoisins.com", hint: "Ton chaleureux, proximité, entraide entre voisins." },
  gensdeconfiance: {
    label: "GensDeConfiance",
    group: "quartier",
    url: "https://www.gensdeconfiance.com",
    hint: "Mise en avant de la fiabilité et de la confiance.",
    note: "L'accès se fait par parrainage : il faut être invité par un membre.",
  },
  needhelp: { label: "NeedHelp", group: "services", url: "https://www.needhelp.com", hint: "Petits travaux, bricolage, assemblage de meubles, aménagement intérieur : décris le type de travaux, le matériel et la précision du travail." },
  yoojo: { label: "Yoojo", group: "services", url: "https://yoojo.fr", hint: "Services à la personne (ménage, bricolage, jardinage, garde d'enfants) : insiste sur le sérieux et la ponctualité. Ne promets ni assurance ni paiement particulier." },
  stootie: { label: "Stootie", group: "services", url: "https://stootie.com", hint: "Dépannages du quotidien, déménagements, petits travaux : annonce directe, disponibilités et rapidité d'intervention." },
  luludansmarue: {
    label: "Lulu dans ma rue",
    group: "services",
    hint: "Conciergerie de quartier : services du quotidien rendus aux habitants du quartier, ton simple et local.",
    note: "Service de quartier surtout présent à Paris et en région parisienne : vérifiez qu'il est actif près de chez vous.",
  },
  nextdoor: { label: "Nextdoor", group: "quartier", url: "https://nextdoor.com", hint: "Réseau social de quartier : message court et sympathique adressé aux voisins, comme une présentation, sans ton commercial." },
  pap: {
    label: "PAP",
    group: "quartier",
    url: "https://www.pap.fr",
    hint: "Annonce immobilière entre particuliers. N'invente aucune caractéristique du bien (surface, pièces, étage, loyer) : n'utilise que les informations fournies.",
    note: "Site réservé à l'immobilier entre particuliers : à choisir seulement pour vendre ou louer un logement, pas pour proposer un service.",
  },
  blablacar: {
    label: "BlaBlaCar",
    group: "transport",
    url: "https://www.blablacar.fr",
    hint: "Covoiturage moyenne et longue distance : texte de présentation du conducteur et du trajet, sans inventer d'horaire ni de prix.",
    note: "Site de trajets : l'annonce sert de présentation, pas de service à domicile.",
  },
  karos: {
    label: "Karos",
    group: "transport",
    url: "https://www.karos.fr",
    hint: "Covoiturage quotidien domicile-travail : présentation courte du trajet régulier, sans inventer d'horaire.",
    note: "Site de trajets domicile-travail : l'annonce sert de présentation.",
  },
  klaxit: {
    label: "Klaxit",
    group: "transport",
    url: "https://www.klaxit.com",
    hint: "Covoiturage quotidien domicile-travail : présentation courte du trajet régulier, sans inventer d'horaire.",
    note: "Site de trajets domicile-travail : l'annonce sert de présentation.",
  },
  getaround: {
    label: "Getaround",
    group: "transport",
    url: "https://getaround.com",
    hint: "Location de voiture entre particuliers : présente le véhicule uniquement avec les informations fournies, sans inventer modèle, année ni équipements.",
    note: "Pour proposer votre voiture à la location, pas pour offrir un service.",
  },
  animaute: { label: "Animaute", group: "animaux", url: "https://www.animaute.fr", hint: "Garde de chiens et de chats à domicile ou en famille d'accueil : présentation rassurante, habitudes de l'animal respectées. N'invente aucune formation ni validation." },
  holidog: { label: "Holidog", group: "animaux", url: "https://www.holidog.com", hint: "Garde de chiens et de chats à domicile ou chez le gardien : présentation rassurante, logement et disponibilités. N'invente aucune formation." },
  rover: { label: "Rover", group: "animaux", url: "https://www.rover.com", hint: "Gardien d'animaux et promeneur de chiens : présentation chaleureuse, lieu de garde et expérience réelle uniquement." },
  cocolis: {
    label: "Cocolis",
    group: "colis",
    url: "https://www.cocolis.fr",
    hint: "Transport de colis et d'objets encombrants lors d'un trajet que tu fais déjà : annonce précise sur le trajet, le véhicule et la taille transportable, sans inventer de date.",
    note: "Pour transporter des colis lors d'un trajet que vous faites déjà.",
  },
  jestocke: {
    label: "Jestocke",
    group: "colis",
    url: "https://www.jestocke.com",
    hint: "Location d'un espace de stockage entre particuliers (cave, garage, pièce libre) : décris l'espace uniquement avec les informations fournies, sans inventer surface ni prix.",
    note: "Pour louer un espace (cave, garage, pièce libre), pas pour offrir un service.",
  },
  ouistock: {
    label: "Ouistock",
    group: "colis",
    url: "https://www.ouistock.fr",
    hint: "Location d'un espace de stockage entre particuliers (cave, garage, pièce libre) : décris l'espace uniquement avec les informations fournies, sans inventer surface ni prix.",
    note: "Pour louer un espace (cave, garage, pièce libre), pas pour offrir un service.",
  },
  geev: {
    label: "Geev",
    group: "troc",
    url: "https://www.geev.com",
    hint: "Don d'objets ou de nourriture : annonce courte, état réel de l'objet, lieu de remise. Dans « pricing », écris que c'est gratuit. N'indique aucun prix.",
    note: "Réservé aux dons : l'annonce n'a pas de prix.",
  },
  trocservices: {
    label: "Troc-Services",
    group: "troc",
    url: "https://www.troc-services.com",
    hint: "Échange de services où le temps passé sert de monnaie : propose ce que tu sais faire et ce que tu aimerais recevoir en échange. Dans « pricing », parle de temps échangé, jamais d'euros.",
    note: "Les services s'échangent contre du temps passé : l'annonce n'a pas de prix en euros.",
  },
  vinted: { label: "Vinted", group: "autre", hint: "Dépôt-vente, photos, état des articles." },
  taskrabbit: { label: "Taskrabbit", group: "autre", hint: "Tâches ponctuelles, disponibilité et efficacité." },
};

export const PLATFORM_GROUPS: { id: Exclude<PlatformGroup, "autre">; label: string }[] = [
  { id: "services", label: "Bricolage, jardinage et services" },
  { id: "quartier", label: "Vie de quartier et petites annonces" },
  { id: "transport", label: "Transport et covoiturage" },
  { id: "animaux", label: "Garde d'animaux" },
  { id: "colis", label: "Colis et stockage" },
  { id: "troc", label: "Troc, don et économie circulaire" },
];

/** Plateformes proposées dans le générateur d'annonces (ordre d'affichage par groupe). */
export const GENERATOR_PLATFORMS = PLATFORM_GROUPS.flatMap((g) =>
  (Object.keys(PLATFORMS) as Platform[]).filter((p) => PLATFORMS[p].group === g.id),
) as [Platform, ...Platform[]];

/** Nombre maximal de plateformes pour une génération : borne la durée et le coût d'un appel au modèle. */
export const MAX_PLATFORMS_PER_LISTING = 5;

/** Sélection de départ quand l'activité n'est pas connue. */
export const DEFAULT_PLATFORMS: Platform[] = ["leboncoin", "allovoisins", "gensdeconfiance"];

/** Sites conseillés par domaine du diagnostic (identifiants de `CATEGORIES`). */
const SUGGESTED_BY_CATEGORY: Record<string, Platform[]> = {
  bricolage: ["allovoisins", "needhelp", "stootie", "leboncoin"],
  cours: ["gensdeconfiance", "leboncoin", "allovoisins"],
  cours_langue: ["gensdeconfiance", "leboncoin", "allovoisins"],
  coursier: ["stootie", "yoojo", "leboncoin"],
  animaux: ["animaute", "holidog", "rover"],
  menage: ["yoojo", "allovoisins", "leboncoin"],
  jardinage: ["allovoisins", "yoojo", "leboncoin"],
  informatique: ["allovoisins", "yoojo", "leboncoin"],
  vente: ["leboncoin", "nextdoor", "geev"],
};

export const suggestedPlatforms = (categoryId?: string): Platform[] =>
  (categoryId && SUGGESTED_BY_CATEGORY[categoryId]) || DEFAULT_PLATFORMS;

export const FREE_MONTHLY_LISTINGS = 2;

/** Plan mensuel : plafond d'annonces par jour (heure de Paris). L'annuel est illimité. */
export const MONTHLY_PLAN_DAILY_LISTINGS = 10;
/** Pack ponctuel : annonces créditées à l'achat. */
export const PACK_LISTING_CREDITS = 4;

const GROUP_STEPS: Record<PlatformGroup, [string, string]> = {
  services: ["Choisissez de proposer vos services, puis la catégorie qui correspond.", "Collez le titre et le texte, indiquez votre zone et vos tarifs, puis publiez."],
  quartier: ["Choisissez de déposer une annonce ou de publier un message.", "Collez le titre et le texte, ajoutez une photo, puis publiez."],
  transport: ["Renseignez votre profil, votre trajet ou votre véhicule, selon le site.", "Collez le texte dans la présentation ou la description. Ces sites fonctionnent surtout par formulaire."],
  animaux: ["Créez votre profil de gardien ou de promeneur.", "Collez le texte dans votre présentation, ajoutez des photos et vos tarifs, puis suivez les vérifications demandées par le site."],
  colis: ["Choisissez de proposer un trajet ou un espace, selon le site.", "Collez le texte dans la description, ajoutez des photos, puis publiez."],
  troc: ["Choisissez de publier une annonce de don ou d'échange.", "Collez le titre et le texte, ajoutez une photo, puis publiez."],
  autre: ["Choisissez de déposer une annonce.", "Collez le titre et le texte, ajoutez une photo, puis publiez."],
};

/**
 * Comment publier : étapes générales par type de site, car les sites changent. Compléo ne publie rien à la place de
 * l'utilisateur.
 */
export function publishSteps(platform: Platform): string[] {
  const { label, group } = PLATFORMS[platform];
  const [choose, paste] = GROUP_STEPS[group];
  return [`Connectez-vous ou créez un compte sur ${label}.`, choose, paste];
}
