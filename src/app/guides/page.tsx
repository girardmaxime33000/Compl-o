import Link from "next/link";
import { Rocket } from "lucide-react";
import { GUIDES, guidePath } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideVisual } from "@/components/marketing/visuals";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = pageMetadata({
  title: "Guides pour démarrer une micro-activité",
  description: "Guides pratiques de Compléo pour rédiger vos annonces et démarrer une activité de services pour particuliers.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd path="/guides" />
      <main className="container max-w-3xl space-y-8 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Guides</h1>
          <p className="mt-2 text-muted-foreground">Des guides pratiques pour démarrer une micro-activité de services.</p>
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
