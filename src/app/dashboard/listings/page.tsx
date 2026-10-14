import { requireUser } from "@/lib/auth";
import { getQuota } from "@/lib/quota";
import { ListingGenerator } from "@/components/listings/generator";
import type { Listing } from "@/types/database";

export const metadata = { title: "Annonces | Compléo" };

export default async function ListingsPage({ searchParams }: { searchParams: { service?: string } }) {
  const { supabase, user, profile } = await requireUser();

  const [{ data: listings }, quota] = await Promise.all([
    supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20).returns<Listing[]>(),
    getQuota(supabase, user.id, profile),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Générateur d'annonces</h1>
        <p className="text-muted-foreground">Une annonce optimisée pour la plateforme de votre choix, prête à copier.</p>
      </div>
      <ListingGenerator initialService={searchParams.service ?? ""} initialListings={listings ?? []} quota={quota} />
    </div>
  );
}
