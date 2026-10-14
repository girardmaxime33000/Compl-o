import type { Metadata } from "next";
import "./globals.css";
import { LEGAL } from "@/lib/legal";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  metadataBase: new URL(LEGAL.siteUrl),
  title: "Complément de revenu : activités, annonces et factures | Compléo",
  description:
    "Générez un complément de revenu : choisissez une micro-activité, rédigez vos annonces par IA et calculez votre net.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Compléo" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
