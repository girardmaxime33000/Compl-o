import Link from "next/link";
import { GUIDES, guidePath } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideVisual } from "@/components/marketing/visuals";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata = pageMetadata({
  title: "Guides complément de salaire : démarrer une activité complémentaire",
  description: "Guides pratiques de Compléo pour arrondir vos fins de mois : annonces, statut micro-entrepreneur, TVA, devis, cumul avec le chômage ou la retraite.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd path="/guides" />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <h1 className="text-3xl font-bold">Guides pour votre complément de salaire</h1>
          <p className="mt-2 text-muted-foreground">Des guides pratiques pour démarrer une activité complémentaire près de chez vous : annonces, micro-entreprise, TVA, devis et cumul.</p>
        </div>
        <div className="grid gap-4">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={guidePath(g)} className="block">
              <Card className="overflow-hidden transition-colors hover:bg-accent/50 sm:flex">
                <GuideVisual slug={g.slug} size="tile" className="m-5 mb-0 sm:mb-5 sm:mr-0" />
                <CardHeader>
                  <CardTitle as="h2" className="text-lg">{g.title}</CardTitle>
                  <CardDescription>{g.description}</CardDescription>
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
