import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/marketing/tracked-link";

/**
 * CTA principal (diagnostic) et CTA secondaire (simulateur) des pages publiques.
 * `source` = emplacement (hero, final, page) et `visual` = version du visuel voisin, pour la mesure `cta_click`.
 */
export function PublicCtas({ className, source = "page", visual }: { className?: string; source?: string; visual?: "photo" | "none" }) {
  const base = { source, ...(visual ? { visual } : {}) };
  return (
    <div className={className ?? "flex flex-col gap-3 sm:flex-row"}>
      <Button asChild size="lg">
        <TrackedLink href="/onboarding" trackProps={{ ...base, target: "diagnostic" }}>Faire mon diagnostic gratuit</TrackedLink>
      </Button>
      <Button asChild size="lg" variant="outline">
        <TrackedLink href="/simulateur-micro-entrepreneur" trackProps={{ ...base, target: "simulateur" }}>Estimer mon net</TrackedLink>
      </Button>
    </div>
  );
}
