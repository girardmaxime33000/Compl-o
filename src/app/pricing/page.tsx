import { FaqSection } from "@/components/marketing/faq";
import { PublicCtas } from "@/components/marketing/ctas";
import { pricingFaq } from "@/lib/seo/faq";
import { formatCents, OFFERS } from "@/lib/offers";
import { MONTHLY_PLAN_DAILY_LISTINGS, PACK_LISTING_CREDITS } from "@/lib/platforms";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Offers } from "@/components/pricing/offers";
import { FREE_MONTHLY_LISTINGS } from "@/lib/platforms";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata = pageMetadata({ title: "Tarifs Compléo : complément de salaire, gratuit, pack ou abonnement", description: "Pour lancer une activité complémentaire près de chez vous, comparez l'offre gratuite, le pack ponctuel, le pack mensuel et l'abonnement annuel de Compléo : annonces IA, simulateur du net et factures PDF.", path: "/pricing" });

const FREE = [
  { label: "Diagnostic et 3 idées d'activités", ok: true },
  { label: `${FREE_MONTHLY_LISTINGS} annonces IA par mois`, ok: true },
  { label: "Simulateur « Net dans la poche »", ok: true },
  { label: "Factures PDF sans TVA", ok: true },
  { label: "Plus d'annonces IA (packs et abonnements)", ok: false },
];
function Features({ items }: { items: { label: string; ok: boolean }[] }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((f) => (
        <li key={f.label} className={f.ok ? "flex gap-2" : "flex gap-2 text-muted-foreground"}>
          {f.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
          {f.label}
        </li>
      ))}
    </ul>
  );
}

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? (await supabase.from("profiles").select("subscription_status").eq("id", user.id).single()).data : null;
  const subscribed = profile?.subscription_status === "active";

  return (
    <>
    <BreadcrumbJsonLd path="/pricing" />
      <SiteHeader />
      <main className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold">Tarifs : lancez votre complément de salaire à petit prix</h1>
      <p className="mt-2 text-muted-foreground">Commencez gratuitement votre activité complémentaire, puis choisissez un pack ou un abonnement quand vous avez besoin de plus d'annonces pour toucher les clients de votre ville.</p>

      <h2 className="mt-8 text-xl font-semibold">Les offres</h2>
      <div className="mt-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle as="h3">Gratuit</CardTitle>
            <CardDescription>Pour démarrer</CardDescription>
            <p className="pt-2 text-3xl font-bold">0 €</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Features items={FREE} />
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={user ? "/dashboard" : "/login"}>{user ? "Mon tableau de bord" : "Commencer gratuitement"}</Link>
            </Button>
          </CardContent>
        </Card>
        <Offers subscribed={subscribed} />
      </div>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold">Comparatif des offres</h2>
        <p className="text-sm text-muted-foreground">
          Le diagnostic, le simulateur et les devis et factures PDF sont inclus dans toutes les offres. Seul le nombre
          d'annonces rédigées par IA change.
        </p>
        <div tabIndex={0} role="region" aria-label="Tableau, défilable horizontalement" className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th scope="col" className="p-3">Offre</th>
                <th scope="col" className="p-3">Prix</th>
                <th scope="col" className="p-3">Annonces IA</th>
                <th scope="col" className="p-3">Engagement</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t"><th scope="row" className="p-3 text-left font-medium">Gratuit</th><td className="p-3">0 €</td><td className="p-3">{FREE_MONTHLY_LISTINGS} par mois</td><td className="p-3">Aucun</td></tr>
              <tr className="border-t"><th scope="row" className="p-3 text-left font-medium">{OFFERS.pack.name}</th><td className="p-3">{formatCents(OFFERS.pack.cents)} €, une fois</td><td className="p-3">{PACK_LISTING_CREDITS} annonces, valables 12 mois</td><td className="p-3">Aucun, pas de renouvellement</td></tr>
              <tr className="border-t"><th scope="row" className="p-3 text-left font-medium">{OFFERS.monthly.name}</th><td className="p-3">{formatCents(OFFERS.monthly.cents)} € par mois</td><td className="p-3">Jusqu'à {MONTHLY_PLAN_DAILY_LISTINGS} par jour</td><td className="p-3">Résiliable à tout moment</td></tr>
              <tr className="border-t"><th scope="row" className="p-3 text-left font-medium">{OFFERS.annual.name}</th><td className="p-3">{formatCents(OFFERS.annual.cents)} € par an</td><td className="p-3">Illimitées</td><td className="p-3">Résiliable à tout moment</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Le quota de l'offre en cours est consommé d'abord, puis les crédits du pack ponctuel. Les annonces sont
          rédigées par IA et sont à relire avant publication. Les droits et quotas sont vérifiés côté serveur.
        </p>
      </section>

      <div className="mt-12">
        <FaqSection items={pricingFaq()} title="Questions sur la facturation et la résiliation" />
      </div>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold">TVA, rétractation et conditions de vente</h2>
        <p className="text-sm leading-relaxed">
          Les prix sont affichés en euros, toutes taxes comprises ; la TVA n'est pas applicable le cas échéant, conformément
          aux <Link href="/mentions-legales" className="underline">mentions légales</Link>. Avant le paiement, vous acceptez
          les <Link href="/cgv" className="underline">conditions générales de vente</Link> et les{" "}
          <Link href="/cgu" className="underline">conditions générales d'utilisation</Link> par une case à cocher, et vous
          indiquez si vous demandez l'accès immédiat au contenu numérique, ce qui entraîne la renonciation au droit de
          rétractation de 14 jours une fois le contenu fourni. Ces textes sont des brouillons en attente de relecture par
          un juriste.
        </p>
        <p className="text-sm leading-relaxed">
          Les données personnelles traitées lors de l'achat sont décrites dans la{" "}
          <Link href="/confidentialite" className="underline">politique de confidentialité</Link>. En cas de litige,
          les CGV indiquent le recours à un médiateur de la consommation.
        </p>
      </section>

      <section className="mt-12 space-y-3 rounded-lg border border-primary/40 p-5">
        <h2 className="text-lg font-semibold">Pas encore décidé ?</h2>
        <p className="text-sm text-muted-foreground">Le diagnostic et le simulateur sont gratuits et ne demandent pas de compte.</p>
        <PublicCtas />
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
