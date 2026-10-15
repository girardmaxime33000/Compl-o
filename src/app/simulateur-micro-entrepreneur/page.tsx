import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd, WebApplicationJsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/marketing/faq";
import { simulatorFaq } from "@/lib/seo/faq";
import { eur, simulate, TAX_PARAMS } from "@/lib/tax";
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

const pct = (rate: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(rate * 100)} %`;
const euro0 = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} €`;

const EXAMPLE_REVENUE = 800;

export default function PublicSimulatorPage() {
  const t = TAX_PARAMS;
  const exampleBic = simulate({ monthlyRevenue: EXAMPLE_REVENUE, regime: "bic" });
  const exampleBnc = simulate({ monthlyRevenue: EXAMPLE_REVENUE, regime: "bnc" });
  const exampleAre = simulate({
    monthlyRevenue: EXAMPLE_REVENUE,
    regime: "bic",
    unemployment: { enabled: true, monthlyAre: 1000, referenceSalary: 0 },
  });
  return (
    <>
      <BreadcrumbJsonLd path="/simulateur-micro-entrepreneur" />
      <WebApplicationJsonLd name="Simulateur micro-entrepreneur : net dans la poche" description={DESCRIPTION} path="/simulateur-micro-entrepreneur" />
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

        <Simulator headingLevel="h2" />

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

        <div className="max-w-3xl space-y-10">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Taux de cotisations en vigueur en 2026</h2>
            <p className="text-sm leading-relaxed">
              Le micro-social se calcule sur le chiffre d'affaires encaissé, sans déduction de charges :{" "}
              <strong>{pct(t.urssafRate.bic)}</strong> pour les prestations de services commerciales ou artisanales (BIC),{" "}
              <strong>{pct(t.urssafRate.bnc)}</strong> pour les professions libérales non réglementées (BNC) et{" "}
              {pct(t.urssafRateSales)} pour la vente de marchandises.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Seuils de TVA : la franchise en base</h2>
            <p className="text-sm leading-relaxed">
              Tant que votre chiffre d'affaires annuel reste sous {euro0(t.vatThreshold)} en prestations de services (seuil
              majoré : {euro0(t.vatThresholdMajored)}) ou {euro0(t.vatThresholdSales)} pour les activités commerciales (seuil
              majoré : {euro0(t.vatThresholdSalesMajored)}), vous ne facturez pas la TVA et vos factures portent la mention
              « TVA non applicable, art. 293 B du CGI ». Le <Link href="/guides/franchise-tva-micro-entrepreneur" className="underline">guide sur la franchise de TVA</Link> détaille le dépassement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Plafonds de chiffre d'affaires du régime micro</h2>
            <p className="text-sm leading-relaxed">
              Le régime micro est ouvert jusqu'à {euro0(t.microCeilingServices)} de chiffre d'affaires annuel pour les
              prestations de services et {euro0(t.microCeilingSales)} pour la vente de marchandises. Consultez le{" "}
              <Link href="/guides/plafonds-micro-entreprise-2026" className="underline">guide des plafonds et taux 2026</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Cumul avec le chômage</h2>
            <p className="text-sm leading-relaxed">
              En cas de cumul avec l'ARE, le simulateur retient un revenu d'activité après abattement forfaitaire
              ({pct(t.areAbatement.bnc)} en BNC, {pct(t.areAbatement.bic)} en BIC) et déduit {pct(t.areReductionRate)} de ce
              revenu de l'allocation. Seule France Travail calcule votre allocation réelle ; voir le{" "}
              <Link href="/guides/cumul-chomage-micro-entreprise" className="underline">guide sur le cumul chômage et micro-entreprise</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Exemple chiffré</h2>
            <p className="text-sm leading-relaxed">
              Pour {eur(EXAMPLE_REVENUE)} de chiffre d'affaires par mois : cotisations de {eur(exampleBic.urssaf)} en BIC, soit
              un net de {eur(exampleBic.netMonthly)} avant impôt ({eur(exampleBic.netAnnual)} par an), ou cotisations de{" "}
              {eur(exampleBnc.urssaf)} en BNC, soit {eur(exampleBnc.netMonthly)}. Avec une ARE de {eur(1000)} par mois en BIC,
              l'allocation estimée après cumul est de {eur(exampleAre.unemployment!.areAfterCumul)} et le total mensuel
              (allocation et net) de {eur(exampleAre.unemployment!.totalMonthly)}. Exemple illustratif calculé avec les mêmes
              paramètres que l'outil, ne constitue pas un conseil fiscal.
            </p>
          </section>

          <FaqSection items={simulatorFaq()} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
