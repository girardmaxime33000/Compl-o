import { ACTIVITIES, activitySlug, formatRate } from "@/lib/activities";
import { activitiesForCity, CITIES, CITY_ACTIVITY_PAIRS, CITY_DATA, cityPath } from "@/lib/cities";
import { publishedUrbanActivities } from "@/lib/urban-activities";
import { GUIDES, guidePath } from "@/lib/guides";
import { LEGAL } from "@/lib/legal";
import { formatCents, OFFERS } from "@/lib/offers";
import { FREE_MONTHLY_LISTINGS } from "@/lib/platforms";
import { absoluteUrl } from "@/lib/seo";
import { TAX_PARAMS } from "@/lib/tax";

const link = (name: string, path: string, note: string) => `- [${name}](${absoluteUrl(path)}): ${note}`;
const eur = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} €`;
const pct = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n * 100)} %`;

/**
 * Contenu de /llms.txt (format llmstxt.org : H1, résumé en citation, sections de liens).
 * Généré à partir des mêmes sources que le site (catalogue, guides, villes, tax.ts, offers.ts) : aucun chiffre en dur.
 */
export function buildLlmsTxt(): string {
  const t = TAX_PARAMS;
  const cities = CITIES.filter((c) => activitiesForCity(c).length > 0);
  const lines = [
    `# ${LEGAL.siteName}`,
    "",
    `> ${LEGAL.siteName} aide les particuliers en France à générer un complément de revenu avec une micro-activité de services : choisir une activité, rédiger des annonces avec une IA, estimer le net après cotisations micro-entrepreneur et émettre devis et factures PDF. Site en français. Les revenus affichés sont des estimations selon profil et temps disponible, sans garantie de revenu ; les contenus fiscaux sont indicatifs et ne constituent pas un conseil.`,
    "",
    "Repères chiffrés utilisés sur le site (valeurs 2026, source : fiches Entreprendre Service Public) :",
    `- Cotisations micro-social : ${pct(t.urssafRate.bic)} du chiffre d'affaires en prestations de services BIC, ${pct(t.urssafRate.bnc)} en BNC non réglementé.`,
    `- Franchise en base de TVA : ${eur(t.vatThreshold)} par an en prestations de services.`,
    `- Plafond du régime micro : ${eur(t.microCeilingServices)} par an en prestations de services, ${eur(t.microCeilingSales)} pour la vente.`,
    "",
    "## Outils",
    link("Simulateur micro-entrepreneur", "/simulateur-micro-entrepreneur", "calcule cotisations, net avant impôt, seuils de TVA et plafonds, avec cumul chômage ; sans inscription"),
    link("Modèle de facture auto-entrepreneur", "/modele-facture-auto-entrepreneur", "aperçu d'une facture avec la mention « TVA non applicable, art. 293 B du CGI »"),
    link("Exemples d'annonces", "/generateur-annonce", "exemples d'annonces de services pré-rédigés par activité"),
    link("Tarifs", "/pricing", `offre gratuite (${FREE_MONTHLY_LISTINGS} annonces IA par mois), ${OFFERS.pack.name} ${formatCents(OFFERS.pack.cents)} €, ${OFFERS.monthly.name} ${formatCents(OFFERS.monthly.cents)} € par mois, ${OFFERS.annual.name} ${formatCents(OFFERS.annual.cents)} € par an`),
    "",
    "## Guides",
    ...GUIDES.map((g) => link(g.title, guidePath(g), `${g.description} (mis à jour le ${g.updated})`)),
    "",
    "## Activités",
    link("Toutes les activités", "/activites", "catalogue des micro-activités de services avec tarifs et revenus estimés"),
    ...ACTIVITIES.map((a) => link(a.title, `/activites/${activitySlug(a)}`, `${a.pitch} Tarif moyen ${formatRate(a)}`)),
    ...publishedUrbanActivities().map((a) => link(a.name, `/activites/${a.slug}`, a.pitch)),
    "",
    "## Villes",
    `Pages activité × ville (${CITY_ACTIVITY_PAIRS.length} au total, de la forme ${absoluteUrl("/activites/<activité>/<ville>")}), uniquement lorsqu'une donnée locale existe : projets de recrutement France Travail (enquête BMO ${CITY_DATA.years.join(" et ")}) et statistiques INSEE. Données téléchargées le ${CITY_DATA.downloadedOn}. Les projets de recrutement concernent des emplois salariés : ils indiquent l'activité du secteur, pas la demande de services.`,
    ...cities.map((c) => link(c.name, cityPath(c), `${activitiesForCity(c).length} activités avec repères locaux (${c.region})`)),
    "",
    "## Optional",
    link("Mentions légales", "/mentions-legales", "éditeur du site"),
    link("Conditions générales de vente", "/cgv", "brouillon en attente de relecture juridique"),
    link("Conditions générales d'utilisation", "/cgu", "brouillon en attente de relecture juridique"),
    link("Politique de confidentialité", "/confidentialite", "données collectées et droits"),
    link("Plan du site", "/sitemap.xml", "toutes les pages indexables avec date de dernière modification"),
    "",
  ];
  return lines.join("\n");
}
