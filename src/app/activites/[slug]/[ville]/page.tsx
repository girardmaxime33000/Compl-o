import Link from "next/link";
import { notFound } from "next/navigation";
import { Info, Rocket } from "lucide-react";
import { activitySlug, findActivityBySlug, formatRate, monthlyIncomeRange } from "@/lib/activities";
import {
  activitiesForCity, BMO_PREVIOUS_YEAR, BMO_YEAR, bmoEvolution, bmoFor, CITIES, CITY_ACTIVITY_PAIRS, CITY_DATA,
  cityActivityPath, cityPath, findCity, hasLocalData, inseeRows, neighbourCities,
} from "@/lib/cities";
import { LEGAL } from "@/lib/legal";
import { PLATFORMS } from "@/lib/platforms";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { cityActivityFaq } from "@/lib/seo/faq";
import { FaqSection } from "@/components/marketing/faq";
import { PublicCtas } from "@/components/marketing/ctas";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return CITY_ACTIVITY_PAIRS.map(({ city, activity }) => ({ slug: activitySlug(activity), ville: city.slug }));
}

const nf = new Intl.NumberFormat("fr-FR");
const formatIndicator = (value: number, unit: "%" | "€") =>
  unit === "€" ? `${nf.format(Math.round(value))} €` : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value)} %`;

function resolve(params: { slug: string; ville: string }) {
  const activity = findActivityBySlug(params.slug);
  const city = findCity(params.ville);
  if (!activity || !city || !hasLocalData(city, activity)) return null;
  return { activity, city };
}

export function generateMetadata({ params }: { params: { slug: string; ville: string } }) {
  const found = resolve(params);
  if (!found) return {};
  const { activity, city } = found;
  const figures = bmoFor(city, activity);
  return pageMetadata({
    title: `${activity.title} à ${city.name} : marché local et revenu estimé`,
    description: `${activity.title} à ${city.name} : ${figures ? `${nf.format(figures.met)} projets de recrutement dans le secteur en ${BMO_YEAR} (France Travail), ` : ""}tarif moyen ${formatRate(activity)}, plateformes et revenu estimé.`,
    path: cityActivityPath(city, activity),
  });
}

export default function CityActivityPage({ params }: { params: { slug: string; ville: string } }) {
  const found = resolve(params);
  if (!found) notFound();
  const { activity, city } = found;
  const group = CITY_DATA.groups[activity.id];
  const now = bmoFor(city, activity)!;
  const before = bmoFor(city, activity, BMO_PREVIOUS_YEAR);
  const evolution = bmoEvolution(city, activity);
  const atLeast = (complete: boolean) => (complete ? "" : "au moins ");
  const difficultShare = now.complete.met && now.complete.xmet && now.met > 0 ? Math.round((now.xmet / now.met) * 100) : null;
  const ideal = monthlyIncomeRange(activity, activity.idealHours);
  const profile = inseeRows(city, activity);
  const neighbours = neighbourCities(city, activity);
  const otherActivities = activitiesForCity(city).filter((a) => a.id !== activity.id).slice(0, 6);
  const activityPath = `/activites/${activitySlug(activity)}`;
  const path = cityActivityPath(city, activity);
  const faq = cityActivityFaq(city, activity);

  return (
    <>
      <BreadcrumbJsonLd
        path={path}
        items={[
          { name: "Activités", path: "/activites" },
          { name: activity.title, path: activityPath },
          { name: city.name, path },
        ]}
      />
      <main className="container max-w-4xl space-y-10 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>

        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/activites" className="underline">Activités</Link> /{" "}
            <Link href={activityPath} className="underline">{activity.title}</Link> / {city.name}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{activity.title} à {city.name} : marché local et revenu estimé</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {activity.pitch} Repères locaux pour {city.name} ({city.region}), ville de {nf.format(city.population.total)} habitants,
            {" "}{city.rank}e commune de France par la population.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Le marché local à {city.name}</h2>
          <p className="text-sm">
            Secteur suivi : <strong>{group?.label}</strong>, dans le bassin d'emploi « {city.bassin} » (France Travail).
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr><th className="p-3">Indicateur ({BMO_YEAR})</th><th className="p-3">Valeur</th></tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="p-3">Projets de recrutement dans le secteur</td><td className="p-3">{atLeast(now.complete.met)}{nf.format(now.met)}</td></tr>
                <tr className="border-t"><td className="p-3">dont jugés difficiles par les employeurs</td><td className="p-3">{atLeast(now.complete.xmet)}{nf.format(now.xmet)}{difficultShare !== null ? ` (${difficultShare} %)` : ""}</td></tr>
                <tr className="border-t"><td className="p-3">dont saisonniers</td><td className="p-3">{atLeast(now.complete.smet)}{nf.format(now.smet)}</td></tr>
                {evolution !== null && before && (
                  <tr className="border-t"><td className="p-3">Évolution depuis {BMO_PREVIOUS_YEAR} ({nf.format(before.met)} projets)</td><td className="p-3">{evolution > 0 ? "+" : ""}{evolution} %</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Source : {CITY_DATA.sources.bmo.label}. {CITY_DATA.sources.bmo.note} Les valeurs précédées de « au moins »
            incluent des données masquées par le secret statistique. Les variations d'une année à l'autre sont à interpréter avec prudence (enquête déclarative). Données téléchargées le {CITY_DATA.downloadedOn}.
            Métiers retenus : {group?.metiers.map((m) => m.name).join(" ; ")}.
          </p>
        </section>

        {profile.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Population et logements à {city.name}</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr><th className="p-3">Indicateur</th><th className="p-3">{city.name}</th><th className="p-3">Moyenne des 20 villes</th></tr>
                </thead>
                <tbody>
                  {profile.map((row) => (
                    <tr key={row.key} className="border-t">
                      <td className="p-3">{row.label}</td>
                      <td className="p-3 font-medium">{formatIndicator(row.value, row.unit)}</td>
                      <td className="p-3 text-muted-foreground">{formatIndicator(row.average, row.unit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Source : {CITY_DATA.sources.insee.label}. {CITY_DATA.sources.insee.note} Millésime {city.insee.censusYear}
              {city.insee.incomeYear !== city.insee.censusYear ? ` (revenus ${city.insee.incomeYear})` : ""}. Moyenne simple
              des 20 villes de cette page, non pondérée par la population. Données téléchargées le {CITY_DATA.downloadedOn}.
            </p>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Tarif et revenu estimé</h2>
          <p className="text-sm">
            Tarif moyen constaté en France : <strong>{formatRate(activity)}</strong> (aucune donnée de prix propre à{" "}
            {city.name}). Avec {activity.idealHours} h par semaine, le chiffre d'affaires mensuel estimé est d'environ{" "}
            {ideal.monthlyMin} € à {ideal.monthlyMax} €, selon profil et temps disponible, sans garantie de revenu.
          </p>
          <Button asChild variant="outline"><Link href={activityPath}>Voir le détail et la simulation du net</Link></Button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Où trouver des clients</h2>
          <p className="text-sm">
            Les plateformes de mise en relation couvrent {city.name} : {activity.platforms.map((p) => PLATFORMS[p].label).join(", ")}.{" "}
            <Link href="/generateur-annonce" className="underline">Voir un exemple d'annonce</Link> à adapter avec le nom de
            votre ville.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border border-primary/40 p-5">
          <h2 className="text-lg font-semibold">Passez à l'action à {city.name}</h2>
          <p className="text-sm text-muted-foreground">
            Faites le diagnostic gratuit, sans inscription, pour comparer cette activité à votre profil, ou estimez votre
            net après cotisations avec le simulateur.
          </p>
          <PublicCtas />
          <p className="text-sm">
            Aussi : <Link href={activityPath} className="underline">toutes les villes pour « {activity.title} »</Link>,{" "}
            <Link href={cityPath(city)} className="underline">les activités à {city.name}</Link>,{" "}
            <Link href="/generateur-annonce" className="underline">exemples d'annonces</Link> et{" "}
            <Link href="/simulateur-micro-entrepreneur" className="underline">simulateur du net</Link>.
          </p>
        </section>

        <FaqSection items={faq} title={`Questions fréquentes : ${activity.title} à ${city.name}`} />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">{activity.title} dans d'autres villes</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {neighbours.map((c) => (
              <li key={c.slug}>
                <Link href={cityActivityPath(c, activity)} className="block rounded-md border p-3 text-sm hover:bg-accent/50">
                  <p className="font-medium">{activity.title} à {c.name}</p>
                  <p className="text-muted-foreground">{c.region}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {otherActivities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Autres activités à {city.name}</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {otherActivities.map((a) => (
                <li key={a.id}>
                  <Link href={cityActivityPath(city, a)} className="block rounded-md border p-3 text-sm hover:bg-accent/50">
                    <p className="font-medium">{a.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Les projets de recrutement concernent des emplois salariés : ils indiquent l'activité locale du secteur, pas la
            demande de services de micro-entrepreneurs. Population : {CITY_DATA.sources.population.label}.{" "}
            {CITY_DATA.sources.population.note} Estimation indicative, ne constitue pas un conseil fiscal ; vérifiez sur{" "}
            <a className="underline" href="https://www.autoentrepreneur.urssaf.fr" rel="noopener noreferrer">autoentrepreneur.urssaf.fr</a>{" "}
            et <a className="underline" href="https://entreprendre.service-public.fr" rel="noopener noreferrer">entreprendre.service-public.fr</a>.
            Dernière mise à jour : {LEGAL.lastUpdate}.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
