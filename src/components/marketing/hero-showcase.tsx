import { Megaphone, Wallet } from "lucide-react";
import { Photo } from "@/components/marketing/photo";
import { formatRate, type Activity } from "@/lib/activities";
import type { UnsplashPhoto } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

const eur0 = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

interface HeroShowcaseProps {
  /** Photo du hero (lot V1). Absente : panneau coloré, les deux cartes restent affichées. */
  photo?: UnsplashPhoto;
  /** Activité de l'exemple d'annonce (catalogue `activities.ts`). */
  activity: Activity;
  /** Résultat de `simulate()` pour l'exemple chiffré : aucune valeur saisie en dur. */
  example: { monthlyRevenue: number; netMonthly: number };
  className?: string;
}

const cardBase = "rounded-xl border bg-card p-3 text-card-foreground shadow-lg";
/** Sur photo : cartes posées sur l'image, en coin. Sans photo : cartes empilées dans le panneau, sans grand vide entre elles. */
const onPhoto = "absolute w-[62%] max-w-[17rem]";
const stacked = "w-[88%] max-w-sm";

/**
 * Visuel du hero : photo (ou panneau coloré) et deux cartes qui montrent ce que produit l'outil. Les cartes sont des
 * exemples, présentés comme tels, et les chiffres viennent du simulateur.
 */
export function HeroShowcase({ photo, activity, example, className }: HeroShowcaseProps) {
  const netShare = Math.round((example.netMonthly / example.monthlyRevenue) * 100);
  const card = (position: string) => cn(cardBase, photo ? onPhoto : stacked, photo && position);
  return (
    <div className={cn("relative mx-auto w-full max-w-md md:max-w-none", className)}>
      {photo ? (
        <Photo
          photo={photo}
          alt=""
          ratio="hero"
          sizes="(min-width: 768px) 560px, 100vw"
          priority
          credit="page"
          className="rounded-2xl"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent via-background to-secondary" />
      )}

      <div className={cn(!photo && "relative flex flex-col gap-4 p-5 sm:p-8")}>
        <div className={card("left-3 top-3 sm:left-4 sm:top-4")}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary"><Megaphone className="h-3.5 w-3.5" aria-hidden="true" /> Exemple d'annonce</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{activity.title} près de chez vous</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Tarif indicatif : {formatRate(activity)}</p>
          <p className="mt-2 inline-block rounded bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground">Générée par IA, à relire avant publication</p>
        </div>

        <div className={cn(card("bottom-3 right-3 sm:bottom-4 sm:right-4"), !photo && "self-end")}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-success"><Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Exemple de calcul</p>
          <p className="mt-1 text-xs text-muted-foreground">{eur0(example.monthlyRevenue)} de chiffre d'affaires par mois</p>
          <p className="text-sm font-semibold">≈ {eur0(example.netMonthly)} après cotisations</p>
          <div
            role="img"
            aria-label={`Environ ${netShare} % du chiffre d'affaires reste après cotisations, avant impôt sur le revenu`}
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div className="h-full rounded-full bg-success" style={{ width: `${netShare}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Estimation indicative, avant impôt sur le revenu</p>
        </div>
      </div>
    </div>
  );
}
