"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, EQUIPMENT } from "@/lib/activities";

const schema = z.object({
  categories: z.array(z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]])).min(1).max(CATEGORIES.length),
  equipment: z.array(z.enum(EQUIPMENT.map((e) => e.id) as [string, ...string[]])),
  weeklyHours: z.number().int().min(1).max(80),
});

export async function saveOnboarding(input: z.input<typeof schema>): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Données invalides." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  const { error: delError } = await supabase.from("user_skills").delete().eq("user_id", user.id);
  if (delError) return { ok: false, error: "Enregistrement impossible." };

  const { error } = await supabase.from("user_skills").insert(
    parsed.data.categories.map((category) => ({
      user_id: user.id,
      category,
      equipment_available: parsed.data.equipment,
      weekly_availability_hours: parsed.data.weeklyHours,
    })),
  );
  return error ? { ok: false, error: "Enregistrement impossible." } : { ok: true };
}
