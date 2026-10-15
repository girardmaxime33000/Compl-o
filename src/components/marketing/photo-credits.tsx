import { UNSPLASH_URL, withUtm, type UnsplashPhoto } from "@/lib/city-images";

export interface PhotoCreditEntry {
  /** Intitulé de l'emplacement (ville, activité, guide). */
  label: string;
  photo: UnsplashPhoto;
}

/** Liste des crédits photo : photographe, page de la photo, Unsplash. Liens avec UTM exigés par l'API. */
export function PhotoCredits({ entries }: { entries: PhotoCreditEntry[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
      {entries.map(({ label, photo }) => (
        <li key={`${label}-${photo.id}`}>
          <span className="font-medium">{label}</span> :{" "}
          <a href={withUtm(photo.pageUrl)} className="underline" rel="noopener noreferrer">photo</a> de{" "}
          <a href={withUtm(photo.authorUrl)} className="underline" rel="noopener noreferrer">{photo.author}</a> sur{" "}
          <a href={UNSPLASH_URL} className="underline" rel="noopener noreferrer">Unsplash</a>
        </li>
      ))}
    </ul>
  );
}
