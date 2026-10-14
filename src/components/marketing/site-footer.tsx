import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="container border-t py-6 text-sm text-muted-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Compléo</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/mentions-legales" className="hover:text-foreground hover:underline">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-foreground hover:underline">CGU</Link>
          <Link href="/cgv" className="hover:text-foreground hover:underline">CGV</Link>
          <Link href="/confidentialite" className="hover:text-foreground hover:underline">Confidentialité</Link>
          <Link href="/simulateur-micro-entrepreneur" className="hover:text-foreground hover:underline">Simulateur</Link>
          <Link href="/modele-facture-auto-entrepreneur" className="hover:text-foreground hover:underline">Modèle de facture</Link>
          <Link href="/pricing" className="hover:text-foreground hover:underline">Tarifs</Link>
        </nav>
      </div>
    </footer>
  );
}
