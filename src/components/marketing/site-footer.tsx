import Link from "next/link";
import { ACTIVITIES, activitySlug } from "@/lib/activities";
import { activitiesForCity, CITIES, cityPath } from "@/lib/cities";
import { indexablePosts } from "@/lib/blog";

/** Villes affichées dans le footer : les plus peuplées parmi celles qui ont une page. */
const FOOTER_CITIES = CITIES.filter((c) => activitiesForCity(c).length > 0)
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 10);

const linkClass = "hover:text-foreground hover:underline";

export function SiteFooter() {
  return (
    <footer className="container border-t py-8 text-sm text-muted-foreground">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <nav aria-label="Outils et ressources">
          <p className="mb-2 font-medium text-foreground">Compléo</p>
          <ul className="space-y-1">
            <li><Link href="/simulateur-micro-entrepreneur" className={linkClass}>Simulateur</Link></li>
            <li><Link href="/modele-facture-auto-entrepreneur" className={linkClass}>Modèle de facture</Link></li>
            <li><Link href="/generateur-annonce" className={linkClass}>Exemples d'annonces</Link></li>
            <li><Link href="/activites" className={linkClass}>Toutes les activités</Link></li>
            <li><Link href="/guides" className={linkClass}>Guides</Link></li>
            {indexablePosts().length > 0 && <li><Link href="/blog" className={linkClass}>Blog</Link></li>}
            <li><Link href="/pricing" className={linkClass}>Tarifs</Link></li>
          </ul>
        </nav>
        <nav aria-label="Activités">
          <p className="mb-2 font-medium text-foreground">Activités</p>
          <ul className="space-y-1">
            {ACTIVITIES.map((a) => (
              <li key={a.id}><Link href={`/activites/${activitySlug(a)}`} className={linkClass}>{a.title}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Villes">
          <p className="mb-2 font-medium text-foreground">Villes</p>
          <ul className="space-y-1">
            {FOOTER_CITIES.map((c) => (
              <li key={c.slug}><Link href={cityPath(c)} className={linkClass}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informations légales">
          <p className="mb-2 font-medium text-foreground">Informations légales</p>
          <ul className="space-y-1">
            <li><Link href="/mentions-legales" className={linkClass}>Mentions légales</Link></li>
            <li><Link href="/cgu" className={linkClass}>CGU</Link></li>
            <li><Link href="/cgv" className={linkClass}>CGV</Link></li>
            <li><Link href="/confidentialite" className={linkClass}>Confidentialité</Link></li>
            <li><Link href="/credits-photos" className={linkClass}>Crédits photos</Link></li>
          </ul>
        </nav>
      </div>
      <p className="mt-8">© {new Date().getFullYear()} Compléo</p>
    </footer>
  );
}
