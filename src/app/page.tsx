import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Check, ClipboardList, PenLine, Send } from "lucide-react";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqSection } from "@/components/marketing/faq";
import { PublicCtas } from "@/components/marketing/ctas";
import { ActivityVisual, GuideVisual } from "@/components/marketing/visuals";
import { BeforeAfter } from "@/components/marketing/before-after";
import { Photo } from "@/components/marketing/photo";
import { cityPhoto } from "@/lib/city-images";
import { PhotoBanner } from "@/components/marketing/photo-banner";
import { HomeViewTracker } from "@/components/marketing/home-view-tracker";
import { BenefitStats, type BenefitStat } from "@/components/marketing/benefit-stats";
import { SimulatorPreview } from "@/components/marketing/simulator-preview";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ACTIVITIES, activitySlug, formatRate, monthlyIncomeRange } from "@/lib/activities";
import { activitiesForCity, CITIES, CITY_ACTIVITY_PAIRS, CITY_DATA, cityActivityPath, cityPath } from "@/lib/cities";
import { GUIDES, guidePath } from "@/lib/guides";
import { sitePhoto } from "@/lib/site-images";
import { homeFaq } from "@/lib/seo/faq";
import { FREE_MONTHLY_LISTINGS, GENERATOR_PLATFORMS, MAX_PLATFORMS_PER_LISTING, PLATFORMS } from "@/lib/platforms";
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
    icon: ClipboardList,
    title: "Vous répondez à 3 questions simples",
    text: "Ce que vous aimez faire, le matériel que vous avez, le temps dont vous disposez.",
  },
  {
    icon: PenLine,
    title: "Compléo écrit votre annonce",
    text: "Avec vos mots et votre ville. Une version adaptée à chaque site que vous choisissez.",
  },
  {
    icon: Send,
    title: "Vous la copiez et la publiez",
    text: "Un clic pour copier, et nous vous expliquons où la coller. Rien n'est publié sans vous.",
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

/** Version du visuel du hero, jointe aux événements pour comparer avec les versions précédentes (photo, panneau coloré). */
const HERO_VISUAL = "avant-apres" as const;

const SIM_EXAMPLE_REVENUE = 500;
const SIM_EXAMPLE_REGIME = "bic" as const;
const SIM_EXAMPLE_RATE = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(TAX_PARAMS.urssafRate[SIM_EXAMPLE_REGIME] * 100);

export default function HomePage() {
  const example = simulate({ monthlyRevenue: SIM_EXAMPLE_REVENUE, regime: SIM_EXAMPLE_REGIME });
  const faq = homeFaq();
  const nf = new Intl.NumberFormat("fr-FR");
  const topActivity = TOP_ACTIVITIES[0];
  const benefits: BenefitStat[] = [
    {
      value: `≈ ${Math.round((1 - TAX_PARAMS.urssafRate[SIM_EXAMPLE_REGIME]) * 100)} %`,
      label: "de ce que vous facturez vous reste après les charges sociales",
      note: "Prestation de services (BIC), taux 2026, avant impôt sur le revenu.",
    },
    {
      value: `${nf.format(TAX_PARAMS.vatThreshold)} €`,
      label: "facturables par an sans avoir à ajouter de TVA",
      note: "Franchise en base de TVA 2026, prestations de services.",
    },
    ...(topActivity
      ? [{
          value: `Jusqu'à ${nf.format(topActivity.monthlyMax)} €`,
          label: `facturés par mois, estimation (${topActivity.activity.title})`,
          note: `Avec ${topActivity.activity.idealHours} h par semaine. Estimation selon profil et temps disponible, sans garantie de revenu.`,
        }]
      : []),
    {
      value: `${FREE_MONTHLY_LISTINGS}`,
      label: "annonces rédigées par IA chaque mois, gratuitement",
      note: "Avec un compte gratuit. À relire avant publication.",
    },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />
      <HomeViewTracker visual={HERO_VISUAL} />
      <main className="text-base">

      <section className="container grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Vos premiers clients près de chez vous. <span className="text-success">Compléo écrit votre annonce.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            Dites ce que vous savez faire. Compléo rédige une annonce sur mesure pour les sites où l&apos;on cherche des services
            près de chez soi. Vous la copiez, vous la publiez. Pas besoin d&apos;être doué en informatique.
          </p>
          <PublicCtas source="hero" visual={HERO_VISUAL} secondary={false} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start" />
          <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start" aria-label="Ce que vous devez savoir avant de commencer">
            {["Gratuit pour commencer", "Sans carte bancaire", "Rien n'est publié sans vous"].map((label) => (
              <li key={label} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5">
                <Check className="h-4 w-4 text-success" aria-hidden="true" /> {label}
              </li>
            ))}
          </ul>
        </div>
        {HERO_ACTIVITY && <BeforeAfter activity={HERO_ACTIVITY} />}
      </section>

      <section className="container space-y-8 pb-16" aria-labelledby="comment">
        <h2 id="comment" className="text-3xl font-bold">Comment ça marche</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4 rounded-xl border bg-card p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground" aria-hidden="true">{i + 1}</span>
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-lg font-semibold"><Icon className="h-5 w-5 text-primary" aria-hidden="true" /> {title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="container space-y-4 pb-16" aria-labelledby="sites">
        <h2 id="sites" className="text-3xl font-bold">Une annonce pour chaque site</h2>
        <p className="max-w-3xl text-muted-foreground">
          Chaque site a ses habitudes. Compléo adapte le titre et le texte à celui que vous choisissez. Vous en choisissez
          jusqu&apos;à {MAX_PLATFORMS_PER_LISTING} à la fois, et cela ne compte que pour une seule annonce. Compléo n&apos;envoie rien à votre place :
          vous copiez le texte et vous le collez sur le site.
        </p>
        <ul className="flex flex-wrap gap-2" aria-label={`${GENERATOR_PLATFORMS.length} sites disponibles`}>
          {GENERATOR_PLATFORMS.map((p) => (
            <li key={p} className="rounded-full border bg-card px-3 py-1.5 text-sm">{PLATFORMS[p].label}</li>
          ))}
        </ul>
      </section>

      <section className="container space-y-4 pb-16" aria-labelledby="apercu">
        <h2 id="apercu" className="text-3xl font-bold">Ce que vous pouvez proposer près de chez vous</h2>
        <p className="max-w-3xl text-muted-foreground">
          Les trois activités du catalogue qui peuvent rapporter le plus pour le temps conseillé. Estimation selon profil et
          temps disponible, sans garantie de revenu.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TOP_ACTIVITIES.map(({ activity, monthlyMin, monthlyMax }) => (
            <Link key={activity.id} href={`/activites/${activitySlug(activity)}`} className="block">
              <Card className="h-full overflow-hidden transition-colors hover:bg-accent/50">
                <ActivityVisual activityId={activity.id} credit="page" />
                <CardHeader>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription className="text-base">Tarif moyen : {formatRate(activity)}</CardDescription>
                  <p className="pt-1">
                    Environ {monthlyMin} € à {monthlyMax} € facturés par mois avec {activity.idealHours} h par semaine
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="container max-w-3xl pb-16">
        <FaqSection items={faq} />
      </div>

      <section className="container pb-16" aria-labelledby="cta-final">
        <PhotoBanner photo={sitePhoto("cta:final")}>
          <div className="relative space-y-4 text-center">
            <h2 id="cta-final" className="text-3xl font-bold">Prêt à trouver vos premiers clients ?</h2>
            <p className="text-lg text-muted-foreground">Trois questions, puis votre annonce. Gratuit pour commencer, sans carte bancaire.</p>
            <PublicCtas source="final" visual={HERO_VISUAL} secondary={false} className="flex flex-col justify-center gap-3 sm:flex-row" />
          </div>
        </PhotoBanner>
      </section>

      <div className="border-t bg-muted/40 pt-14">
      <p className="container pb-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">Pour aller plus loin</p>

      <section className="container pb-16" aria-labelledby="simulateur">
        <div className="grid items-center gap-6 rounded-lg border border-primary/40 bg-card p-5 sm:p-6 md:grid-cols-2 md:gap-10">
          <div className="space-y-3">
            <h2 id="simulateur" className="flex items-center gap-2 text-2xl font-bold"><Calculator className="h-6 w-6 text-primary" /> Calculez ce qu&apos;il vous reste vraiment</h2>
            <p>
              Avec {eur(SIM_EXAMPLE_REVENUE)} facturés par mois, les charges sociales ({SIM_EXAMPLE_RATE} %, taux 2026) représentent
              {" "}{eur(example.urssaf)} et il reste {eur(example.netMonthly)} avant impôt sur le revenu. Entrez votre propre montant dans le simulateur.
            </p>
            <Button asChild size="lg" variant="outline"><Link href="/simulateur-micro-entrepreneur">Calculer mon net <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <SimulatorPreview
            monthlyRevenue={SIM_EXAMPLE_REVENUE}
            urssaf={example.urssaf}
            netMonthly={example.netMonthly}
            ratePercent={SIM_EXAMPLE_RATE}
            regimeLabel="prestation de services (BIC)"
          />
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
                      <Photo photo={cityPhoto(c)} alt="" ratio="card" sizes="(min-width: 1024px) 140px, (min-width: 640px) 25vw, 50vw" credit="page" phrasing />
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

      <section className="container space-y-6 pb-16" aria-labelledby="guides">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="guides" className="text-2xl font-bold">Nos guides pratiques</h2>
            <p className="mt-1 text-sm text-muted-foreground">Annonces, micro-entreprise, TVA, devis, cumul avec l&apos;ARE : l&apos;essentiel pour démarrer.</p>
          </div>
          <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
            Tous les guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={guidePath(g)} className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <GuideVisual slug={g.slug} size="card" credit="page" />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="font-semibold leading-snug">{g.title}</h3>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{g.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                    Lire le guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container space-y-3 pb-16" aria-labelledby="sources">
        <h2 id="sources" className="text-2xl font-bold">Ce que vous pouvez en attendre</h2>
        <BenefitStats items={benefits} />
        <p className="text-sm text-muted-foreground">
          Sources : taux et plafonds fiscaux, fiches Entreprendre Service Public ; repères locaux, {CITY_DATA.sources.bmo.label} et{" "}
          {CITY_DATA.sources.insee.label}. Données locales téléchargées le {CITY_DATA.downloadedOn}.
          {" "}Photos : <Link href="/credits-photos" className="underline">crédits des photographes (Unsplash)</Link>.
        </p>
      </section>

      </div>
      <SiteFooter />
      </main>
    </>
  );
}
