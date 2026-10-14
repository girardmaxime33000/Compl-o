import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Export RGPD (portabilité) : toutes les données du compte connecté, lues avec sa session (RLS). */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const [profile, skills, listings, invoices] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_skills").select("*").eq("user_id", user.id),
    supabase.from("listings").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at"),
  ]);
  if (profile.error || skills.error || listings.error || invoices.error) {
    return NextResponse.json({ error: "Export impossible." }, { status: 500 });
  }

  const body = {
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email ?? null, createdAt: user.created_at },
    profile: profile.data,
    skills: skills.data,
    listings: listings.data,
    invoices: invoices.data,
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="compleo-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
