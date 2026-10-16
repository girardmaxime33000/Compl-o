"use client";

import { openConsentSettings } from "@/lib/consent";

/** Lien du footer : rouvre le bandeau pour modifier ou retirer le consentement. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Gérer mes cookies
    </button>
  );
}
