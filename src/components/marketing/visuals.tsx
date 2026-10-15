import {
  Armchair, Bike, BookOpen, Calculator, Hammer, Languages, Laptop, Megaphone, PawPrint, Receipt, Scale, SprayCan, Sprout,
  Tag, Landmark, Percent, GraduationCap, type LucideIcon,
} from "lucide-react";
import { Photo } from "@/components/marketing/photo";
import type { PhotoRatio, UnsplashPhoto } from "@/lib/unsplash";
import { activityPhoto, guidePhoto } from "@/lib/site-images";
import { cn } from "@/lib/utils";

/**
 * Visuels décoratifs générés (dégradé + pictogramme), sans image à charger : aucun poids réseau, aucun CLS.
 * Ils accompagnent toujours un titre visible, donc masqués aux lecteurs d'écran.
 */
interface Theme {
  icon: LucideIcon;
  from: string;
  to: string;
}

export const ACTIVITY_THEMES: Record<string, Theme> = {
  bricolage: { icon: Hammer, from: "#2563eb", to: "#1e3a8a" },
  montage_meubles: { icon: Armchair, from: "#7c3aed", to: "#4c1d95" },
  soutien_scolaire: { icon: GraduationCap, from: "#0891b2", to: "#164e63" },
  cours_langue: { icon: Languages, from: "#db2777", to: "#831843" },
  coursier: { icon: Bike, from: "#ea580c", to: "#7c2d12" },
  garde_animaux: { icon: PawPrint, from: "#b45309", to: "#78350f" },
  menage: { icon: SprayCan, from: "#0d9488", to: "#134e4a" },
  jardinage: { icon: Sprout, from: "#16a34a", to: "#14532d" },
  aide_informatique: { icon: Laptop, from: "#4f46e5", to: "#312e81" },
  depot_vente: { icon: Tag, from: "#c026d3", to: "#701a75" },
};

export const GUIDE_THEMES: Record<string, Theme> = {
  "annonces-efficaces": { icon: Megaphone, from: "#2563eb", to: "#1e3a8a" },
  "cumul-chomage-micro-entreprise": { icon: Scale, from: "#0891b2", to: "#164e63" },
  "franchise-tva-micro-entrepreneur": { icon: Percent, from: "#16a34a", to: "#14532d" },
  "plafonds-micro-entreprise-2026": { icon: Calculator, from: "#7c3aed", to: "#4c1d95" },
  "premier-devis-micro-entrepreneur": { icon: Receipt, from: "#ea580c", to: "#7c2d12" },
  "micro-entreprise-retraite": { icon: Landmark, from: "#b45309", to: "#78350f" },
};

const FALLBACK: Theme = { icon: BookOpen, from: "#2563eb", to: "#1e3a8a" };

const SIZES = {
  /** Bandeau de carte. */
  card: {
    box: "h-24 rounded-t-lg", icon: "h-10 w-10",
    photo: { ratio: "card" as PhotoRatio, className: "rounded-t-lg", sizes: "(min-width: 768px) 320px, 100vw", credit: "text" as const },
  },
  /** Petite pastille (listes). */
  tile: {
    box: "h-14 w-14 rounded-xl", icon: "h-7 w-7",
    photo: { ratio: "tile" as PhotoRatio, className: "h-14 w-14 shrink-0 rounded-xl", sizes: "56px", credit: "page" as const },
  },
  /** Bandeau en tête de page. */
  hero: {
    box: "h-40 rounded-2xl sm:h-48", icon: "h-16 w-16 sm:h-20 sm:w-20",
    photo: { ratio: "banner" as PhotoRatio, className: "rounded-2xl [&_img]:max-h-56 sm:[&_img]:max-h-72", sizes: "(min-width: 896px) 864px, 100vw", credit: "caption" as const },
  },
} as const;

function Visual({ theme, size, className, photo }: { theme: Theme; size: keyof typeof SIZES; className?: string; photo?: UnsplashPhoto }) {
  const { icon: Icon, from, to } = theme;
  const s = SIZES[size];
  if (photo) {
    // Photo décorative : le titre de l'activité est toujours affiché à côté, donc alt vide.
    return <Photo photo={photo} alt="" priority={size === "hero"} className={cn(s.photo.className, className)} ratio={s.photo.ratio} sizes={s.photo.sizes} credit={s.photo.credit} />;
  }
  return (
    <div
      aria-hidden="true"
      className={cn("relative flex w-full shrink-0 items-center justify-center overflow-hidden text-white", size === "tile" && "w-14", s.box, className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <span className="absolute -bottom-8 right-4 h-24 w-24 rounded-full bg-white/10" />
      <Icon className={cn("relative drop-shadow", s.icon)} strokeWidth={1.6} />
    </div>
  );
}

/** Photo Unsplash de l'activité si elle a été sélectionnée (`activity:<id>`), sinon dégradé et pictogramme. `photo` force une photo. */
export function ActivityVisual({ activityId, size = "card", className, photo }: { activityId: string; size?: keyof typeof SIZES; className?: string; photo?: UnsplashPhoto }) {
  return <Visual theme={ACTIVITY_THEMES[activityId] ?? FALLBACK} size={size} className={className} photo={photo ?? activityPhoto(activityId)} />;
}

/** Photo Unsplash du guide si elle a été sélectionnée (`guide:<slug>`), sinon dégradé et pictogramme. `photo` force une photo. */
export function GuideVisual({ slug, size = "card", className, photo }: { slug: string; size?: keyof typeof SIZES; className?: string; photo?: UnsplashPhoto }) {
  return <Visual theme={GUIDE_THEMES[slug] ?? FALLBACK} size={size} className={className} photo={photo ?? guidePhoto(slug)} />;
}
