import { activitySlug, ACTIVITIES, findActivityBySlug, formatRate } from "@/lib/activities";
import { ACTIVITY_THEMES } from "@/components/marketing/visuals";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Micro-activité : tarifs et revenu estimé";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return ACTIVITIES.map((a) => ({ slug: activitySlug(a) }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const activity = findActivityBySlug(params.slug);
  const theme = ACTIVITY_THEMES[activity?.id ?? ""];
  return ogCard({
    kicker: "Activités",
    title: activity?.title ?? "Micro-activité",
    subtitle: activity ? `Tarif moyen ${formatRate(activity)} · revenu estimé selon votre temps` : "Tarifs et revenu estimé",
    from: theme?.from ?? "#2563eb",
    to: theme?.to ?? "#1e3a8a",
  });
}
