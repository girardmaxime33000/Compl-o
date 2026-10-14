import Link from "next/link";
import { Rocket } from "lucide-react";
import { LEGAL } from "@/lib/legal";
import { Button } from "@/components/ui/button";
import { ListingDemo } from "@/components/listings/demo";
import { SiteFooter } from "@/components/marketing/site-footer";

const TITLE = "Exemples d'annonces de services pour micro-activité | Compléo";
const DESCRIPTION =
  "Découvrez des exemples d'annonces pour LeBonCoin, AlloVoisins ou GensDeConfiance. Créez un compte gratuit pour générer la vôtre avec l'IA.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${LEGAL.siteUrl}/generateur-annonce` },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "fr_FR", siteName: LEGAL.siteName },
};

export default function ListingDemoPage() {
  return (
    <>
      <main className="container max-w-3xl space-y-8 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Exemples d'annonces pour votre micro-activité</h1>
          <p className="mt-2 text-muted-foreground">
            Choisissez une activité pour voir le type d'annonce que Compléo vous aide à rédiger. Les tarifs sont des
            estimations selon le marché, à adapter à votre situation.
          </p>
        </div>
        <ListingDemo />
        <div className="space-y-3 rounded-lg border border-primary/40 p-5">
          <h2 className="text-lg font-semibold">Générez votre propre annonce</h2>
          <p className="text-sm text-muted-foreground">
            Avec un compte gratuit, l'IA rédige une annonce adaptée à votre service, votre ville et votre plateforme.
            Annonce générée par IA, à relire avant publication.
          </p>
          <Button asChild size="lg"><Link href="/login?next=/dashboard/listings">Créer un compte gratuit</Link></Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
