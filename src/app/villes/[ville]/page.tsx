import Link from "next/link";
import { notFound } from "next/navigation";
import { activitySlug, formatRate } from "@/lib/activities";
import {
  activitiesForCity, BMO_YEAR, bmoFor, CITIES, CITY_DATA, cityActivityPath, cityPath, findCity,
} from "@/lib/cities";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PublicCtas } from "@/components/marketing/ctas";
import { CityPhoto } from "@/components/marketing/city-photo";
import { ActivityVisual } from "@/components/marketing/visuals";
import { SiteFooter } from "@/components/marketing/site-footer";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { SiteHeader } from "@/components/marketing/site-header";

export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.filter((c) => activitiesForCity(c).length > 0).map((c) => ({ ville: c.slug }));
}

const nf = new Intl.NumberFormat("fr-FR");

export function generateMetadata({ params }: { params: { ville: string } }) {
  const city = findCity(params.ville);
  if (!city) return {};
  const count = activitiesForCity(city).length;
  return pageMetadata({
    title: `Complément de salaire à ${city.name} : activités complémentaires et marché local`,
    description: `Complément de salaire à ${city.name} : ${count} activités complémentaires avec repères locaux (France Travail, INSEE), tarif moyen, plateformes et revenu estimé selon votre profil.`,
    path: cityPath(city),
  });
}

export default function CityHubPage({ params }: { params: { ville: string } }) {
  const city = findCity(params.ville);
  if (!city) notFound();
  const activities = activitiesForCity(city);
  if (activities.length === 0) notFound();
  const path = cityPath(city);

  return (
    <>
      <BreadcrumbJsonLd path={path} items={[{ name: "Activités", path: "/activites" }, { name: city.name, path }]} />
      <SiteHeader />
      <main className="container max-w-4xl space-y-8 py-10">
        <CityPhoto city={city} priority />

        <div>
          <p className="text-sm text-muted-foreground"><Link href="/activites" className="underline">Activités</Link> / {city.name}</p>
          <h1 className="mt-1 text-3xl font-bold">Complément de salaire à {city.name} : activités complémentaires près de chez vous</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {city.name} ({city.region}) compte {nf.format(city.population.total)} habitants, {city.rank}e commune de France par la
            population. Pour {activities.length} activités, une donnée locale de France Travail est disponible pour le
            bassin d'emploi « {city.bassin} ».
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Activités complémentaires avec repères locaux à {city.name}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {activities.map((a) => {
              const figures = bmoFor(city, a)!;
              return (
                <li key={a.id}>
                  <Link href={cityActivityPath(city, a)} className="flex h-full gap-3 rounded-md border p-3 text-sm hover:bg-accent/50">
                    <ActivityVisual activityId={a.id} size="tile" />
                    <span className="block">
                      <span className="block font-medium">{a.title} à {city.name}</span>
                      <span className="block text-muted-foreground">Tarif moyen : {formatRate(a)}</span>
                      <span className="block text-muted-foreground">
                        {figures.complete.met ? "" : "Au moins "}{nf.format(figures.met)} projets de recrutement dans le secteur en {BMO_YEAR}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground">
            Source : {CITY_DATA.sources.bmo.label}. Projets de recrutement de salariés : ils indiquent l'activité locale du
            secteur, pas la demande de services de micro-entrepreneurs. Population : {CITY_DATA.sources.population.label}.
            Données téléchargées le {CITY_DATA.downloadedOn}.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border border-primary/40 p-5">
          <h2 className="text-lg font-semibold">Lancez votre complément de salaire à {city.name}</h2>
          <p className="text-sm text-muted-foreground">
            Comparez ces activités à votre profil avec le diagnostic gratuit, sans inscription, ou estimez votre net après
            cotisations (estimation indicative, ne constitue pas un conseil fiscal).
          </p>
          <PublicCtas />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Toutes les activités</h2>
          <p className="text-sm">
            <Link href="/activites" className="underline">Parcourir le catalogue complet des micro-activités</Link>, ou
            consulter l'<Link href="/generateur-annonce" className="underline">exemple d'annonce</Link> d'une activité.
          </p>
          <ul className="flex flex-wrap gap-2 text-sm">
            {activities.map((a) => (
              <li key={a.id}><Link href={`/activites/${activitySlug(a)}`} className="underline">{a.title}</Link></li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
