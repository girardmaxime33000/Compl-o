import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Enregistre un appel et indique s'il reste dans la limite de la fenêtre (compteur atomique en base).
 * En cas d'erreur de la base, l'appel est autorisé : une panne de la mesure ne doit pas bloquer les utilisateurs.
 */
export async function withinRateLimit(admin: SupabaseClient, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await admin.rpc("rate_limit_hit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) {
    console.error("rate-limit", key.split(":")[0], error.message);
    return true;
  }
  return data !== false;
}

/** Empreinte de l'adresse IP de l'appelant : seule l'empreinte est stockée, jamais l'adresse. */
export function clientFingerprint(headers: Headers): string | null {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim();
  return ip ? createHash("sha256").update(ip).digest("hex").slice(0, 24) : null;
}
