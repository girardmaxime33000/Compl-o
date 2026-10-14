import { requireUser, isPremium } from "@/lib/auth";
import { FREE_MONTHLY_LISTINGS } from "@/lib/platforms";
import { ListingGenerator } from "@/components/listings/generator";
import type { Listing } from "@/types/database";

export const metadata = { title: "Annonces · Compléo" };

export default async function ListingsPage({ searchParams }: { searchParams: { service?: string } }) {
  const { supabase, user, profile } = await requireUser();

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [{ data: listings }, { count }] = await Promise.all([
    supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20).returns<Listing[]>(),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", monthStart.toISOString()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Générateur d'annonces</h1>
        <p className="text-muted-foreground">Une annonce optimisée pour la plateforme de votre choix, prête à copier.</p>
      </div>
      <ListingGenerator
        initialService={searchParams.service ?? ""}
        initialListings={listings ?? []}
        usedThisMonth={count ?? 0}
        limit={isPremium(profile) ? null : FREE_MONTHLY_LISTINGS}
      />
    </div>
  );
}
