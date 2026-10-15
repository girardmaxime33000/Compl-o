import { activitySlug, ACTIVITIES, findActivityBySlug, formatRate } from "@/lib/activities";
import { ACTIVITY_THEMES } from "@/components/marketing/visuals";
import { publishedUrbanActivities, findPublishedUrbanActivity } from "@/lib/urban-activities";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Micro-activité : tarifs et revenu estimé";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return [...ACTIVITIES.map((a) => ({ slug: activitySlug(a) })), ...publishedUrbanActivities().map((a) => ({ slug: a.slug }))];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const urban = findPublishedUrbanActivity(slug);
  if (urban) return ogCard({ kicker: "Activités", title: urban.name, subtitle: "Tarifs, matériel et revenu net estimé selon votre temps", from: "#0d9488", to: "#134e4a" });
  const activity = findActivityBySlug(slug);
  const theme = ACTIVITY_THEMES[activity?.id ?? ""];
  return ogCard({
    kicker: "Activités",
    title: activity?.title ?? "Micro-activité",
    subtitle: activity ? `Tarif moyen ${formatRate(activity)} · revenu estimé selon votre temps` : "Tarifs et revenu estimé",
    from: theme?.from ?? "#2563eb",
    to: theme?.to ?? "#1e3a8a",
  });
}
