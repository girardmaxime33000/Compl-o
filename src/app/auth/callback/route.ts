import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";
import { recordEvent } from "@/lib/analytics-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Inscription = premier passage : compte créé il y a moins de 2 minutes. Aucune donnée personnelle enregistrée.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && Date.now() - new Date(user.created_at).getTime() < 120_000) await recordEvent("signup", null, "/login");
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
