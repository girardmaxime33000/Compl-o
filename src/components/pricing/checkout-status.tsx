"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const POLL_MS = 2000;
const MAX_ATTEMPTS = 15;

/**
 * Retour de Stripe : le webhook peut arriver après la redirection. Tant que le serveur ne voit pas l'achat
 * (`activated` faux), la page est rechargée toutes les 2 s, 30 s au maximum. Les droits restent vérifiés côté serveur.
 */
export function CheckoutStatus({ activated }: { activated: boolean }) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const attempts = useRef(0);

  useEffect(() => {
    if (activated) {
      // L'achat est pris en compte : on retire le paramètre de l'adresse pour qu'un rechargement n'affiche plus le bandeau.
      window.history.replaceState(null, "", "/dashboard");
      return;
    }
    const timer = setInterval(() => {
      attempts.current += 1;
      if (attempts.current > MAX_ATTEMPTS) {
        clearInterval(timer);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [activated, router]);

  if (activated) {
    return (
      <div className="rounded-md border border-success/40 bg-success/10 p-4 text-sm text-success" role="status">
        Paiement confirmé : votre achat est actif.
      </div>
    );
  }
  if (timedOut) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm" role="status">
        Votre paiement est bien parti, mais l'activation prend plus de temps que prévu. Rechargez la page dans quelques minutes.
        Si rien ne change, écrivez-nous en indiquant l'adresse e-mail de votre compte.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-accent p-4 text-sm" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Activation de votre achat en cours, quelques secondes…
    </div>
  );
}
