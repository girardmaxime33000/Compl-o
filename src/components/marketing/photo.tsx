import type { ReactNode } from "react";
import { PHOTO_RATIOS, photoSrcSet, UNSPLASH_URL, unsplashSrc, withUtm, type PhotoRatio, type UnsplashPhoto } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

/** Largeur maximale demandée au CDN pour l'attribut `src` (repli des navigateurs sans `srcset`). */
const MAX_WIDTH = 1280;

interface PhotoProps {
  /** Photo sélectionnée. Absente : `fallback` est rendu (ou rien). */
  photo: UnsplashPhoto | undefined;
  /** Texte alternatif en français. Vide (`""`) pour une photo purement décorative. */
  alt: string;
  ratio: PhotoRatio;
  /** Attribut `sizes` : largeur réellement occupée selon l'écran. Obligatoire pour que `srcset` serve la bonne taille. */
  sizes: string;
  /** Image au-dessus de la ligne de flottaison (LCP) : chargement immédiat et priorité haute. */
  priority?: boolean;
  /**
   * `caption` : légende sous la photo. `overlay` : pastille discrète sur la photo.
   * `text` : pastille sans lien, pour une photo placée dans un lien (les liens imbriqués sont invalides) ; le crédit lié
   * figure sur /credits-photos. `page` : crédit uniquement sur /credits-photos (miniatures où aucune pastille ne tient).
   */
  credit?: "caption" | "overlay" | "text" | "page";
  /** Voile dégradé sous le contenu `children` pour garantir le contraste d'un texte en surimpression. */
  overlay?: boolean;
  /** Rendu quand `photo` est absente (p. ex. le dégradé de `visuals.tsx`). */
  fallback?: ReactNode;
  /** Contenu superposé (titre, badge). */
  children?: ReactNode;
  className?: string;
  /** Rendre des <span> block au lieu de <figure>/<div> : requis dans un <button> ou un <a>, qui n'acceptent que du contenu de type texte. */
  phrasing?: boolean;
}

function PlainCredit({ photo, className }: { photo: UnsplashPhoto; className?: string }) {
  return <span className={className}>Photo : {photo.author} / Unsplash</span>;
}

function Credit({ photo, className }: { photo: UnsplashPhoto; className?: string }) {
  return (
    <span className={className}>
      Photo :{" "}
      <a href={withUtm(photo.authorUrl)} className="underline" rel="noopener noreferrer">{photo.author}</a> sur{" "}
      <a href={UNSPLASH_URL} className="underline" rel="noopener noreferrer">Unsplash</a>
    </span>
  );
}

/**
 * Photo Unsplash générique : hotlink (images.unsplash.com), recadrée et redimensionnée par le CDN, `srcset`, ratio réservé
 * (aucun CLS), crédit conforme aux directives de l'API. <img> et non next/image : Next ne doit ni copier ni proxifier l'image.
 */
export function Photo({ photo, alt, ratio, sizes, priority = false, credit = "caption", overlay = false, fallback, children, className, phrasing = false }: PhotoProps) {
  const Figure = phrasing ? "span" : "figure";
  const Box = phrasing ? "span" : "div";
  if (!photo) return fallback ? <>{fallback}</> : null;
  const r = PHOTO_RATIOS[ratio];
  return (
    <Figure className={cn("overflow-hidden bg-muted", phrasing && "block", className)} style={photo.color ? { backgroundColor: photo.color } : undefined}>
      {priority && <link rel="preconnect" href="https://images.unsplash.com" />}
      <Box className={cn("relative", phrasing && "block")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={unsplashSrc(photo, MAX_WIDTH, 60, Math.round(MAX_WIDTH / r))}
          srcSet={photoSrcSet(photo, r)}
          sizes={sizes}
          alt={alt}
          width={MAX_WIDTH}
          height={Math.round(MAX_WIDTH / r)}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          style={{ aspectRatio: String(r) }}
          className="block w-full object-cover"
        />
        {overlay && <Box aria-hidden="true" className={cn("pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent", phrasing && "block")} />}
        {children && <Box className="absolute inset-0 flex flex-col justify-end p-4 text-white">{children}</Box>}
        {credit === "text" && (
          <PlainCredit photo={photo} className="absolute bottom-1 right-1 max-w-[90%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white" />
        )}
        {credit === "overlay" && (
          <Credit photo={photo} className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white [&_a]:text-white" />
        )}
      </Box>
      {credit === "caption" && (
        phrasing
          ? <span className="block px-3 py-1.5 text-xs text-muted-foreground"><Credit photo={photo} /></span>
          : <figcaption className="px-3 py-1.5 text-xs text-muted-foreground"><Credit photo={photo} /></figcaption>
      )}
    </Figure>
  );
}
