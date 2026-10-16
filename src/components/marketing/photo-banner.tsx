import type { ReactNode } from "react";
import { PHOTO_RATIOS, photoSrcSet, unsplashSrc, type UnsplashPhoto } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

/**
 * Bandeau dont la hauteur suit le contenu, avec une photo en fond sous un voile sombre (contraste du texte blanc).
 * Crédit : /credits-photos, aucune pastille sur le bandeau. Sans photo : cadre à bordure d'origine, texte aux couleurs du site. Le contenu doit rester lisible dans les deux cas.
 */
export function PhotoBanner({ photo, children, className }: { photo: UnsplashPhoto | undefined; children: ReactNode; className?: string }) {
  if (!photo) {
    return <div className={cn("rounded-lg border border-primary/40 p-6", className)}>{children}</div>;
  }
  const ratio = PHOTO_RATIOS.banner;
  return (
    <div className={cn("relative isolate overflow-hidden rounded-lg bg-muted p-6 text-white sm:p-10 [&_p]:text-white/90", className)} style={photo.color ? { backgroundColor: photo.color } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={unsplashSrc(photo, 1280, 60, Math.round(1280 / ratio))}
        srcSet={photoSrcSet(photo, ratio)}
        sizes="(min-width: 1280px) 1200px, 100vw"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-slate-950/65" />
      {children}
    </div>
  );
}
