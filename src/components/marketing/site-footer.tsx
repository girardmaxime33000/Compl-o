import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="container border-t py-6 text-sm text-muted-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Compléo</p>
        <nav className="flex gap-4">
          <Link href="/mentions-legales" className="hover:text-foreground hover:underline">Mentions légales</Link>
          <Link href="/pricing" className="hover:text-foreground hover:underline">Tarifs</Link>
        </nav>
      </div>
    </footer>
  );
}
