"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { CONSENT_EVENT, CONSENT_OPEN_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

const UMAMI_SRC = "https://cloud.umami.is/script.js";

/**
 * Bandeau de consentement et chargement conditionnel d'Umami : le script n'est inséré qu'après un « Accepter ».
 * Refuser et accepter ont le même poids visuel ; le refus est un clic, sans écran intermédiaire.
 */
type Snapshot = ConsentChoice | "none" | "pending";

function subscribe(notify: () => void) {
  window.addEventListener(CONSENT_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CONSENT_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}
const getSnapshot = (): Snapshot => readConsent()?.choice ?? "none";
// Rendu serveur et hydratation : rien n'est affiché ni chargé tant que le navigateur n'a pas été lu.
const getServerSnapshot = (): Snapshot => "pending";

export function CookieConsent({ umamiWebsiteId }: { umamiWebsiteId: string }) {
  const choice = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [reopened, setReopened] = React.useState(false);

  React.useEffect(() => {
    const onOpen = () => setReopened(true);
    const onChoice = () => setReopened(false);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    window.addEventListener(CONSENT_EVENT, onChoice);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
      window.removeEventListener(CONSENT_EVENT, onChoice);
    };
  }, []);

  const open = choice === "none" || (choice !== "pending" && reopened);

  return (
    <>
      {choice === "accepted" && (
        <Script
          src={UMAMI_SRC}
          data-website-id={umamiWebsiteId}
          data-exclude-search="true"
          data-do-not-track="true"
          strategy="afterInteractive"
        />
      )}
      {open && (
        <div
          role="region"
          aria-label="Gestion des cookies"
          className="fixed inset-x-0 bottom-0 z-[60] border-t bg-card p-4 shadow-lg sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-md sm:rounded-lg sm:border"
        >
          <p className="text-sm font-medium text-foreground">Mesure d'audience</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Avec votre accord, nous mesurons la fréquentation du site (pages vues, provenance) avec Umami Cloud, sans cookie
            publicitaire ni adresse IP conservée. Refuser n'a aucune incidence sur l'usage du site. Vous pouvez changer d'avis
            à tout moment via « Gérer mes cookies » en bas de page.{" "}
            <Link href="/confidentialite" className="text-primary underline">En savoir plus</Link>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => writeConsent("refused")}>Refuser</Button>
            <Button type="button" variant="outline" onClick={() => writeConsent("accepted")}>Accepter</Button>
          </div>
        </div>
      )}
    </>
  );
}
