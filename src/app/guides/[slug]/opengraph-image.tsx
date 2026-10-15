import { findGuide, GUIDES } from "@/lib/guides";
import { GUIDE_THEMES } from "@/components/marketing/visuals";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Guide Compléo";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const guide = findGuide(params.slug);
  const theme = GUIDE_THEMES[params.slug];
  return ogCard({
    kicker: "Guide",
    title: guide?.title ?? "Guide",
    subtitle: guide ? `Mis à jour le ${guide.updated}` : "",
    from: theme?.from ?? "#2563eb",
    to: theme?.to ?? "#1e3a8a",
  });
}
