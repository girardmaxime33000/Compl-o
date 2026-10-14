/**
 * Paramètres micro-entreprise utilisés par le simulateur.
 * Valeurs de référence du cahier des charges : à vérifier chaque année sur autoentrepreneur.urssaf.fr.
 * Sources : autoentrepreneur.urssaf.fr, service-public.fr. Date de vérification : AUCUNE (valeurs non revérifiées
 * à ce jour, à faire par le propriétaire avant mise en production).
 */
export const TAX_PARAMS = {
  /** Taux de cotisations URSSAF sur le chiffre d'affaires. */
  urssafRate: { bnc: 0.211, bic: 0.212 },
  /** Abattement forfaitaire retenu par France Travail pour calculer le revenu d'activité. */
  areAbatement: { bnc: 0.34, bic: 0.5 },
  /** Part du revenu d'activité déduite de l'allocation ARE en cas de cumul. */
  areReductionRate: 0.7,
  vatThreshold: 36_800,
  microCeilingServices: 77_700,
  microCeilingSales: 188_700,
} as const;

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
