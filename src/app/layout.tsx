import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LEGAL } from "@/lib/legal";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsent } from "@/components/consent/cookie-consent";

// Police auto-hébergée par next/font (aucune requête vers Google au chargement des pages).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

// Umami Cloud (mesure d'audience sans cookie), chargé après consentement par <CookieConsent> (bandeau, RGPD).
// Présent uniquement en production : les prévisualisations et le développement local ne faussent pas les statistiques
// et n'affichent pas le bandeau. L'identifiant du site est public.
const UMAMI_WEBSITE_ID = "47ee9358-dfb5-495e-904b-723d5a5fee6f";
const UMAMI_ENABLED = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(LEGAL.siteUrl),
  title: "Complément de salaire : activités, annonces et factures près de chez vous | Compléo",
  description:
    "Trouvez une activité près de chez vous pour arrondir vos fins de mois : bricolage, ménage, cours, jardinage. Questionnaire gratuit, sans inscription.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Compléo" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body><ToastProvider>{children}</ToastProvider>
        {UMAMI_ENABLED && <CookieConsent umamiWebsiteId={UMAMI_WEBSITE_ID} />}
      </body>
    </html>
  );
}
