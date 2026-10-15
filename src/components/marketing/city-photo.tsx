import { Photo } from "@/components/marketing/photo";
import { cityPhoto } from "@/lib/city-images";
import type { City } from "@/lib/cities";
import { cn } from "@/lib/utils";

/** Photo Unsplash d'une ville avec crédit. Retourne null quand aucune photo n'a été sélectionnée. */
export function CityPhoto({ city, priority = false, className }: { city: City; priority?: boolean; className?: string }) {
  return (
    <Photo
      photo={cityPhoto(city)}
      alt={`Vue de ${city.name}`}
      ratio="banner"
      sizes="(min-width: 896px) 864px, 100vw"
      priority={priority}
      className={cn("rounded-2xl border", className)}
    />
  );
}
