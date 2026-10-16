import { ArrowDown, ArrowRight } from "lucide-react";
import { demoListing } from "@/lib/demo-listings";
import type { Activity } from "@/lib/activities";
import { cn } from "@/lib/utils";

/** Texte volontairement bref : illustre une annonce écrite sans aide, il ne prétend pas citer une annonce réelle. */
const WITHOUT_HELP = "Bricolage pas cher. Disponible. Appelez-moi.";

/**
 * Visuel du hero : la même activité annoncée sans aide, puis avec Compléo. Les deux textes sont des exemples rédigés
 * à l'avance (le second vient du catalogue `activities.ts` via `demoListing`), présentés comme tels.
 */
export function BeforeAfter({ activity, className }: { activity: Activity; className?: string }) {
  const listing = demoListing(activity);
  return (
    <figure className={cn("mx-auto w-full max-w-md space-y-3 md:max-w-none", className)}>
      <div className="rounded-xl border bg-card p-4 text-card-foreground">
        <p className="text-sm font-medium text-muted-foreground">Une annonce écrite sans aide (exemple)</p>
        <p className="mt-2 text-base">{WITHOUT_HELP}</p>
      </div>
      <div className="flex justify-center text-primary" aria-hidden="true">
        <ArrowDown className="h-6 w-6 md:hidden" />
        <ArrowRight className="hidden h-6 w-6 rotate-90 md:block" />
      </div>
      <div className="rounded-xl border-2 border-primary bg-card p-4 text-card-foreground shadow-lg">
        <p className="text-sm font-medium text-primary">Avec Compléo : une annonce prête à publier (exemple)</p>
        <p className="mt-2 text-lg font-semibold leading-snug">{listing.title}</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{listing.body}</p>
      </div>
      <figcaption className="text-center text-xs text-muted-foreground">
        Exemple rédigé à l'avance. Votre annonce est écrite d'après vos réponses, puis à relire avant publication.
      </figcaption>
    </figure>
  );
}
