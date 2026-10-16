import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/marketing/tracked-link";

/** Libellé du CTA principal, partagé avec la barre mobile : il mène au diagnostic puis à la rédaction de l'annonce. */
export const PRIMARY_CTA_LABEL = "Écrire mon annonce gratuitement";

/**
 * CTA principal (diagnostic) et CTA secondaire (simulateur) des pages publiques.
 * `source` = emplacement (hero, final, page) et `visual` = version du visuel voisin, pour la mesure `cta_click`.
 */
export function PublicCtas({
  className,
  source = "page",
  visual,
  secondary = true,
}: {
  className?: string;
  source?: string;
  visual?: "photo" | "none" | "avant-apres";
  /** Second bouton (simulateur) : retiré là où un seul geste doit rester évident. */
  secondary?: boolean;
}) {
  const base = { source, ...(visual ? { visual } : {}) };
  return (
    <div className={className ?? "flex flex-col gap-3 sm:flex-row"}>
      <Button asChild size="lg">
        <TrackedLink href="/onboarding" trackProps={{ ...base, target: "diagnostic" }}>{PRIMARY_CTA_LABEL}</TrackedLink>
      </Button>
      {secondary && (
        <Button asChild size="lg" variant="outline">
          <TrackedLink href="/simulateur-micro-entrepreneur" trackProps={{ ...base, target: "simulateur" }}>Estimer mon net</TrackedLink>
        </Button>
      )}
    </div>
  );
}
