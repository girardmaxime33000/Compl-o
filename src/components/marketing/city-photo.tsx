import Image from "next/image";
import { cityPhoto, unsplashSrc, UNSPLASH_URL, withUtm } from "@/lib/city-images";
import type { City } from "@/lib/cities";
import { cn } from "@/lib/utils";

/** Photo Unsplash d'une ville avec crédit. Retourne null quand aucune photo n'a été sélectionnée. */
export function CityPhoto({ city, priority = false, className }: { city: City; priority?: boolean; className?: string }) {
  const photo = cityPhoto(city);
  if (!photo) return null;
  const height = 480;
  return (
    <figure className={cn("overflow-hidden rounded-2xl border bg-muted", className)}>
      <Image
        // `unoptimized` : l'image reste servie (et redimensionnée) par le CDN d'Unsplash, sans copie ni proxy.
        unoptimized
        src={unsplashSrc(photo, 1200)}
        alt={`Vue de ${city.name}`}
        width={1200}
        height={height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="h-40 w-full object-cover sm:h-56"
      />
      <figcaption className="px-3 py-1.5 text-xs text-muted-foreground">
        Photo :{" "}
        <a href={withUtm(photo.authorUrl)} className="underline" rel="noopener noreferrer">{photo.author}</a> sur{" "}
        <a href={UNSPLASH_URL} className="underline" rel="noopener noreferrer">Unsplash</a>
      </figcaption>
    </figure>
  );
}
