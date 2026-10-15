import { getFiscalParams, type FiscalParams } from "@/lib/tax";
import type { Profile, UrbanActivity } from "@/lib/urban-activities";

/**
 * Règles métier du catalogue d'activités urbaines : calcul du net mensuel (R1), alerte TVA (R2), exclusivité SAP (R3),
 * message CMA (R4), rendu des annonces (R5). Aucun taux ni plafond ici : tout vient de `FISCAL_PARAMS_BY_YEAR` (tax.ts).
 * Les résultats sont des estimations indicatives, sans garantie de revenu.
 */

export interface ComputeOptions {
  /** Option ACRE : date de début d'activité (AAAA-MM-JJ). Absent = pas d'ACRE. */
  acre?: { startDate: string };
  /** Année des paramètres fiscaux (défaut : année courante du catalogue). */
  year?: number;
}

export interface NetIncomeResult {
  billedHours: number;
  revenue: number;
  /** Cotisations sociales (après ACRE le cas échéant) + contribution formation professionnelle. */
  contributions: number;
  operatingCosts: number;
  /** Précision conservée (à stocker). */
  netIncome: number;
  /** Arrondi à la dizaine d'euros (à afficher). */
  netDisplay: number;
  /** Composition du CA composite, si `revenueOverride`. */
  composition?: string;
}

/** Arrondi d'affichage à la dizaine d'euros. */
export const roundToTen = (n: number) => Math.round(n / 10) * 10;

/** Coefficient ACRE appliqué aux cotisations sociales (la contribution formation n'est pas réduite). */
export function acreShare(startDate: string, params: FiscalParams): number {
  return startDate < params.acre.changeDate
    ? params.acre.reducedRateShareBefore20260701
    : params.acre.reducedRateShareFrom20260701;
}

/** Heures facturées par mois d'un profil. */
export const billedHoursPerMonth = (profile: Profile, params: FiscalParams) =>
  params.profiles[profile].billedHoursPerWeek * params.weeksPerMonth;

/** Chiffre d'affaires mensuel d'une fiche pour un profil (calcul horaire, ou CA composite `revenueOverride`). */
export function monthlyRevenue(activity: UrbanActivity, profile: Profile, params: FiscalParams): { revenue: number; billedHours: number; composition?: string } {
  const override = activity.revenueOverride?.[profile];
  if (override) return { revenue: override.revenue, billedHours: 0, composition: override.composition };
  const rate = activity.effectiveHourlyRate?.[profile];
  if (rate === undefined) throw new Error(`Fiche « ${activity.slug} » sans taux horaire effectif ni CA composite : calcul impossible`);
  const billedHours = billedHoursPerMonth(profile, params);
  return { revenue: billedHours * rate, billedHours };
}

/** R1 : revenu net mensuel estimé (CA − cotisations − charges d'exploitation). */
export function computeMonthlyNetIncome(activity: UrbanActivity, profile: Profile, options: ComputeOptions = {}): NetIncomeResult {
  const params = getFiscalParams(options.year);
  const costs = activity.monthlyOperatingCosts?.[profile];
  if (costs === undefined) throw new Error(`Fiche « ${activity.slug} » sans charges d'exploitation : calcul impossible`);
  const { revenue, billedHours, composition } = monthlyRevenue(activity, profile, params);

  const social = params.socialContributionRates[activity.taxCategory] * (options.acre ? acreShare(options.acre.startDate, params) : 1);
  const training = params.trainingContributionRates[activity.cfpCategory];
  const contributions = revenue * (social + training);
  const netIncome = revenue - contributions - costs;
  return { billedHours, revenue, contributions, operatingCosts: costs, netIncome, netDisplay: roundToTen(netIncome), composition };
}

export interface Selection { activity: UrbanActivity; profile: Profile }

export interface VatAlert {
  triggered: boolean;
  /** CA annuel cumulé des prestations de services (BIC services et BNC). */
  annualServicesRevenue: number;
  /** Seuil d'avertissement (part du seuil de franchise). */
  alertThreshold: number;
  franchiseThreshold: number;
}

/** R2 : alerte dès que le CA annuel de services (cumulé sur toutes les activités) atteint 90 % du seuil de franchise de TVA. */
export function vatAlert(selections: Selection[], year?: number): VatAlert {
  const params = getFiscalParams(year);
  const annualServicesRevenue = selections
    .filter(({ activity }) => activity.taxCategory !== "BIC_SALES")
    .reduce((sum, { activity, profile }) => sum + monthlyRevenue(activity, profile, params).revenue * 12, 0);
  const alertThreshold = params.vatFranchiseThresholdServices * params.vatAlertShare;
  return {
    triggered: annualServicesRevenue >= alertThreshold,
    annualServicesRevenue,
    alertThreshold,
    franchiseThreshold: params.vatFranchiseThresholdServices,
  };
}

export const SAP_CONFLICT_MESSAGE =
  "Vous combinez une activité éligible au crédit d'impôt services à la personne et une activité non éligible. Pour faire bénéficier vos clients du crédit d'impôt de 50 %, votre entreprise doit exercer uniquement des activités de services à la personne.";

/** R3 : au moins une activité éligible SAP et au moins une non éligible. */
export function hasSapConflict(activities: Pick<UrbanActivity, "sapEligibility">[]): boolean {
  return activities.some((a) => a.sapEligibility !== "NONE") && activities.some((a) => a.sapEligibility === "NONE");
}

export const CMA_NOTICE =
  "La qualification exigée pour la réparation de cycles fait l'objet d'interprétations divergentes. Vérifiez auprès de la Chambre de métiers et de l'artisanat de votre département avant immatriculation.";

const CMA_CHECK_SLUGS = new Set(["reparation-velo-trottinette-domicile"]);

/** R4 : message à afficher dans le parcours de création, uniquement pour la réparation de cycles. */
export const cmaNotice = (activity: Pick<UrbanActivity, "slug">): string | null => (CMA_CHECK_SLUGS.has(activity.slug) ? CMA_NOTICE : null);

export const AD_LENGTH = { min: 250, max: 320 } as const;

const formatAdNumber = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);

export interface AdOptions {
  /** Valeurs des variables saisies par le candidat (`quartier`, `prix_horaire`...). Les prix absents prennent la valeur par défaut de la fiche. */
  values?: Record<string, string | number>;
  /** Le candidat est déclaré SAP. */
  sapDeclared?: boolean;
  /** Toutes les activités sélectionnées par le candidat (pour R3). Défaut : la seule activité de l'annonce. */
  selection?: Pick<UrbanActivity, "sapEligibility">[];
  year?: number;
}

export interface RenderedAd { text: string; length: number; lengthOk: boolean; sapSegmentKept: boolean }

/** Valeur par défaut d'une variable tarifaire, lue dans la grille de la fiche. */
function defaultValue(activity: UrbanActivity, variable: string): number | undefined {
  const source = activity.adVariableDefaults?.[variable];
  if (!source) return undefined;
  return activity.pricing.find((p) => p.label === source.priceLabel)?.[source.field];
}

/**
 * R5 : rend l'annonce. Les segments `{{sap}}…{{/sap}}` ne sont conservés que si le candidat est déclaré SAP, que la fiche
 * est éligible et qu'aucun conflit R3 n'existe ; sinon ils sont supprimés, ainsi que toute mention de crédit d'impôt.
 */
export function renderAd(activity: UrbanActivity, options: AdOptions = {}): RenderedAd {
  if (!activity.adTemplate) throw new Error(`Fiche « ${activity.slug} » sans modèle d'annonce`);
  const params = getFiscalParams(options.year);
  const selection = options.selection ?? [activity];
  const sapSegmentKept = !!options.sapDeclared && activity.sapEligibility !== "NONE" && !hasSapConflict(selection);

  let text = activity.adTemplate.replace(/\{\{sap\}\}([\s\S]*?)\{\{\/sap\}\}/g, (_m, inner: string) => (sapSegmentKept ? inner : ""));

  const values: Record<string, string | number | undefined> = { ...options.values };
  for (const variable of activity.adTemplateVariables ?? []) values[variable] ??= defaultValue(activity, variable);
  if (values.prix_net_sap === undefined && typeof values.prix_horaire === "number") {
    values.prix_net_sap = values.prix_horaire * (1 - params.sapTaxCredit.rate);
  }

  text = text.replace(/\[(\w+)\]/g, (_m, variable: string) => {
    const value = values[variable];
    if (value === undefined || value === "") {
      // Une variable exclusivement utilisée dans un segment SAP retiré n'apparaît plus dans le texte ; ici elle est requise.
      throw new Error(`Variable d'annonce manquante : ${variable}`);
    }
    return typeof value === "number" ? formatAdNumber(value) : value;
  });

  const length = text.length;
  return { text, length, lengthOk: length >= AD_LENGTH.min && length <= AD_LENGTH.max, sapSegmentKept };
}
