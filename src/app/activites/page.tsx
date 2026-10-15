import Link from "next/link";
import { Rocket } from "lucide-react";
import { ACTIVITIES, activitySlug, formatRate } from "@/lib/activities";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityVisual } from "@/components/marketing/visuals";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = pageMetadata({
  title: "Activité complémentaire : complément de salaire près de chez vous",
  description:
    "Choisissez une activité complémentaire pour arrondir vos fins de mois (bricolage, cours, ménage, jardinage...) : tarifs moyens, plateformes, complément de salaire estimé et repères par ville.",
  path: "/activites",
});

export default function ActivitiesIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd path="/activites" />
      <main className="container max-w-4xl space-y-8 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Activités complémentaires : un complément de salaire près de chez vous</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pour chaque activité complémentaire en micro-entreprise : tarif moyen, plateformes où trouver des clients de votre
            quartier et complément de salaire estimé selon votre temps disponible. Estimations selon profil, ville et temps
            disponible, sans garantie de revenu.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ACTIVITIES.map((a) => (
            <Link key={a.id} href={`/activites/${activitySlug(a)}`} className="block">
              <Card className="h-full overflow-hidden transition-colors hover:bg-accent/50">
                <ActivityVisual activityId={a.id} />
                <CardHeader>
                  <CardTitle as="h2" className="text-lg">{a.title}</CardTitle>
                  <CardDescription>{a.pitch}</CardDescription>
                  <p className="pt-1 text-sm font-medium">{formatRate(a)}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
