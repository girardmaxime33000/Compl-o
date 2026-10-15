import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/email";

export const runtime = "nodejs";

const page = (message: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Désinscription | Compléo</title></head><body style="font-family:Arial,sans-serif;max-width:480px;margin:48px auto;padding:0 16px"><p>${message}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

async function unsubscribe(userId: string | null, token: string | null) {
  if (!userId || !token || !z.uuid().safeParse(userId).success || !verifyUnsubscribeToken(userId, token)) {
    return page("Lien de désinscription invalide.", 400);
  }
  const { error } = await createAdminClient().from("profiles").update({ email_tips_optin: false }).eq("id", userId);
  if (error) {
    console.error("unsubscribe", error.message);
    return page("Désinscription impossible. Réessayez ou modifiez ce réglage dans Mon compte.", 500);
  }
  return page("Vous êtes désinscrit des e-mails de conseils Compléo.");
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  return unsubscribe(u.searchParams.get("u"), u.searchParams.get("t"));
}

/** Désinscription en un clic (List-Unsubscribe-Post). */
export async function POST(req: Request) {
  const u = new URL(req.url);
  return unsubscribe(u.searchParams.get("u"), u.searchParams.get("t"));
}
