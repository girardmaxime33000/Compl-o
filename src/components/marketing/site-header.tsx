import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/simulateur-micro-entrepreneur", label: "Simulateur", className: "hidden sm:inline-flex" },
  { href: "/activites", label: "Activités", className: "hidden lg:inline-flex" },
  { href: "/guides", label: "Guides", className: "hidden lg:inline-flex" },
  { href: "/pricing", label: "Tarifs", className: "hidden sm:inline-flex" },
] as const;

/**
 * En-tête commun des pages publiques. Le diagnostic gratuit est l'unique action principale ; « Connexion » reste
 * secondaire. Composant statique (pas de lecture de session) pour ne pas rendre les pages SSG dynamiques.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-2">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-primary" aria-label="Compléo, accueil">
          <Rocket className="h-5 w-5" aria-hidden="true" /> Compléo
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-1">
          {LINKS.map(({ href, label, className }) => (
            <Button key={href} asChild variant="ghost" size="sm" className={className}>
              <Link href={href}>{label}</Link>
            </Button>
          ))}
          <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3"><Link href="/login">Connexion</Link></Button>
          <Button asChild size="sm">
            <Link href="/onboarding">
              <span className="sm:hidden">Diagnostic</span>
              <span className="hidden sm:inline">Diagnostic gratuit</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
