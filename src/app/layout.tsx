import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LEGAL } from "@/lib/legal";
import { ToastProvider } from "@/components/ui/toast";

// Police auto-hébergée par next/font (aucune requête vers Google au chargement des pages).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(LEGAL.siteUrl),
  title: "Complément de revenu : activités, annonces et factures | Compléo",
  description:
    "Rendez service près de chez vous : choisissez une micro-activité dans votre ville, rédigez votre annonce avec l'IA et estimez votre net après cotisations.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Compléo" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
