import { requireUser } from "@/lib/auth";
import { getQuota } from "@/lib/quota";
import { ListingGenerator } from "@/components/listings/generator";
import { equipmentLabel, recommend } from "@/lib/activities";
import type { Listing, UserSkill } from "@/types/database";

export const metadata = { title: "Annonces | Compléo" };

export default async function ListingsPage(props: { searchParams: Promise<{ service?: string }> }) {
  const searchParams = await props.searchParams;
  const { supabase, user, profile } = await requireUser();

  const [{ data: listings }, quota, { data: skills }] = await Promise.all([
    supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20).returns<Listing[]>(),
    getQuota(supabase, user.id, profile),
    supabase.from("user_skills").select("*").eq("user_id", user.id).returns<UserSkill[]>(),
  ]);

  // Réponses du diagnostic réutilisées pour préremplir le formulaire : la personne les relit et les corrige.
  const answered = skills ?? [];
  const weeklyHours = answered[0]?.weekly_availability_hours;
  const equipment = answered[0]?.equipment_available ?? [];
  const top = answered.length > 0 && weeklyHours != null
    ? recommend({ categories: answered.map((s) => s.category), equipment, weeklyHours }, 1)[0]
    : undefined;
  const prefill = {
    service: searchParams.service ?? top?.activity.title ?? "",
    skills: equipment.length > 0 ? `Matériel : ${equipment.map(equipmentLabel).join(", ")}` : "",
    availability: weeklyHours ? `Environ ${weeklyHours} h par semaine` : "",
    rate: top ? Math.round((top.activity.rateMin + top.activity.rateMax) / 2) : undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Générateur d'annonces</h1>
        <p className="text-muted-foreground">Dites ce que vous savez faire. Vous recevez une annonce adaptée à chaque site, prête à copier.</p>
      </div>
      <ListingGenerator prefill={prefill} initialListings={listings ?? []} quota={quota} />
    </div>
  );
}
