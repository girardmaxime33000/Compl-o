import raw from "@/data/cities.json";
import { ACTIVITIES, activitySlug, type Activity } from "@/lib/activities";

/** Données villes générées par `scripts/build-city-data.py` (INSEE, France Travail BMO). Ne pas éditer à la main. */
export interface BmoFigures {
  met: number;
  xmet: number;
  smet: number;
  complete: { met: boolean; xmet: boolean; smet: boolean };
  metiersFound: number;
}

export interface InseeProfile {
  censusYear: number;
  incomeYear: number;
  under15: number;
  age15to24: number;
  age65plus: number;
  age80plus: number;
  houses: number;
  noCar: number;
  builtBefore1971: number;
  movedLessThan2y: number;
  medianIncome: number;
  povertyRate: number;
}

export interface City {
  slug: string;
  name: string;
  inseeCode: string;
  region: string;
  rank: number;
  population: { total: number; municipal: number };
  bassin: string;
  insee: InseeProfile;
  bmo: Record<string, Record<string, BmoFigures>>;
}

export interface CityDataset {
  sources: {
    population: { label: string; url: string; note: string };
    insee: { label: string; url: string; note: string };
    bmo: { label: string; url: string; note: string };
  };
  downloadedOn: string;
  years: number[];
  groups: Record<string, { label: string; metiers: { code: string; name: string }[] }>;
  cities: City[];
}

export const CITY_DATA = raw as unknown as CityDataset;
export const CITIES = CITY_DATA.cities;
const LATEST_YEAR = String(CITY_DATA.years[CITY_DATA.years.length - 1]);
const PREVIOUS_YEAR = String(CITY_DATA.years[CITY_DATA.years.length - 2]);
export const BMO_YEAR = LATEST_YEAR;
export const BMO_PREVIOUS_YEAR = PREVIOUS_YEAR;

export const findCity = (slug: string) => CITIES.find((c) => c.slug === slug);
export const bmoFor = (city: City, activity: Activity, year = LATEST_YEAR) => city.bmo[year]?.[activity.id];

/**
 * Une page activité × ville n'existe que si la ville a une donnée locale exploitable pour l'activité :
 * au moins un projet de recrutement dans les métiers rattachés, pour le dernier millésime BMO.
 */
export const hasLocalData = (city: City, activity: Activity) => (bmoFor(city, activity)?.met ?? 0) > 0;

export const CITY_ACTIVITY_PAIRS = CITIES.flatMap((city) =>
  ACTIVITIES.filter((a) => hasLocalData(city, a)).map((activity) => ({ city, activity })),
);

export const cityActivityPath = (city: City, activity: Activity) => `/activites/${activitySlug(activity)}/${city.slug}`;

export const citiesForActivity = (activity: Activity) => CITIES.filter((c) => hasLocalData(c, activity));
export const activitiesForCity = (city: City) => ACTIVITIES.filter((a) => hasLocalData(city, a));

/** Évolution en % entre les deux derniers millésimes, seulement si les deux totaux sont complets et non nuls. */
export function bmoEvolution(city: City, activity: Activity): number | null {
  const now = bmoFor(city, activity, LATEST_YEAR);
  const before = bmoFor(city, activity, PREVIOUS_YEAR);
  if (!now || !before || !now.complete.met || !before.complete.met || before.met <= 0) return null;
  return Math.round(((now.met - before.met) / before.met) * 100);
}

/** Villes proches pour le maillage : même région d'abord, puis rang de population voisin. */
export function neighbourCities(city: City, activity: Activity, count = 4): City[] {
  return citiesForActivity(activity)
    .filter((c) => c.slug !== city.slug)
    .sort((a, b) => {
      const ra = a.region === city.region ? 0 : 1;
      const rb = b.region === city.region ? 0 : 1;
      return ra - rb || Math.abs(a.rank - city.rank) - Math.abs(b.rank - city.rank);
    })
    .slice(0, count);
}

type IndicatorKey = Exclude<keyof InseeProfile, "censusYear" | "incomeYear">;

export const INDICATORS: Record<IndicatorKey, { label: string; unit: "%" | "€" }> = {
  under15: { label: "Part des moins de 15 ans", unit: "%" },
  age15to24: { label: "Part des 15-24 ans", unit: "%" },
  age65plus: { label: "Part des 65 ans et plus", unit: "%" },
  age80plus: { label: "Part des 80 ans et plus", unit: "%" },
  houses: { label: "Part de maisons parmi les logements", unit: "%" },
  noCar: { label: "Part des ménages sans voiture", unit: "%" },
  builtBefore1971: { label: "Résidences principales construites avant 1971", unit: "%" },
  movedLessThan2y: { label: "Ménages installés depuis moins de 2 ans", unit: "%" },
  medianIncome: { label: "Niveau de vie médian (par unité de consommation, par an)", unit: "€" },
  povertyRate: { label: "Taux de pauvreté (seuil à 60 % du niveau de vie médian)", unit: "%" },
};

/** Indicateurs INSEE mis en avant selon l'activité : repères factuels, sans lien de causalité affirmé. */
export const INDICATORS_BY_ACTIVITY: Record<string, IndicatorKey[]> = {
  bricolage: ["builtBefore1971", "houses", "movedLessThan2y"],
  montage_meubles: ["movedLessThan2y", "age15to24"],
  soutien_scolaire: ["under15", "age15to24"],
  cours_langue: ["age15to24", "medianIncome"],
  coursier: ["noCar", "age65plus"],
  garde_animaux: ["houses", "movedLessThan2y"],
  menage: ["age65plus", "medianIncome"],
  jardinage: ["houses", "age65plus"],
  aide_informatique: ["age65plus", "age80plus"],
  depot_vente: ["movedLessThan2y", "medianIncome"],
};

const mean = (key: IndicatorKey) => CITIES.reduce((sum, c) => sum + c.insee[key], 0) / CITIES.length;

/** Valeur de la ville et moyenne simple des 20 villes pour les indicateurs retenus pour l'activité. */
export function inseeRows(city: City, activity: Activity) {
  return (INDICATORS_BY_ACTIVITY[activity.id] ?? []).map((key) => ({
    key,
    ...INDICATORS[key],
    value: city.insee[key],
    average: mean(key),
  }));
}
