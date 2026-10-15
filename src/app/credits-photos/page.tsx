import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PhotoCredits, type PhotoCreditEntry } from "@/components/marketing/photo-credits";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { ACTIVITIES } from "@/lib/activities";
import { URBAN_ACTIVITIES } from "@/lib/urban-activities";
import { sitePhotoEntries } from "@/lib/site-images";
import { CITIES } from "@/lib/cities";
import { cityPhoto, UNSPLASH_URL } from "@/lib/city-images";
import { legalMetadata } from "@/lib/seo";

export const metadata = legalMetadata({
  title: "Crédits photos",
  description: "Photographes dont les images, publiées sur Unsplash, illustrent les pages de Compléo.",
  path: "/credits-photos",
});

function siteLabel(key: string): string {
  if (key === "hero:home") return "Accueil";
  const [kind, id = ""] = key.split(":");
  if (kind === "activity") return ACTIVITIES.find((a) => a.id === id)?.title ?? id;
  if (kind === "urban") return URBAN_ACTIVITIES.find((a) => a.slug === id)?.name ?? id;
  return key;
}

const ENTRIES: PhotoCreditEntry[] = [
  ...sitePhotoEntries().map(([key, photo]) => ({ label: siteLabel(key), photo })),
  ...CITIES.flatMap((c) => {
    const photo = cityPhoto(c);
    return photo ? [{ label: c.name, photo }] : [];
  }),
];

export default function PhotoCreditsPage() {
  return (
    <>
      <BreadcrumbJsonLd path="/credits-photos" />
      <SiteHeader />
      <main className="container max-w-3xl space-y-6 py-10">
        <h1 className="text-3xl font-bold">Crédits photos</h1>
        <p className="text-sm text-muted-foreground">
          Les photographies du site proviennent de <a href={UNSPLASH_URL} className="underline" rel="noopener noreferrer">Unsplash</a>
          {" "}et restent la propriété de leurs auteurs. Leur présence n'implique aucun partenariat ni aucune recommandation de
          leur part.
        </p>
        <PhotoCredits entries={ENTRIES} />
      </main>
      <SiteFooter />
    </>
  );
}
