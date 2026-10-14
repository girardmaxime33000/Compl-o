import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Check, Rocket, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { FREE_MONTHLY_LISTINGS } from "@/lib/platforms";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = pageMetadata({ title: "Tarifs simples : gratuit ou Premium", description: "Comparez l'offre gratuite et l'offre Premium de Compléo : annonces IA, simulateur et factures PDF.", path: "/pricing" });

const FREE = [
  { label: "Diagnostic et 3 idées d'activités", ok: true },
  { label: `${FREE_MONTHLY_LISTINGS} annonces IA par mois`, ok: true },
  { label: "Simulateur « Net dans la poche »", ok: true },
  { label: "Factures PDF sans TVA", ok: true },
  { label: "Annonces IA illimitées", ok: false },
];
const PREMIUM = [
  { label: "Tout le plan Gratuit", ok: true },
  { label: "Annonces IA illimitées", ok: true },
  { label: "Toutes les plateformes", ok: true },
  { label: "Résiliable à tout moment", ok: true },
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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? (await supabase.from("profiles").select("subscription_status").eq("id", user.id).single()).data : null;
  const premium = profile?.subscription_status === "active";

  return (
    <>
    <BreadcrumbJsonLd path="/pricing" />
      <main className="container max-w-4xl py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
      <h1 className="text-3xl font-bold">Des tarifs simples</h1>
      <p className="mt-2 text-muted-foreground">Commencez gratuitement, passez Premium quand vous avez besoin de plus d'annonces.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gratuit</CardTitle>
            <CardDescription>Pour démarrer</CardDescription>
            <p className="pt-2 text-3xl font-bold">0 €</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Features items={FREE} />
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={user ? "/dashboard" : "/login"}>{user ? "Mon tableau de bord" : "Commencer gratuitement"}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-primary shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Premium</CardTitle>
              <Badge>Recommandé</Badge>
            </div>
            <CardDescription>Pour passer à la vitesse supérieure</CardDescription>
            <p className="pt-2 text-3xl font-bold">6,99 € <span className="text-base font-normal text-muted-foreground">/ mois</span></p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Features items={PREMIUM} />
            {premium ? (
              <Button asChild size="lg" className="w-full"><Link href="/dashboard">Vous êtes Premium</Link></Button>
            ) : (
              <CheckoutButton />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
