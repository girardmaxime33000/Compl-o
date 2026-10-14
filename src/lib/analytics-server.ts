import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeProps, type ClientEvent, type ServerEvent } from "@/lib/analytics";

/** Enregistre un événement anonyme. Les erreurs sont ignorées : la mesure ne doit jamais bloquer un parcours. */
export async function recordEvent(name: ClientEvent | ServerEvent, props?: unknown, path?: string | null) {
  try {
    const { error } = await createAdminClient()
      .from("analytics_events")
      .insert({ name, path: path ?? null, props: sanitizeProps(props) });
    if (error) console.error("analytics", name, error.message);
  } catch (e) {
    console.error("analytics", name, e);
  }
}
