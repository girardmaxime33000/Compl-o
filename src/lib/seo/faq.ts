import {
  ACTIVITIES, equipmentLabel, formatRate, monthlyIncomeRange, regimeOf, type Activity,
} from "@/lib/activities";
import {
  activitiesForCity, BMO_PREVIOUS_YEAR, BMO_YEAR, bmoEvolution, bmoFor, CITIES, CITY_DATA, inseeRows,
  type City,
} from "@/lib/cities";
import { FREE_MONTHLY_LISTINGS, MONTHLY_PLAN_DAILY_LISTINGS, PACK_LISTING_CREDITS, PLATFORMS } from "@/lib/platforms";
import { formatCents, OFFERS } from "@/lib/offers";
import { simulate, TAX_PARAMS } from "@/lib/tax";
import type { FaqItem } from "@/lib/seo/jsonld";

/**
 * Contenus de FAQ : fonctions pures. Chaque réponse est affichée telle quelle sur la page (le JSON-LD `FAQPage`
 * reprend le contenu visible). Les chiffres viennent de `tax.ts`, `activities.ts`, `offers.ts` et `cities.ts`.
 */

const nf = new Intl.NumberFormat("fr-FR");
const pct = (rate: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(rate * 100)} %`;
const eurInt = (n: number) => `${nf.format(Math.round(n))} €`;
const pick = <T,>(variants: T[], seed: number): T => variants[Math.abs(seed) % variants.length] as T;

const REGIME_LABEL = { bnc: "BNC", bic: "BIC" } as const;

export function homeFaq(): FaqItem[] {
  const { bnc, bic } = TAX_PARAMS.urssafRate;
  return [
    {
      question: "Le diagnostic est-il vraiment gratuit ?",
      answer: `Oui. Le diagnostic d'activité se fait sans inscription ni carte bancaire, et le simulateur « Net dans la poche » est accessible sans compte. Avec un compte gratuit, vous disposez de ${FREE_MONTHLY_LISTINGS} annonces rédigées par IA par mois et de devis et factures PDF sans TVA.`,
    },
    {
      question: "Combien peut-on gagner avec une micro-activité ?",
      answer: `Cela dépend de l'activité, de votre temps disponible et de votre clientèle. Compléo affiche pour chaque activité un tarif moyen et un chiffre d'affaires mensuel estimé selon vos heures par semaine (60 % du temps est considéré comme facturable). Ce sont des estimations selon profil et temps disponible, sans garantie de revenu.`,
    },
    {
      question: "Dois-je créer une micro-entreprise ?",
      answer: "Une activité de services rémunérée, exercée de façon régulière, relève en principe d'une déclaration d'activité, et le régime de la micro-entreprise est l'option la plus courante pour un complément de revenu. Votre situation (statut, cumul avec un emploi, le chômage ou une retraite) peut changer la réponse : vérifiez-la sur entreprendre.service-public.fr et autoentrepreneur.urssaf.fr.",
    },
    {
      question: "Comment est calculé le net après cotisations ?",
      answer: `Le simulateur applique les taux de cotisations du micro-social en vigueur en 2026 au chiffre d'affaires encaissé : ${pct(bic)} pour les prestations de services commerciales ou artisanales (BIC) et ${pct(bnc)} pour les professions libérales non réglementées (BNC). Le résultat est un net avant impôt sur le revenu, à titre indicatif.`,
    },
    {
      question: "D'où viennent les données locales des pages ville ?",
      answer: `Les pages par ville s'appuient sur des données ouvertes : l'enquête Besoins en main-d'œuvre de France Travail (${CITY_DATA.years.join(" et ")}) et les statistiques de l'INSEE (recensement, revenus). Elles couvrent ${CITIES.length} villes ; une page n'existe que si une donnée locale est disponible pour l'activité. Données téléchargées le ${CITY_DATA.downloadedOn}.`,
    },
    {
      question: "Les annonces générées par l'IA sont-elles prêtes à publier ?",
      answer: "Non, elles sont à relire avant publication. L'IA propose un titre, un texte structuré et des hashtags à partir de votre service, de votre ville et de la plateforme visée ; vous restez responsable du contenu publié, qui doit refléter vos compétences réelles.",
    },
    {
      question: "Que comprennent les offres payantes ?",
      answer: `Trois offres complètent l'offre gratuite : un pack ponctuel de ${PACK_LISTING_CREDITS} annonces à ${formatCents(OFFERS.pack.cents)} €, un pack mensuel jusqu'à ${MONTHLY_PLAN_DAILY_LISTINGS} annonces par jour à ${formatCents(OFFERS.monthly.cents)} € par mois, et un abonnement annuel d'annonces illimitées à ${formatCents(OFFERS.annual.cents)} € par an. Le détail figure sur la page Tarifs.`,
    },
  ];
}

export function pricingFaq(): FaqItem[] {
  return [
    {
      question: "Que comprend l'offre gratuite ?",
      answer: `Le diagnostic d'activité, le simulateur « Net dans la poche », les devis et factures PDF sans TVA et ${FREE_MONTHLY_LISTINGS} annonces rédigées par IA par mois. Seules les annonces supplémentaires sont payantes.`,
    },
    {
      question: "Quelle différence entre le pack ponctuel, le pack mensuel et l'abonnement annuel ?",
      answer: `Le pack ponctuel (${formatCents(OFFERS.pack.cents)} €, paiement unique) crédite ${PACK_LISTING_CREDITS} annonces valables 12 mois. Le pack mensuel (${formatCents(OFFERS.monthly.cents)} € par mois) autorise jusqu'à ${MONTHLY_PLAN_DAILY_LISTINGS} annonces par jour. L'abonnement annuel (${formatCents(OFFERS.annual.cents)} € par an) supprime la limite d'annonces. Le quota de l'offre en cours est consommé d'abord, puis les crédits du pack ponctuel.`,
    },
    {
      question: "Comment résilier mon abonnement ?",
      answer: "Depuis votre compte, via le portail de gestion de l'abonnement : vous pouvez résilier à tout moment. La résiliation prend effet à la fin de la période déjà payée, qui n'est pas remboursée sauf obligation légale contraire. Le pack ponctuel n'est pas un abonnement et ne se renouvelle pas.",
    },
    {
      question: "Puis-je me rétracter après un achat ?",
      answer: "Le consommateur dispose de 14 jours à compter de la commande pour se rétracter. Si vous demandez l'accès immédiat au contenu numérique avant la fin de ce délai, vous reconnaissez que l'exécution commence dès l'activation et vous renoncez à votre droit de rétractation une fois le contenu fourni (article L. 221-28, 13° du Code de la consommation). Cette demande est recueillie par une case à cocher distincte avant le paiement. Le détail figure dans les conditions générales de vente.",
    },
    {
      question: "Les prix incluent-ils la TVA ?",
      answer: "Les prix sont affichés en euros, toutes taxes comprises ; la TVA n'est pas applicable le cas échéant, conformément aux mentions légales de l'éditeur.",
    },
    {
      question: "Le paiement est-il sécurisé ?",
      answer: "Le paiement est traité par Stripe sur une page de paiement sécurisée. Compléo ne conserve aucun numéro de carte bancaire.",
    },
  ];
}

export function simulatorFaq(): FaqItem[] {
  const t = TAX_PARAMS;
  return [
    {
      question: "Que calcule exactement le simulateur ?",
      answer: "Il applique les taux de cotisations du micro-social au chiffre d'affaires mensuel que vous saisissez, puis affiche les cotisations, le net avant impôt (par mois et par an) et votre position par rapport aux seuils de TVA et aux plafonds du régime micro. Il n'inclut ni l'impôt sur le revenu ni vos éventuels frais professionnels.",
    },
    {
      question: "Quelle différence entre BNC et BIC dans le simulateur ?",
      answer: `Le choix du régime détermine le taux de cotisations (${pct(t.urssafRate.bnc)} en BNC, ${pct(t.urssafRate.bic)} en BIC en 2026) et l'abattement retenu pour le chômage. Les cours, le conseil et l'aide informatique relèvent en général des BNC ; les services artisanaux ou commerciaux, des BIC. Vérifiez le régime de votre activité sur autoentrepreneur.urssaf.fr.`,
    },
    {
      question: "Que se passe-t-il si j'approche du seuil de TVA ou du plafond ?",
      answer: `Le simulateur affiche une alerte dès 80 % du seuil (${eurInt(t.vatThreshold)} par an pour la franchise de TVA en services, ${eurInt(t.microCeilingServices)} par an pour le plafond du régime micro) et une alerte de dépassement au-delà. Au-delà de la franchise, vous devez facturer la TVA ; au-delà du plafond, vous sortez du régime micro.`,
    },
    {
      question: "Comment le simulateur estime-t-il le cumul avec le chômage ?",
      answer: `Il applique un abattement forfaitaire sur le chiffre d'affaires (${pct(t.areAbatement.bnc)} en BNC, ${pct(t.areAbatement.bic)} en BIC) pour obtenir un revenu retenu, puis déduit ${pct(t.areReductionRate)} de ce revenu de l'allocation ARE, dans la limite du salaire de référence si vous le renseignez. C'est une estimation : seule France Travail calcule votre allocation.`,
    },
    {
      question: "Le résultat du simulateur est-il un conseil fiscal ?",
      answer: "Non. Il s'agit d'une estimation indicative, fondée sur les taux et plafonds en vigueur. Votre situation réelle peut différer : vérifiez-la sur autoentrepreneur.urssaf.fr et service-public.fr.",
    },
  ];
}

/** FAQ de la page hub d'une activité (valable pour toutes les villes). */
export function activityFaq(activity: Activity): FaqItem[] {
  const regime = regimeOf(activity);
  const ideal = monthlyIncomeRange(activity, activity.idealHours);
  const minimal = monthlyIncomeRange(activity, activity.minHours);
  const net = simulate({ monthlyRevenue: Math.round((ideal.monthlyMin + ideal.monthlyMax) / 2), regime });
  const platforms = activity.platforms.map((p) => PLATFORMS[p].label).join(", ");
  return [
    {
      question: `Quel est le tarif moyen pour « ${activity.title} » ?`,
      answer: `Le tarif moyen constaté en France est de ${formatRate(activity)}. C'est un repère indicatif : votre tarif dépend de votre expérience, de la prestation et de votre ville.`,
    },
    {
      question: `Combien peut-on gagner avec « ${activity.title} » ?`,
      answer: `Avec ${activity.minHours} h par semaine, le chiffre d'affaires mensuel estimé est d'environ ${eurInt(minimal.monthlyMin)} à ${eurInt(minimal.monthlyMax)} ; avec ${activity.idealHours} h par semaine, d'environ ${eurInt(ideal.monthlyMin)} à ${eurInt(ideal.monthlyMax)}. Au milieu de cette dernière fourchette, il reste environ ${eurInt(net.netMonthly)} par mois après cotisations (${REGIME_LABEL[regime]}, ${pct(net.urssafRate)}), avant impôt sur le revenu. Estimation selon profil et temps disponible, sans garantie de revenu.`,
    },
    {
      question: `Où trouver des clients pour « ${activity.title} » ?`,
      answer: `Les plateformes adaptées à cette activité sont : ${platforms}. Une annonce claire, un tarif indicatif et une réponse rapide aux demandes font la différence.`,
    },
    {
      question: `Quel statut pour exercer « ${activity.title} » ?`,
      answer: `Le régime de la micro-entreprise est le plus courant pour un complément de revenu. Cette activité relève indicativement des ${REGIME_LABEL[regime]} (cotisations de ${pct(TAX_PARAMS.urssafRate[regime])} du chiffre d'affaires en 2026) et la franchise en base de TVA s'applique jusqu'à ${eurInt(TAX_PARAMS.vatThreshold)} par an. Vérifiez le régime applicable à votre cas sur autoentrepreneur.urssaf.fr.`,
    },
    {
      question: `De quel matériel ai-je besoin pour « ${activity.title} » ?`,
      answer:
        activity.requiredAnyOf.length === 0
          ? "Aucun matériel n'est indispensable pour démarrer."
          : `Au moins l'un de ces éléments : ${activity.requiredAnyOf.map(equipmentLabel).join(", ")}.${activity.optional.length ? ` Utile en complément : ${activity.optional.map(equipmentLabel).join(", ")}.` : ""}`,
    },
  ];
}

/**
 * FAQ d'une page activité × ville : chaque réponse est ancrée dans les données de la ville (France Travail, INSEE,
 * population) et reformulée selon la page, pour ne pas recopier le même texte d'une ville à l'autre.
 */
export function cityActivityFaq(city: City, activity: Activity): FaqItem[] {
  const seed = city.rank + ACTIVITIES.findIndex((a) => a.id === activity.id);
  const regime = regimeOf(activity);
  const ideal = monthlyIncomeRange(activity, activity.idealHours);
  const minimal = monthlyIncomeRange(activity, activity.minHours);
  const mid = Math.round((ideal.monthlyMin + ideal.monthlyMax) / 2);
  const net = simulate({ monthlyRevenue: mid, regime });
  const now = bmoFor(city, activity);
  const evolution = bmoEvolution(city, activity);
  const profile = inseeRows(city, activity)[0];
  const platforms = activity.platforms.map((p) => PLATFORMS[p].label);
  const atLeast = (complete: boolean) => (complete ? "" : "au moins ");
  const group = CITY_DATA.groups[activity.id]?.label;
  const nearbyActivities = activitiesForCity(city).length;

  const items: FaqItem[] = [
    {
      question: `Quel est le tarif moyen de « ${activity.title} » à ${city.name} ?`,
      answer: pick(
        [
          `Le tarif moyen constaté en France est de ${formatRate(activity)}. Nous n'avons pas de donnée de prix propre à ${city.name}, ville de ${nf.format(city.population.total)} habitants : adaptez ce repère à votre prestation et à la demande locale.`,
          `Comptez en moyenne ${formatRate(activity)} (repère national). Aucun relevé de prix n'existe ici pour ${city.name} (${city.region}) : ajustez selon votre expérience et la complexité de la prestation.`,
          `À ${city.name} comme ailleurs en France, le tarif moyen observé est de ${formatRate(activity)}, un repère indicatif sans donnée de prix locale.`,
        ],
        seed,
      ),
    },
    {
      question: `Combien peut-on gagner avec « ${activity.title} » à ${city.name} ?`,
      answer: pick(
        [
          `Avec ${activity.minHours} h par semaine, le chiffre d'affaires mensuel estimé est d'environ ${eurInt(minimal.monthlyMin)} à ${eurInt(minimal.monthlyMax)}, et d'environ ${eurInt(ideal.monthlyMin)} à ${eurInt(ideal.monthlyMax)} avec ${activity.idealHours} h. Au milieu de cette dernière fourchette, il reste environ ${eurInt(net.netMonthly)} par mois après cotisations de ${pct(net.urssafRate)}, avant impôt. Estimation selon profil et temps disponible, sans garantie de revenu.`,
          `Pour ${activity.idealHours} h par semaine, l'estimation va de ${eurInt(ideal.monthlyMin)} à ${eurInt(ideal.monthlyMax)} de chiffre d'affaires par mois (de ${eurInt(minimal.monthlyMin)} à ${eurInt(minimal.monthlyMax)} pour ${activity.minHours} h). Après ${pct(net.urssafRate)} de cotisations, un chiffre d'affaires de ${eurInt(mid)} laisse environ ${eurInt(net.netMonthly)} avant impôt. Estimation selon profil et temps disponible, sans garantie de revenu.`,
        ],
        seed + 1,
      ) + ` Repère local : le niveau de vie médian à ${city.name} est de ${eurInt(city.insee.medianIncome)} par an et par unité de consommation (INSEE, revenus ${city.insee.incomeYear}).`,
    },
    {
      question: `Où trouver des clients à ${city.name} ?`,
      answer: `${pick(
        [
          `Les plateformes de mise en relation couvrent ${city.name} : ${platforms.join(", ")}.`,
          `Pour trouver des clients à ${city.name}, publiez votre annonce sur ${platforms.join(", ")}.`,
        ],
        seed + 2,
      )}${profile ? ` Repère local : ${profile.label.toLowerCase()}, ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: profile.unit === "%" ? 1 : 0 }).format(profile.value)} ${profile.unit} à ${city.name} (moyenne des ${CITIES.length} villes : ${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: profile.unit === "%" ? 1 : 0 }).format(profile.average)} ${profile.unit}, source INSEE).` : ""}`,
    },
    {
      question: `Faut-il être micro-entrepreneur pour « ${activity.title} » à ${city.name} ?`,
      answer: `${pick(
        [
          "Une activité de services rémunérée, exercée de façon régulière, relève en principe d'une déclaration d'activité, et la micro-entreprise est le régime le plus courant pour un complément de revenu.",
          "La micro-entreprise est le régime le plus courant pour un complément de revenu, dès lors que l'activité de services est rémunérée et exercée de façon régulière.",
        ],
        seed + 3,
      )} L'activité « ${activity.title} » relève indicativement des ${REGIME_LABEL[regime]} : cotisations de ${pct(TAX_PARAMS.urssafRate[regime])} du chiffre d'affaires en 2026, franchise en base de TVA jusqu'à ${eurInt(TAX_PARAMS.vatThreshold)} par an. Le statut est le même partout en France ; à ${city.name} (${city.region}), ${nearbyActivities} activités du catalogue disposent d'une donnée locale. Vérifiez votre cas sur autoentrepreneur.urssaf.fr.`,
    },
  ];

  if (now) {
    items.push({
      question: `Le marché local est-il actif à ${city.name} pour cette activité ?`,
      answer: `Dans le secteur « ${group} », ${atLeast(now.complete.met)}${nf.format(now.met)} projets de recrutement de salariés ont été déclarés en ${BMO_YEAR} dans le bassin d'emploi « ${city.bassin} » (France Travail)${evolution !== null ? `, soit ${evolution > 0 ? "+" : ""}${evolution} % par rapport à ${BMO_PREVIOUS_YEAR}` : ""}. Ces projets concernent des emplois salariés : ils indiquent l'activité du secteur, pas la demande de services de micro-entrepreneurs. ${city.name} compte ${nearbyActivities} activités du catalogue avec une donnée locale.`,
    });
  }
  return items;
}
