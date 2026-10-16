import type { PublicTestimonial } from "@/lib/social-proof-server";
import type { UsageProof } from "@/lib/social-proof";

/**
 * Preuve sociale de l'accueil. Rend null tant qu'il n'y a ni compteur réel ni témoignage approuvé : aucune valeur par
 * défaut, aucune note, aucun logo.
 */
export function SocialProof({ usage, testimonials }: { usage: UsageProof | null; testimonials: PublicTestimonial[] }) {
  if (!usage && testimonials.length === 0) return null;
  const nf = new Intl.NumberFormat("fr-FR");
  return (
    <section className="container space-y-4 pb-16" aria-labelledby="avis">
      <h2 id="avis" className="text-3xl font-bold">Ils utilisent Compléo</h2>
      {usage && (
        <p className="text-lg">
          <strong className="text-primary">{nf.format(usage.count)} annonces</strong> rédigées avec Compléo depuis le {usage.sinceLabel}.
        </p>
      )}
      {testimonials.length > 0 && (
        <>
          <ul className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id} className="rounded-xl border bg-card p-5">
                <blockquote className="space-y-3">
                  <p className="whitespace-pre-line">« {t.body} »</p>
                  <footer className="text-sm text-muted-foreground">
                    {t.first_name}
                    {t.city ? `, ${t.city}` : ""}
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Témoignages publiés avec l&apos;accord de leurs auteurs. Compléo n&apos;offre aucune contrepartie pour un avis.
          </p>
        </>
      )}
    </section>
  );
}
