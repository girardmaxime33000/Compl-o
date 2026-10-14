"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CheckoutButton({ label = "Passer Premium" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [waiveWithdrawal, setWaiveWithdrawal] = useState(false);
  const { toast } = useToast();

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptTerms, waiveWithdrawal }),
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
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
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
      <Button onClick={start} disabled={loading || !acceptTerms || !waiveWithdrawal} size="lg" className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </Button>
    </div>
  );
}
