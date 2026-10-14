import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { Info, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Simulator } from "@/components/simulator/simulator";
import { SiteFooter } from "@/components/marketing/site-footer";

const TITLE = "Simulateur micro-entrepreneur : calculez votre net";
const DESCRIPTION =
  "Estimez gratuitement vos cotisations URSSAF, votre net avant impôts, vos plafonds de TVA et de chiffre d'affaires, et le cumul avec le chômage.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/simulateur-micro-entrepreneur" });

export default function PublicSimulatorPage() {
  return (
    <>
      <BreadcrumbJsonLd path="/simulateur-micro-entrepreneur" />
      <main className="container space-y-6 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Simulateur micro-entrepreneur : votre net dans la poche</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Estimez ce qu'il vous reste après cotisations URSSAF, vérifiez les seuils de TVA et de chiffre d'affaires, et
            simulez le cumul avec l'allocation chômage. Sans inscription.
          </p>
        </div>

        <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Estimation indicative, ne constitue pas un conseil fiscal. Les taux et plafonds évoluent : vérifiez-les sur{" "}
            <a className="underline" href="https://www.autoentrepreneur.urssaf.fr" rel="noopener noreferrer">autoentrepreneur.urssaf.fr</a>{" "}
            et <a className="underline" href="https://www.service-public.fr" rel="noopener noreferrer">service-public.fr</a>.
          </p>
        </div>

        <Simulator />

        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Conservez votre simulation</CardTitle>
            <CardDescription>
              La sauvegarde de vos simulations et leur export en PDF sont réservés aux comptes gratuits.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/login?next=/dashboard/simulator">Créer un compte gratuit</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/onboarding">Faire mon diagnostic d'activité</Link></Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
