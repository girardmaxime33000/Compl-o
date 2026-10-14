import type { Platform } from "@/types/database";

export interface Option {
  id: string;
  label: string;
}

export const CATEGORIES: Option[] = [
  { id: "bricolage", label: "Bricolage & montage" },
  { id: "cours", label: "Soutien scolaire" },
  { id: "cours_langue", label: "Cours de langue" },
  { id: "coursier", label: "Livraison & courses" },
  { id: "animaux", label: "Garde d'animaux" },
  { id: "menage", label: "Ménage & repassage" },
  { id: "jardinage", label: "Jardinage" },
  { id: "informatique", label: "Aide informatique" },
  { id: "vente", label: "Dépôt-vente en ligne" },
];

export const EQUIPMENT: Option[] = [
  { id: "voiture", label: "Voiture" },
  { id: "velo", label: "Vélo / trottinette" },
  { id: "outils", label: "Caisse à outils (perceuse, tournevis…)" },
  { id: "outils_jardin", label: "Outils de jardin (tondeuse, taille-haie…)" },
  { id: "ordinateur", label: "Ordinateur" },
  { id: "menage", label: "Matériel de ménage (aspirateur, fer…)" },
  { id: "logement_animaux", label: "Jardin / logement adapté aux animaux" },
  { id: "smartphone", label: "Smartphone (photos)" },
];

export interface Activity {
  id: string;
  category: string;
  title: string;
  pitch: string;
  rateMin: number;
  rateMax: number;
  unit: string;
  platforms: Platform[];
  /** Au moins un de ces équipements est nécessaire (liste vide = aucun). */
  requiredAnyOf: string[];
  optional: string[];
  minHours: number;
  idealHours: number;
}

export const ACTIVITIES: Activity[] = [
  {
    id: "bricolage",
    category: "bricolage",
    title: "Petit bricolage à domicile",
    pitch: "Fixations, petites réparations, pose d'étagères et de luminaires.",
    rateMin: 20, rateMax: 35, unit: "h",
    platforms: ["allovoisins", "leboncoin", "taskrabbit"],
    requiredAnyOf: ["outils"], optional: ["voiture"], minHours: 3, idealHours: 8,
  },
  {
    id: "montage_meubles",
    category: "bricolage",
    title: "Montage de meubles",
    pitch: "Assemblage de meubles en kit, forfait à la pièce ou à l'heure.",
    rateMin: 18, rateMax: 28, unit: "h",
    platforms: ["taskrabbit", "allovoisins", "leboncoin"],
    requiredAnyOf: [], optional: ["outils"], minHours: 2, idealHours: 6,
  },
  {
    id: "soutien_scolaire",
    category: "cours",
    title: "Soutien scolaire à domicile",
    pitch: "Aide aux devoirs et remise à niveau, du primaire au lycée.",
    rateMin: 20, rateMax: 35, unit: "h",
    platforms: ["gensdeconfiance", "leboncoin", "allovoisins"],
    requiredAnyOf: [], optional: ["ordinateur", "voiture"], minHours: 2, idealHours: 6,
  },
  {
    id: "cours_langue",
    category: "cours_langue",
    title: "Cours de langue particuliers",
    pitch: "Conversation et préparation aux examens, en présentiel ou en visio.",
    rateMin: 25, rateMax: 40, unit: "h",
    platforms: ["gensdeconfiance", "leboncoin"],
    requiredAnyOf: [], optional: ["ordinateur"], minHours: 2, idealHours: 5,
  },
  {
    id: "coursier",
    category: "coursier",
    title: "Courses et livraisons pour particuliers",
    pitch: "Courses, colis, démarches : un service de proximité flexible.",
    rateMin: 15, rateMax: 22, unit: "h",
    platforms: ["allovoisins", "taskrabbit", "leboncoin"],
    requiredAnyOf: ["voiture", "velo"], optional: ["smartphone"], minHours: 3, idealHours: 10,
  },
  {
    id: "garde_animaux",
    category: "animaux",
    title: "Promenade et garde d'animaux",
    pitch: "Promenades, visites à domicile et garde pendant les vacances.",
    rateMin: 12, rateMax: 20, unit: "visite",
    platforms: ["allovoisins", "gensdeconfiance"],
    requiredAnyOf: [], optional: ["logement_animaux", "voiture"], minHours: 3, idealHours: 8,
  },
  {
    id: "menage",
    category: "menage",
    title: "Ménage et repassage",
    pitch: "Entretien régulier ou ponctuel du logement, repassage.",
    rateMin: 14, rateMax: 22, unit: "h",
    platforms: ["allovoisins", "taskrabbit", "leboncoin"],
    requiredAnyOf: [], optional: ["menage", "voiture"], minHours: 4, idealHours: 12,
  },
  {
    id: "jardinage",
    category: "jardinage",
    title: "Entretien de jardin",
    pitch: "Tonte, taille de haies, désherbage et petits travaux extérieurs.",
    rateMin: 20, rateMax: 32, unit: "h",
    platforms: ["allovoisins", "leboncoin", "taskrabbit"],
    requiredAnyOf: ["outils_jardin"], optional: ["voiture"], minHours: 3, idealHours: 8,
  },
  {
    id: "aide_informatique",
    category: "informatique",
    title: "Dépannage et initiation informatique",
    pitch: "Installation, dépannage et prise en main pour particuliers et seniors.",
    rateMin: 25, rateMax: 45, unit: "h",
    platforms: ["allovoisins", "gensdeconfiance", "leboncoin"],
    requiredAnyOf: ["ordinateur"], optional: ["voiture"], minHours: 2, idealHours: 6,
  },
  {
    id: "depot_vente",
    category: "vente",
    title: "Dépôt-vente de vêtements et objets",
    pitch: "Vendre pour le compte de proches ou de voisins contre commission.",
    rateMin: 10, rateMax: 30, unit: "article vendu",
    platforms: ["vinted", "leboncoin"],
    requiredAnyOf: ["smartphone"], optional: ["voiture"], minHours: 2, idealHours: 6,
  },
];

export interface DiagnosticInput {
  categories: string[];
  equipment: string[];
  weeklyHours: number;
}

export interface Recommendation {
  activity: Activity;
  score: number;
  /** Revenu mensuel indicatif (€) pour le temps disponible, fourchette basse et haute. */
  monthlyMin: number;
  monthlyMax: number;
  missingEquipment: string[];
}

const WEEKS_PER_MONTH = 4;
/** Part du temps disponible réellement facturable (démarchage, trajets, annulations). */
const BILLABLE_RATIO = 0.6;

/** Chiffre d'affaires mensuel indicatif (€) d'une activité pour un nombre d'heures par semaine. */
export function monthlyIncomeRange(activity: Activity, weeklyHours: number) {
  const billable = Math.max(0, weeklyHours) * WEEKS_PER_MONTH * BILLABLE_RATIO;
  return {
    monthlyMin: Math.round((billable * activity.rateMin) / 10) * 10,
    monthlyMax: Math.round((billable * activity.rateMax) / 10) * 10,
  };
}

/** Slug d'URL d'une activité (identifiant sans underscore). */
export const activitySlug = (a: Activity) => a.id.replace(/_/g, "-");
export const findActivityBySlug = (slug: string) => ACTIVITIES.find((a) => activitySlug(a) === slug);

/**
 * Régime déclaratif indicatif d'une catégorie (BNC : cours, conseil, informatique ; BIC : services artisanaux,
 * commerciaux et vente), d'après les repères du simulateur. À vérifier sur autoentrepreneur.urssaf.fr.
 */
const BNC_CATEGORIES = ["cours", "cours_langue", "informatique"];
export const regimeOf = (a: Activity): "bnc" | "bic" => (BNC_CATEGORIES.includes(a.category) ? "bnc" : "bic");

/** Activités proches : même catégorie d'abord, puis plateformes en commun. */
export function relatedActivities(activity: Activity, count = 3): Activity[] {
  const score = (a: Activity) =>
    (a.category === activity.category ? 10 : 0) + a.platforms.filter((p) => activity.platforms.includes(p)).length;
  return ACTIVITIES.filter((a) => a.id !== activity.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}

export function recommend(input: DiagnosticInput, count = 3): Recommendation[] {
  const hours = Math.max(0, input.weeklyHours);

  const scored = ACTIVITIES.map((activity): Recommendation => {
    let score = 0;
    if (input.categories.includes(activity.category)) score += 50;

    const hasRequired =
      activity.requiredAnyOf.length === 0 || activity.requiredAnyOf.some((e) => input.equipment.includes(e));
    score += hasRequired ? 30 : -25;

    const optionalOwned = activity.optional.filter((e) => input.equipment.includes(e)).length;
    if (activity.optional.length > 0) score += Math.round((optionalOwned / activity.optional.length) * 10);

    if (hours >= activity.minHours) score += hours >= activity.idealHours ? 10 : 6;
    else score -= 5;

    return {
      activity,
      score,
      ...monthlyIncomeRange(activity, hours),
      missingEquipment: hasRequired ? [] : activity.requiredAnyOf,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, count);
}

export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
export const equipmentLabel = (id: string) => EQUIPMENT.find((e) => e.id === id)?.label ?? id;
export const formatRate = (a: Activity) => `${a.rateMin} € à ${a.rateMax} €/${a.unit}`;
