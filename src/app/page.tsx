import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calculator, Check, FileText, Megaphone, Sparkles } from "lucide-react";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqSection } from "@/components/marketing/faq";
import { PublicCtas } from "@/components/marketing/ctas";
import { ActivityVisual } from "@/components/marketing/visuals";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import { Photo } from "@/components/marketing/photo";
import { cityPhoto } from "@/lib/city-images";
import { PhotoBanner } from "@/components/marketing/photo-banner";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ACTIVITIES, activitySlug, formatRate, monthlyIncomeRange } from "@/lib/activities";
import { activitiesForCity, CITIES, CITY_ACTIVITY_PAIRS, CITY_DATA, cityActivityPath, cityPath } from "@/lib/cities";
import { GUIDES, guidePath } from "@/lib/guides";
import { sitePhoto } from "@/lib/site-images";
import { homeFaq } from "@/lib/seo/faq";
import { eur, simulate, TAX_PARAMS } from "@/lib/tax";

const HOME_TITLE = "Complément de salaire : activité près de chez vous | Compléo";
const HOME_DESCRIPTION =
  "Trouvez une activité près de chez vous pour arrondir vos fins de mois : bricolage, ménage, cours, jardinage. Questionnaire gratuit, sans inscription.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/", type: "website", locale: "fr_FR", siteName: "Compléo" },
};

const STEPS = [
  {
    icon: Sparkles,
    title: "1. Faites votre diagnostic",
    text: "Trois questions : domaines qui vous plaisent, matériel disponible, temps par semaine.",
    details: ["3 activités recommandées", "Tarif moyen et plateformes", "Revenu estimé selon votre temps"],
  },
  {
    icon: Megaphone,
    title: "2. Rédigez votre annonce",
    text: "L'IA propose un titre, un texte structuré et des hashtags pour LeBonCoin, AlloVoisins ou GensDeConfiance.",
    details: ["À relire avant publication", "Adaptée à votre ville", "Copiable en un clic"],
  },
  {
    icon: FileText,
    title: "3. Facturez simplement",
    text: "Devis et factures PDF numérotés, avec la mention « TVA non applicable, art. 293 B du CGI ».",
    details: ["Numérotation automatique", "Suivi brouillon, envoyé, payé", "Calcul du net après cotisations"],
  },
];

/** Les trois activités du catalogue au revenu mensuel estimé le plus élevé pour leur temps conseillé. */
const TOP_ACTIVITIES = [...ACTIVITIES]
  .map((activity) => ({ activity, ...monthlyIncomeRange(activity, activity.idealHours) }))
  .sort((a, b) => b.monthlyMax - a.monthlyMax)
  .slice(0, 3);

const POPULAR_ACTIVITIES = ACTIVITIES.slice(0, 6);
const MAIN_CITIES = CITIES.filter((c) => activitiesForCity(c).length > 0)
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 10);

/** Tuiles photo : les villes les mieux classées qui ont une photo. Les autres restent en liste texte. */
const TILE_CITIES = MAIN_CITIES.filter((c) => cityPhoto(c)).slice(0, 8);
const TEXT_CITIES = MAIN_CITIES.filter((c) => !TILE_CITIES.includes(c));

/** Associations activité × ville avec donnée locale, pour les villes les mieux classées (une activité par ville, puis complétées). */
const TOP_PAIRS = [...CITY_ACTIVITY_PAIRS]
  .sort((a, b) => a.city.rank - b.city.rank)
  .filter((p, i, all) => all.findIndex((q) => q.city.slug === p.city.slug) === i)
  .slice(0, 12);

/** Activité de l'exemple d'annonce du hero : la première du catalogue. */
const HERO_ACTIVITY = ACTIVITIES[0];

const SIM_EXAMPLE_REVENUE = 500;
const SIM_EXAMPLE_REGIME = "bic" as const;

export default function HomePage() {
  const example = simulate({ monthlyRevenue: SIM_EXAMPLE_REVENUE, regime: SIM_EXAMPLE_REGIME });
  const faq = homeFaq();
  const stats = [
    { value: ACTIVITIES.length, label: "activités du catalogue" },
    { value: CITIES.length, label: "villes couvertes" },
    { value: CITY_ACTIVITY_PAIRS.length, label: "pages avec donnée locale" },
    { value: GUIDES.length, label: "guides pratiques" },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />
      <main>

      <section className="container grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Complément de salaire : <span className="text-success">activités et services près de chez vous</span>
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Répondez à trois questions : nous vous proposons des activités simples à faire près de chez vous, puis nous vous aidons à écrire votre annonce.
          </p>
          <PublicCtas className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start" />
          <ul className="mt-4 flex flex-wrap justify-center gap-2 text-sm md:justify-start" aria-label="Ce que comprend le diagnostic">
            {["Diagnostic gratuit", "Sans inscription", "Sans carte bancaire"].map((label) => (
              <li key={label} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1">
                <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> {label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground"><Link href="/pricing" className="underline">Voir les tarifs</Link></p>
        </div>
        {HERO_ACTIVITY && <HeroShowcase photo={sitePhoto("hero:home")} activity={HERO_ACTIVITY} example={example} />}
      </section>

      <section className="container space-y-6 pb-16" aria-labelledby="comment">
        <h2 id="comment" className="text-2xl font-bold">Comment ça marche</h2>
        <Image
          src="/images/parcours-compleo.svg"
          alt="Parcours en trois étapes : diagnostic, annonce, facture"
          width={640}
          height={180}
          loading="lazy"
          className="hidden h-auto w-full max-w-2xl rounded-xl sm:block"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text, details }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
                <ul className="list-disc space-y-0.5 pl-5 pt-2 text-sm text-muted-foreground">
                  {details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container space-y-4 pb-16" aria-labelledby="apercu">
        <h2 id="apercu" className="text-2xl font-bold">Un aperçu de ce que vous obtenez</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Les trois activités du catalogue au revenu mensuel estimé le plus élevé pour le temps conseillé. Estimation selon
          profil et temps disponible, sans garantie de revenu.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TOP_ACTIVITIES.map(({ activity, monthlyMin, monthlyMax }) => (
            <Link key={activity.id} href={`/activites/${activitySlug(activity)}`} className="block">
              <Card className="h-full overflow-hidden transition-colors hover:bg-accent/50">
                <ActivityVisual activityId={activity.id} />
                <CardHeader>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription>Tarif moyen : {formatRate(activity)}</CardDescription>
                  <p className="pt-1 text-sm">
                    ≈ {monthlyMin} € à {monthlyMax} € de chiffre d'affaires par mois avec {activity.idealHours} h par semaine
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="container pb-16" aria-labelledby="simulateur">
        <div className="space-y-3 rounded-lg border border-primary/40 p-5 sm:p-6">
          <h2 id="simulateur" className="flex items-center gap-2 text-2xl font-bold"><Calculator className="h-6 w-6 text-primary" /> Estimez votre net dans la poche</h2>
          <p className="text-sm">
            Exemple : avec {eur(SIM_EXAMPLE_REVENUE)} de chiffre d'affaires par mois en prestation de services (BIC), les
            cotisations URSSAF ({new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(TAX_PARAMS.urssafRate[SIM_EXAMPLE_REGIME] * 100)} %,
            valeur 2026) représentent {eur(example.urssaf)} et il reste {eur(example.netMonthly)} avant impôt sur le revenu.
          </p>
          <p className="text-xs text-muted-foreground">Estimation indicative, ne constitue pas un conseil fiscal.</p>
          <Button asChild size="lg"><Link href="/simulateur-micro-entrepreneur">Estimer mon net <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="container space-y-6 pb-16" aria-labelledby="explorer">
        <h2 id="explorer" className="text-2xl font-bold">Activité complémentaire près de chez vous</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Activités</h3>
            <ul className="space-y-1 text-sm">
              {POPULAR_ACTIVITIES.map((a) => (
                <li key={a.id}><Link href={`/activites/${activitySlug(a)}`} className="underline">{a.title}</Link> <span className="text-muted-foreground">({formatRate(a)})</span></li>
              ))}
              <li><Link href="/activites" className="font-medium text-primary underline">Voir toutes les activités</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Compléments de salaire par ville</h3>
            {TILE_CITIES.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                {TILE_CITIES.map((c) => (
                  <li key={c.slug}>
                    <Link href={cityPath(c)} className="block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent/50">
                      <Photo photo={cityPhoto(c)} alt="" ratio="card" sizes="(min-width: 1024px) 140px, (min-width: 640px) 25vw, 50vw" credit="text" phrasing />
                      <span className="block px-2 py-1.5 text-sm font-medium">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {TEXT_CITIES.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
                {TEXT_CITIES.map((c) => (
                  <li key={c.slug}><Link href={cityPath(c)} className="underline">{c.name}</Link></li>
                ))}
              </ul>
            )}
            <ul className="mt-4 space-y-1 text-sm">
              {TOP_PAIRS.map(({ city, activity }) => (
                <li key={`${city.slug}-${activity.id}`}>
                  <Link href={cityActivityPath(city, activity)} className="underline">{activity.title} à {city.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container space-y-4 pb-16" aria-labelledby="guides">
        <h2 id="guides" className="text-2xl font-bold">Nos guides pratiques</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={guidePath(g)} className="block h-full rounded-md border p-3 text-sm hover:bg-accent/50">
                <p className="font-medium">{g.title}</p>
                <p className="mt-1 text-muted-foreground">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container space-y-3 pb-16" aria-labelledby="sources">
        <h2 id="sources" className="text-2xl font-bold">Des repères issus de données publiques</h2>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border p-4">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="text-3xl font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          Sources : {CITY_DATA.sources.bmo.label} ; {CITY_DATA.sources.insee.label}. Taux et plafonds fiscaux : fiches
          Entreprendre Service Public. Données téléchargées le {CITY_DATA.downloadedOn}.
        </p>
      </section>

      <div className="container max-w-3xl pb-16">
        <FaqSection items={faq} />
      </div>

      <section className="container pb-16" aria-labelledby="cta-final">
        <PhotoBanner photo={sitePhoto("cta:final")}>
          <div className="relative space-y-4 text-center">
            <h2 id="cta-final" className="text-2xl font-bold">Et si vous rendiez service près de chez vous ?</h2>
            <p className="text-sm text-muted-foreground">Trouvez l'activité qui vous correspond en trois questions, sans inscription.</p>
            <PublicCtas className="flex flex-col justify-center gap-3 sm:flex-row" />
          </div>
        </PhotoBanner>
      </section>
      <SiteFooter />
      </main>
    </>
  );
}
