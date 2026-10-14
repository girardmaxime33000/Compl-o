import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, Calculator, FileText, Megaphone, Sparkles } from "lucide-react";
import { requireUser, isPremium } from "@/lib/auth";
import { recommend, formatRate, categoryLabel } from "@/lib/activities";
import { PLATFORMS } from "@/lib/platforms";
import { getQuota } from "@/lib/quota";
import { formatCents, OFFERS } from "@/lib/offers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManageSubscription } from "@/components/pricing/manage-subscription";

export const metadata = { title: "Tableau de bord | Compléo" };

export default async function DashboardPage({ searchParams }: { searchParams: { checkout?: string } }) {
  const { supabase, user, profile } = await requireUser();

  const [{ data: skills }, quota] = await Promise.all([
    supabase.from("user_skills").select("category, equipment_available, weekly_availability_hours").eq("user_id", user.id),
    getQuota(supabase, user.id, profile),
  ]);

  const recommendations = skills?.length
    ? recommend({
        categories: skills.map((s) => s.category),
        equipment: skills[0]?.equipment_available ?? [],
        weeklyHours: skills[0]?.weekly_availability_hours ?? 0,
      })
    : [];

  const premium = isPremium(profile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour{profile.full_name ? ` ${profile.full_name}` : ""} 👋</h1>
        <p className="text-muted-foreground">Votre complément de revenu, étape par étape.</p>
      </div>

      {searchParams.checkout === "success" && (
        <div className="rounded-md border border-success/40 bg-success/10 p-4 text-sm text-success" role="status">
          Merci ! Votre achat est en cours d'activation : vos annonces seront disponibles dans un instant.
        </div>
      )}

      {recommendations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Commencez par le diagnostic</CardTitle>
            <CardDescription>3 questions pour découvrir les activités adaptées à votre profil.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/onboarding">Faire le diagnostic <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Vos activités recommandées</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/onboarding">Refaire le diagnostic</Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.map(({ activity, monthlyMin, monthlyMax }) => (
              <Card key={activity.id}>
                <CardHeader>
                  <Badge variant="muted" className="w-fit">{categoryLabel(activity.category)}</Badge>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription>{formatRate(activity)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-semibold text-success">≈ {monthlyMin} € à {monthlyMax} € / mois</p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={`/dashboard/listings?service=${encodeURIComponent(activity.title)}`}>Créer mon annonce</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle>Annonces IA</CardTitle>
            <CardDescription>
              {quota.limit === null
                ? "Illimitées"
                : `${Math.min(quota.used, quota.limit)}/${quota.limit} ${quota.period === "day" ? "aujourd'hui" : "ce mois-ci"}`}
              {quota.credits > 0 ? ` · ${quota.credits} crédit${quota.credits > 1 ? "s" : ""}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent><Button asChild variant="secondary" size="sm"><Link href="/dashboard/listings">Ouvrir</Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Calculator className="h-5 w-5 text-success" />
            <CardTitle>Net dans la poche</CardTitle>
            <CardDescription>Cotisations URSSAF et plafonds</CardDescription>
          </CardHeader>
          <CardContent><Button asChild variant="secondary" size="sm"><Link href="/dashboard/simulator">Simuler</Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Factures</CardTitle>
            <CardDescription>Devis et factures PDF sans TVA</CardDescription>
          </CardHeader>
          <CardContent><Button asChild variant="secondary" size="sm"><Link href="/dashboard/invoices">Gérer</Link></Button></CardContent>
        </Card>
      </section>

      {premium ? (
        <ManageSubscription />
      ) : (
        <Card className="border-primary/30 bg-accent">
          <CardHeader>
            <CardTitle>Plus d'annonces dès {formatCents(OFFERS.pack.cents)} €</CardTitle>
            <CardDescription>Pack ponctuel, pack mensuel ou abonnement annuel pour {Object.values(PLATFORMS).length} plateformes supportées.</CardDescription>
          </CardHeader>
          <CardContent><Button asChild><Link href="/pricing">Voir les offres</Link></Button></CardContent>
        </Card>
      )}
    </div>
  );
}
