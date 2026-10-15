import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/marketing/tracked-link";

/**
 * Encart d'action des pages de contenu, placé juste sous l'introduction (visible sans défiler). Une seule action
 * principale : le diagnostic gratuit. Mesuré par `cta_click` (`source` = `encart`).
 */
export function ContentCta({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Diagnostic gratuit"
      className={`flex flex-col gap-3 rounded-lg border border-primary/40 bg-accent/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-semibold">Quelle activité vous correspond ?</p>
          <p className="text-sm text-muted-foreground">Trois questions, sans inscription ni carte bancaire : 3 activités recommandées et un revenu estimé selon votre temps.</p>
        </div>
      </div>
      <Button asChild className="shrink-0">
        <TrackedLink href="/onboarding" trackProps={{ source: "encart", target: "diagnostic" }}>Faire mon diagnostic</TrackedLink>
      </Button>
    </aside>
  );
}
