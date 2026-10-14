import { LEGAL } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { Info, Rocket } from "lucide-react";
import { TVA_MENTION } from "@/lib/invoice-number";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";

const TITLE = "Modèle de facture et devis auto-entrepreneur";
const DESCRIPTION =
  "Aperçu d'un modèle de facture et de devis pour micro-entrepreneur, avec la mention de TVA non applicable. Créez et téléchargez votre PDF après inscription gratuite.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/modele-facture-auto-entrepreneur" });

const MENTIONS = [
  "Numéro et date du document",
  "Identité de l'émetteur : nom, adresse, SIRET",
  "Identité du client",
  "Désignation de la prestation et montant",
  TVA_MENTION,
  "Conditions de paiement et pénalités de retard (factures)",
  "Durée de validité et bon pour accord (devis)",
];

export default function InvoiceTemplatePage() {
  return (
    <>
      <BreadcrumbJsonLd path="/modele-facture-auto-entrepreneur" />
      <main className="container max-w-4xl space-y-8 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Modèle de facture et de devis pour auto-entrepreneur</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Voici l'aperçu du document produit par Compléo. Créez un compte gratuit pour renseigner vos informations et
            télécharger votre PDF.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link href="/login?next=/dashboard/invoices">Créer ma facture (compte gratuit)</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/simulateur-micro-entrepreneur">Simuler mon net</Link></Button>
        </div>

        <section aria-label="Aperçu de facture" className="space-y-2">
          <p className="text-xs text-muted-foreground">Exemple fictif, données d'illustration.</p>
          <div className="space-y-6 rounded-lg border bg-white p-6 text-sm text-slate-900 shadow-sm sm:p-10">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">FACTURE</p>
                <p className="text-slate-500">N° F-2026-001</p>
              </div>
              <p>Date : 14/10/2026</p>
            </div>
            <div>
              <p className="font-semibold">Prénom Nom (exemple)</p>
              <p>1 rue d'Exemple, 00000 Ville</p>
              <p>SIRET : 000 000 000 00000</p>
            </div>
            <div>
              <p className="text-slate-500">Facturé à</p>
              <p className="font-semibold">Client (exemple)</p>
            </div>
            <div>
              <div className="flex justify-between border-b pb-2 text-slate-500"><span>Désignation</span><span>Montant</span></div>
              <div className="flex justify-between gap-4 py-3"><span>Prestation de service (exemple)</span><span>100,00 EUR</span></div>
            </div>
            <p className="text-right text-base font-semibold">Total à payer : 100,00 EUR</p>
            <div>
              <p>{TVA_MENTION}</p>
              <p className="text-slate-500">
                Paiement à réception. En cas de retard : pénalités au taux légal et indemnité forfaitaire de recouvrement
                de 40 EUR.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Ce que contient le document</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {MENTIONS.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <div role="note" className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Modèle indicatif ne constituant pas un conseil juridique ou fiscal. La mention de TVA doit correspondre à
              votre situation. Vérifiez les mentions obligatoires sur{" "}
              <a className="underline" href="https://entreprendre.service-public.fr" rel="noopener noreferrer">entreprendre.service-public.fr</a>{" "}
              et <a className="underline" href="https://www.autoentrepreneur.urssaf.fr" rel="noopener noreferrer">autoentrepreneur.urssaf.fr</a>.
              Dernière mise à jour : {LEGAL.lastUpdate}.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
