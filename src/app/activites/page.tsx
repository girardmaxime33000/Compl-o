import Link from "next/link";
import { Rocket } from "lucide-react";
import { ACTIVITIES, activitySlug, formatRate } from "@/lib/activities";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = pageMetadata({
  title: "Micro-activités de services : tarifs et revenus estimés",
  description:
    "Parcourez des micro-activités de services pour particuliers (bricolage, cours, ménage, jardinage...) avec tarifs moyens, plateformes et revenu estimé.",
  path: "/activites",
});

export default function ActivitiesIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd path="/activites" />
      <main className="container max-w-4xl space-y-8 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Micro-activités de services pour compléter vos revenus</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pour chaque activité : tarif moyen, plateformes où trouver des clients et revenu estimé selon votre temps
            disponible. Estimations selon profil et temps disponible, sans garantie de revenu.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ACTIVITIES.map((a) => (
            <Link key={a.id} href={`/activites/${activitySlug(a)}`} className="block">
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-lg">{a.title}</CardTitle>
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
