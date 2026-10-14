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

export interface City {
  slug: string;
  name: string;
  inseeCode: string;
  region: string;
  rank: number;
  population: { total: number; municipal: number };
  bassin: string;
  bmo: Record<string, Record<string, BmoFigures>>;
}

export interface CityDataset {
  sources: {
    population: { label: string; url: string; note: string };
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
