import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobBoost FR",
  description:
    "Générez un complément de revenu : choisissez une micro-activité, rédigez vos annonces par IA et calculez votre net.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
