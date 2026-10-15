import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LEGAL } from "@/lib/legal";
import { ToastProvider } from "@/components/ui/toast";

// Police auto-hébergée par next/font (aucune requête vers Google au chargement des pages).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(LEGAL.siteUrl),
  title: "Complément de salaire : activités, annonces et factures près de chez vous | Compléo",
  description:
    "Complément de salaire et complément de revenu : trouvez une activité complémentaire en micro-entreprise dans votre ville, rédigez votre annonce et estimez votre net après cotisations.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Compléo" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
