import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "JobBoost FR",
  description:
    "Générez un complément de revenu : choisissez une micro-activité, rédigez vos annonces par IA et calculez votre net.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
