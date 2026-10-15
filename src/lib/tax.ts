/**
 * Paramètres micro-entrepreneur utilisés par le simulateur et les guides.
 * Sources officielles (fiches Entreprendre Service Public), dates "Vérifié le" de chaque fiche :
 * - Micro-social, taux et plafonds 2026 : https://entreprendre.service-public.gouv.fr/vosdroits/F37353 (vérifié le 21 février 2026)
 * - Franchise en base de TVA 2026 : https://entreprendre.service-public.gouv.fr/vosdroits/F21746 (vérifié le 1er janvier 2026)
 * - Cumul ARE et création d'entreprise : https://entreprendre.service-public.gouv.fr/vosdroits/F36613 (vérifié le 29 septembre 2026)
 * - Arce : https://entreprendre.service-public.gouv.fr/vosdroits/F15252 (vérifié le 13 août 2026)
 * - Retraité et micro-entrepreneur : https://entreprendre.service-public.gouv.fr/vosdroits/F36611 (vérifié le 1er janvier 2026)
 * - Devis obligatoire : https://entreprendre.service-public.gouv.fr/vosdroits/F31144 (vérifié le 9 septembre 2022)
 * Dernière relecture de ces valeurs dans le code : 15 octobre 2026. À revérifier chaque 1er janvier.
 */
export const TAX_PARAMS = {
  /** Taux de cotisations micro-social 2026 sur le chiffre d'affaires encaissé (services BIC, professions libérales non réglementées). */
  urssafRate: { bnc: 0.256, bic: 0.212 },
  /** Autres taux micro-social 2026. */
  urssafRateSales: 0.123,
  urssafRateCipav: 0.232,
  /** Abattement forfaitaire retenu par France Travail pour calculer le revenu d'activité. */
  areAbatement: { bnc: 0.34, bic: 0.5 },
  areAbatementSales: 0.71,
  /** Part du revenu d'activité déduite de l'allocation ARE en cas de cumul. */
  areReductionRate: 0.7,
  /** Cumul ARE : plafond en part des droits ARE restants à la création. Arce : part versée en capital. */
  areCumulCapShare: 0.6,
  arceShare: 0.6,
  /** Franchise en base de TVA 2026 : prestations de services et professions libérales (hors avocat). */
  vatThreshold: 37_500,
  vatThresholdMajored: 41_250,
  /** Franchise en base de TVA 2026 : activités commerciales et hébergement. */
  vatThresholdSales: 85_000,
  vatThresholdSalesMajored: 93_500,
  /** Plafonds de chiffre d'affaires du régime micro, année 2026. */
  microCeilingServices: 83_600,
  microCeilingSales: 203_100,
  /** Cumul emploi-retraite plafonné : plafonds annuels pensions + revenus. */
  retireeCapCnav: 24_030,
  retireeCapCnavpl: 48_060,
  /** Devis : seuil mensuel TTC au-delà duquel il est obligatoire pour les services à la personne, et amendes maximales. */
  quoteHomeServicesThreshold: 100,
  quoteFineIndividual: 3_000,
  quoteFineCompany: 15_000,
} as const;

/**
 * Paramètres fiscaux versionnés par année, utilisés par le catalogue d'activités urbaines (`urban-income.ts`).
 * Les taux déjà présents dans `TAX_PARAMS` en sont repris (source unique). Les autres valeurs (cotisation formation
 * professionnelle, ACRE, crédit d'impôt SAP, plafonds par sous-activité SAP) ont été fournies par le propriétaire
 * le 15 octobre 2026 et NE SONT PAS encore rapprochées d'une fiche officielle : à vérifier sur urssaf.fr et
 * service-public.fr avant toute mise en avant. Procédure annuelle : ajouter une entrée pour l'année suivante, ne
 * jamais modifier l'année passée (voir README, section « Catalogue des activités urbaines »).
 */
export interface FiscalParams {
  year: number;
  socialContributionRates: { BIC_SERVICES: number; BIC_SALES: number; BNC_SSI: number };
  trainingContributionRates: { COMMERCE: number; ARTISANAT: number; LIBERAL: number };
  microRevenueCeilingServices: number;
  vatFranchiseThresholdServices: number;
  vatFranchiseThresholdServicesIncreased: number;
  /** Part de l'alerte de TVA : avertissement dès que le CA annuel atteint cette part du seuil de franchise (règle R2). */
  vatAlertShare: number;
  /** ACRE : part du taux normal de cotisations restant due, selon la date de début d'activité. */
  acre: { reducedRateShareBefore20260701: number; reducedRateShareFrom20260701: number; changeDate: string };
  sapTaxCredit: {
    rate: number;
    subCeilings: {
      SMALL_DIY: { annualCap: number; maxInterventionHours: number };
      IT_ASSISTANCE: { annualCap: number };
      SMALL_GARDENING: { annualCap: number };
    };
  };
  weeksPerMonth: number;
  profiles: { OCCASIONAL: { billedHoursPerWeek: number }; REGULAR: { billedHoursPerWeek: number } };
}

export const FISCAL_PARAMS_BY_YEAR: Record<number, FiscalParams> = {
  2026: {
    year: 2026,
    socialContributionRates: {
      BIC_SERVICES: TAX_PARAMS.urssafRate.bic,
      BIC_SALES: TAX_PARAMS.urssafRateSales,
      BNC_SSI: TAX_PARAMS.urssafRate.bnc,
    },
    trainingContributionRates: { COMMERCE: 0.001, ARTISANAT: 0.003, LIBERAL: 0.002 },
    microRevenueCeilingServices: TAX_PARAMS.microCeilingServices,
    vatFranchiseThresholdServices: TAX_PARAMS.vatThreshold,
    vatFranchiseThresholdServicesIncreased: TAX_PARAMS.vatThresholdMajored,
    vatAlertShare: 0.9,
    acre: { reducedRateShareBefore20260701: 0.5, reducedRateShareFrom20260701: 0.75, changeDate: "2026-07-01" },
    sapTaxCredit: {
      rate: 0.5,
      subCeilings: {
        SMALL_DIY: { annualCap: 500, maxInterventionHours: 2 },
        IT_ASSISTANCE: { annualCap: 3000 },
        SMALL_GARDENING: { annualCap: 5000 },
      },
    },
    weeksPerMonth: 4.33,
    profiles: { OCCASIONAL: { billedHoursPerWeek: 4 }, REGULAR: { billedHoursPerWeek: 12 } },
  },
};

export const CURRENT_FISCAL_YEAR = 2026;

export function getFiscalParams(year: number = CURRENT_FISCAL_YEAR): FiscalParams {
  const params = FISCAL_PARAMS_BY_YEAR[year];
  if (!params) throw new Error(`Paramètres fiscaux ${year} absents de FISCAL_PARAMS_BY_YEAR`);
  return params;
}

export type ActivityRegime = "bnc" | "bic";

export interface SimulatorInput {
  monthlyRevenue: number;
  regime: ActivityRegime;
  unemployment?: {
    enabled: boolean;
    monthlyAre: number;
    /** Ancien salaire mensuel de référence : plafonne le cumul ARE + revenus. 0 = non renseigné. */
    referenceSalary: number;
  };
}

export type AlertLevel = "ok" | "warning" | "danger";

export interface ThresholdAlert {
  id: "vat" | "micro";
  level: AlertLevel;
  label: string;
  message: string;
  annualRevenue: number;
  threshold: number;
  /** Part du plafond atteinte (0 à 1+). */
  ratio: number;
}

export interface UnemploymentResult {
  retainedIncome: number;
  areReduction: number;
  areAfterCumul: number;
  totalMonthly: number;
  capped: boolean;
}

export interface SimulatorResult {
  monthlyRevenue: number;
  urssaf: number;
  urssafRate: number;
  netMonthly: number;
  netAnnual: number;
  annualRevenue: number;
  alerts: ThresholdAlert[];
  unemployment: UnemploymentResult | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

function level(ratio: number): AlertLevel {
  if (ratio >= 1) return "danger";
  if (ratio >= 0.8) return "warning";
  return "ok";
}

function thresholdAlert(
  id: ThresholdAlert["id"],
  label: string,
  annualRevenue: number,
  threshold: number,
  exceededMsg: string,
  closeMsg: string,
  okMsg: string,
): ThresholdAlert {
  const ratio = annualRevenue / threshold;
  const lvl = level(ratio);
  const message = lvl === "danger" ? exceededMsg : lvl === "warning" ? closeMsg : okMsg;
  return { id, label, message, annualRevenue, threshold, ratio, level: lvl };
}

export function simulate(input: SimulatorInput): SimulatorResult {
  const monthlyRevenue = Math.max(0, input.monthlyRevenue || 0);
  const urssafRate = TAX_PARAMS.urssafRate[input.regime];
  const urssaf = round2(monthlyRevenue * urssafRate);
  const netMonthly = round2(monthlyRevenue - urssaf);
  const annualRevenue = round2(monthlyRevenue * 12);

  const { vatThreshold, microCeilingServices } = TAX_PARAMS;
  const alerts: ThresholdAlert[] = [
    thresholdAlert(
      "vat",
      "Franchise de TVA",
      annualRevenue,
      vatThreshold,
      `Au-delà de ${fmt(vatThreshold)} € par an, vous devez facturer la TVA. Les mentions de vos factures changent.`,
      `Vous approchez du seuil de franchise de TVA (${fmt(vatThreshold)} € par an).`,
      `Sous le seuil de ${fmt(vatThreshold)} € par an : pas de TVA à facturer.`,
    ),
    thresholdAlert(
      "micro",
      "Plafond micro-entrepreneur",
      annualRevenue,
      microCeilingServices,
      `Plafond de ${fmt(microCeilingServices)} € par an dépassé : sortie du régime micro (prestations de services).`,
      `Vous approchez du plafond micro-entrepreneur de ${fmt(microCeilingServices)} € par an (prestations de services).`,
      `Sous le plafond de ${fmt(microCeilingServices)} € par an (${fmt(TAX_PARAMS.microCeilingSales)} € pour la vente de marchandises).`,
    ),
  ];

  let unemployment: UnemploymentResult | null = null;
  if (input.unemployment?.enabled) {
    const { monthlyAre, referenceSalary } = input.unemployment;
    const are = Math.max(0, monthlyAre || 0);
    const retainedIncome = round2(monthlyRevenue * (1 - TAX_PARAMS.areAbatement[input.regime]));
    const areReduction = Math.min(are, round2(retainedIncome * TAX_PARAMS.areReductionRate));
    let areAfterCumul = round2(are - areReduction);
    let capped = false;
    if (referenceSalary > 0 && areAfterCumul + retainedIncome > referenceSalary) {
      areAfterCumul = Math.max(0, round2(referenceSalary - retainedIncome));
      capped = true;
    }
    unemployment = {
      retainedIncome,
      areReduction,
      areAfterCumul,
      totalMonthly: round2(areAfterCumul + netMonthly),
      capped,
    };
  }

  return { monthlyRevenue, urssaf, urssafRate, netMonthly, netAnnual: round2(netMonthly * 12), annualRevenue, alerts, unemployment };
}

export const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
