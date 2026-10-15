"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { formatCents, OFFERS, type OfferId } from "@/lib/offers";
import { MONTHLY_PLAN_DAILY_LISTINGS, PACK_LISTING_CREDITS } from "@/lib/platforms";

const FEATURES: Record<OfferId, string[]> = {
  pack: [`${PACK_LISTING_CREDITS} annonces IA`, "Paiement unique, sans abonnement", "Utilisables quand votre quota est épuisé", "Valables 12 mois après l'achat"],
  monthly: [`${MONTHLY_PLAN_DAILY_LISTINGS} annonces IA par jour`, "Toutes les plateformes", "Résiliable à tout moment"],
  annual: ["Annonces IA illimitées", "Toutes les plateformes", "Résiliable à tout moment"],
};
const PERIOD: Record<OfferId, string> = { pack: "une fois", monthly: "/ mois", annual: "/ an" };
const DESCRIPTION: Record<OfferId, string> = {
  pack: "Pour un besoin ponctuel",
  monthly: "Pour publier régulièrement",
  annual: "Pour un usage intensif",
};
const ORDER: OfferId[] = ["pack", "monthly", "annual"];

// Équivalent mensuel de l'annuel, calculé à partir des prix affichés.
const annualPerMonth = formatCents(Math.round(OFFERS.annual.cents / 12));

export function Offers({ subscribed }: { subscribed: boolean }) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [waiveWithdrawal, setWaiveWithdrawal] = useState(false);
  const [loading, setLoading] = useState<OfferId | null>(null);
  const { toast } = useToast();

  async function start(offer: OfferId) {
    setLoading(offer);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer, acceptTerms, waiveWithdrawal }),
      });
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Paiement indisponible.");
      window.location.href = data.url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Paiement indisponible.", "error");
      setLoading(null);
    }
  }

  const consentGiven = acceptTerms && waiveWithdrawal;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {ORDER.map((id) => {
          const offer = OFFERS[id];
          const blocked = offer.mode === "subscription" && subscribed;
          return (
            <Card key={id} className={id === "monthly" ? "border-primary shadow-md" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{offer.name}</CardTitle>
                  {id === "monthly" && <Badge>Populaire</Badge>}
                </div>
                <CardDescription>{DESCRIPTION[id]}</CardDescription>
                <p className="pt-2 text-3xl font-bold">
                  {formatCents(offer.cents)} € <span className="text-base font-normal text-muted-foreground">{PERIOD[id]}</span>
                </p>
                {id === "annual" && <p className="text-xs text-muted-foreground">soit environ {annualPerMonth} € / mois</p>}
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-2 text-sm">
                  {FEATURES[id].map((f) => (
                    <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}</li>
                  ))}
                </ul>
                {blocked ? (
                  <Button asChild variant="outline" size="lg" className="w-full"><Link href="/dashboard">Abonnement actif</Link></Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => start(id)} disabled={!consentGiven || loading !== null}>
                    {loading === id && <Loader2 className="h-4 w-4 animate-spin" />} Choisir
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground" aria-label="Paiement">
        <li className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" aria-hidden="true" /> Paiement géré par Stripe</li>
        <li className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Abonnements résiliables à tout moment</li>
      </ul>

      <div className="space-y-2 rounded-md border p-4">
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="mt-0.5" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          <span>
            J'ai lu et j'accepte les <Link href="/cgu" className="underline" target="_blank">CGU</Link>, les{" "}
            <Link href="/cgv" className="underline" target="_blank">CGV</Link> et la{" "}
            <Link href="/confidentialite" className="underline" target="_blank">politique de confidentialité</Link>.
          </span>
        </label>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="mt-0.5" checked={waiveWithdrawal} onChange={(e) => setWaiveWithdrawal(e.target.checked)} />
          <span>
            Je demande l'accès immédiat au contenu numérique et je reconnais perdre mon droit de rétractation de 14 jours
            une fois ce contenu fourni.
          </span>
        </label>
      </div>
    </div>
  );
}
