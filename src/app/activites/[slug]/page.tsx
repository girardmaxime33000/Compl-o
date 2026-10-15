import Link from "next/link";
import { notFound } from "next/navigation";
import { Info, Rocket } from "lucide-react";
import {
  ACTIVITIES, activitySlug, equipmentLabel, findActivityBySlug, formatRate, monthlyIncomeRange, regimeOf, relatedActivities,
} from "@/lib/activities";
import { citiesForActivity, cityActivityPath } from "@/lib/cities";
import { demoListing } from "@/lib/demo-listings";
import { PLATFORMS } from "@/lib/platforms";
import { LEGAL } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { activityFaq } from "@/lib/seo/faq";
import { FaqSection } from "@/components/marketing/faq";
import { PublicCtas } from "@/components/marketing/ctas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Simulator } from "@/components/simulator/simulator";
import { SiteFooter } from "@/components/marketing/site-footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return ACTIVITIES.map((a) => ({ slug: activitySlug(a) }));
}

const HOURS = [2, 5, 8, 12, 20];

export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = findActivityBySlug(params.slug);
  if (!a) return {};
  return pageMetadata({
    title: `${a.title} : tarifs et revenu estimé`,
    description: `${a.pitch} Tarif moyen : ${formatRate(a)}. Plateformes, revenu estimé selon votre temps disponible et simulation du net.`,
    path: `/activites/${activitySlug(a)}`,
  });
}

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const activity = findActivityBySlug(params.slug);
  if (!activity) notFound();

  const path = `/activites/${activitySlug(activity)}`;
  const listing = demoListing(activity);
  const ideal = monthlyIncomeRange(activity, activity.idealHours);
  const simulatedRevenue = Math.round((ideal.monthlyMin + ideal.monthlyMax) / 2 / 10) * 10;
  const related = relatedActivities(activity);
  const cities = citiesForActivity(activity);
  const approxUnit = activity.unit !== "h";
  const faq = activityFaq(activity);

  return (
    <>
      <BreadcrumbJsonLd
        path={path}
        items={[{ name: "Activités", path: "/activites" }, { name: activity.title, path }]}
      />
      <main className="container max-w-4xl space-y-10 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>

        <div>
          <p className="text-sm text-muted-foreground"><Link href="/activites" className="underline">Activités</Link> / {activity.title}</p>
          <h1 className="mt-1 text-3xl font-bold">{activity.title} : tarifs, plateformes et revenu estimé</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{activity.pitch}</p>
          <p className="mt-3 text-sm">
            Tarif moyen constaté en France : <strong>{formatRate(activity)}</strong> (repère indicatif, à adapter à votre
            situation).
          </p>
          {cities.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Des repères locaux (France Travail, INSEE) sont disponibles pour {cities.length} villes, listées plus bas.
            </p>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Revenu estimé selon votre temps disponible</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr><th className="p-3">Temps par semaine</th><th className="p-3">Chiffre d'affaires mensuel estimé</th></tr>
              </thead>
              <tbody>
                {HOURS.map((h) => {
                  const { monthlyMin, monthlyMax } = monthlyIncomeRange(activity, h);
                  return (
                    <tr key={h} className="border-t">
                      <td className="p-3">{h === 20 ? "20 h et +" : `${h} h`}</td>
                      <td className="p-3">≈ {monthlyMin} € à {monthlyMax} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimation selon profil et temps disponible : 60 % du temps est considéré comme facturable (démarchage,
            trajets, annulations). Sans garantie de revenu.
            {approxUnit && ` Le tarif étant exprimé par « ${activity.unit} », le calcul assimile une heure facturée à une unité.`}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Où trouver des clients</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {activity.platforms.map((p) => (
              <li key={p} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{PLATFORMS[p].label}</p>
                <p className="text-muted-foreground">{PLATFORMS[p].hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Comment trouver vos premiers clients</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Publiez une annonce précise sur {activity.platforms.map((p) => PLATFORMS[p].label).join(", ")} : service, zone d'intervention, tarif indicatif.</li>
            <li>Répondez rapidement et clairement aux demandes, en confirmant la prestation et le prix avant de vous déplacer.</li>
            <li>Établissez un devis puis une facture avec les mentions obligatoires, y compris pour une petite prestation.</li>
            <li>Demandez un retour à vos clients satisfaits, uniquement des avis réels, pour rassurer les suivants.</li>
          </ol>
          <p className="text-sm">
            Le <Link href="/guides/annonces-efficaces" className="underline">guide pour rédiger une annonce efficace</Link>{" "}
            détaille chaque point.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Matériel nécessaire</h2>
          {activity.requiredAnyOf.length === 0 ? (
            <p className="text-sm">Aucun matériel indispensable pour démarrer.</p>
          ) : (
            <p className="text-sm">Au moins l'un de ces éléments : {activity.requiredAnyOf.map(equipmentLabel).join(", ")}.</p>
          )}
          {activity.optional.length > 0 && (
            <p className="text-sm text-muted-foreground">Utile en complément : {activity.optional.map(equipmentLabel).join(", ")}.</p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Exemple d'annonce</h2>
          <Card>
            <CardHeader>
              <CardDescription>Exemple rédigé à l'avance, à relire et adapter avant publication.</CardDescription>
              <CardTitle className="text-lg">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent><p className="whitespace-pre-line text-sm leading-relaxed">{listing.body}</p></CardContent>
          </Card>
          <Button asChild><Link href={`/login?next=/dashboard/listings`}>Générer mon annonce avec l'IA (compte gratuit)</Link></Button>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Simulez votre net dans la poche</h2>
          <p className="text-sm text-muted-foreground">
            Simulation pré-remplie avec {simulatedRevenue} € de chiffre d'affaires mensuel (milieu de fourchette pour{" "}
            {activity.idealHours} h par semaine) et le régime {regimeOf(activity).toUpperCase()} à titre indicatif.
            Modifiez les valeurs librement.
          </p>
          <Simulator initialRevenue={simulatedRevenue} initialRegime={regimeOf(activity)} />
          <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Estimation indicative, ne constitue pas un conseil fiscal. Le régime (BNC ou BIC) dépend de votre activité
              réelle : vérifiez-le sur{" "}
              <a className="underline" href="https://www.autoentrepreneur.urssaf.fr" rel="noopener noreferrer">autoentrepreneur.urssaf.fr</a>{" "}
              et <a className="underline" href="https://entreprendre.service-public.fr" rel="noopener noreferrer">entreprendre.service-public.fr</a>.
              Dernière mise à jour : {LEGAL.lastUpdate}.
            </p>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-primary/40 p-5">
          <h2 className="text-lg font-semibold">Passez à l'action</h2>
          <p className="text-sm text-muted-foreground">
            Faites le diagnostic gratuit pour comparer cette activité à votre profil, sans inscription, ou estimez votre net
            après cotisations.
          </p>
          <PublicCtas />
        </section>

        <FaqSection items={faq} title={`Questions fréquentes : ${activity.title}`} />

        {cities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{activity.title} dans les grandes villes</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={cityActivityPath(c, activity)} className="block rounded-md border p-3 text-sm hover:bg-accent/50">
                    <p className="font-medium">{c.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Activités proches</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/activites/${activitySlug(r)}`} className="block rounded-md border p-3 text-sm hover:bg-accent/50">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-muted-foreground">{formatRate(r)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
