import Link from "next/link";
import { Menu, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/marketing/tracked-link";
import { indexablePosts } from "@/lib/blog";

/** Le lien Blog n'apparaît que lorsqu'au moins un article relu est public (pas de lien vers une page vide). */
const LINKS: { href: string; label: string }[] = [
  { href: "/simulateur-micro-entrepreneur", label: "Simulateur" },
  { href: "/activites", label: "Activités" },
  { href: "/guides", label: "Guides" },
  ...(indexablePosts().length > 0 ? [{ href: "/blog", label: "Blog" }] : []),
  { href: "/pricing", label: "Tarifs" },
];

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
          {LINKS.map(({ href, label }) => (
            <Button key={href} asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
              <Link href={href}>{label}</Link>
            </Button>
          ))}
          {/* Menu sans JavaScript : <details> garde l'en-tête statique. Toutes les pages restent atteignables sur mobile. */}
          <details className="group relative lg:hidden">
            <summary
              className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-md px-2 text-sm font-medium hover:bg-accent [&::-webkit-details-marker]:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" /> Menu
            </summary>
            <ul className="absolute right-0 top-11 z-40 w-56 space-y-1 rounded-lg border bg-card p-2 shadow-lg">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="block rounded-md px-3 py-3 text-base hover:bg-accent">{label}</Link>
                </li>
              ))}
              <li className="sm:hidden">
                <Link href="/login" className="block rounded-md px-3 py-3 text-base hover:bg-accent">Connexion</Link>
              </li>
            </ul>
          </details>
          <Button asChild variant="ghost" size="sm" className="hidden px-2 sm:inline-flex sm:px-3"><TrackedLink href="/login" trackProps={{ source: "header", target: "login" }}>Connexion</TrackedLink></Button>
          <Button asChild size="sm">
            <TrackedLink href="/onboarding" trackProps={{ source: "header", target: "diagnostic" }}>
              <span className="sm:hidden">Commencer</span>
              <span className="hidden sm:inline">Écrire mon annonce</span>
            </TrackedLink>
          </Button>
        </nav>
      </div>
    </header>
  );
}
