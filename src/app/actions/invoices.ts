"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  documentType: z.enum(["devis", "facture"]),
  clientName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(3).max(500),
  amount: z.number().positive().max(100_000),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  issuerName: z.string().trim().min(2).max(120),
  issuerSiret: z.string().trim().regex(/^\d{14}$/, "SIRET : 14 chiffres"),
  issuerAddress: z.string().trim().min(5).max(200),
});

export async function createInvoice(input: z.input<typeof createSchema>): Promise<{ ok: boolean; id?: string; error?: string }> {
  const parsed = createSchema.safeParse({ ...input, issuerSiret: input.issuerSiret?.replace(/\s/g, "") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  const d = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  // Mémorise l'identité de l'émetteur pour les prochains documents.
  await supabase.from("profiles").update({ full_name: d.issuerName, siret: d.issuerSiret, address: d.issuerAddress }).eq("id", user.id);

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_name: d.clientName,
      description: d.description,
      amount: d.amount,
      issue_date: d.issueDate,
      document_type: d.documentType,
      status: "draft",
    })
    .select("id")
    .single();
  if (error?.message.includes("DATE_ANTERIEURE")) {
    const last = error.details?.split("-").reverse().join("/");
    return {
      ok: false,
      error: `Une facture ne peut pas être datée avant la précédente${last ? ` (${last})` : ""} : la numérotation doit suivre l'ordre chronologique.`,
    };
  }
  if (error || !data) return { ok: false, error: "Création impossible." };

  revalidatePath("/dashboard/invoices");
  return { ok: true, id: data.id };
}

/** Le statut ne va que vers l'avant (brouillon, envoyé, payé) : la base refuse tout retour en arrière. */
export async function updateInvoiceStatus(id: string, status: "draft" | "sent" | "paid") {
  if (!z.uuid().safeParse(id).success || !["draft", "sent", "paid"].includes(status)) return { ok: false };
  const { error } = await (await createClient()).from("invoices").update({ status }).eq("id", id);
  revalidatePath("/dashboard/invoices");
  return { ok: !error };
}

/** Seuls les devis se suppriment : une facture numérotée est conservée (la base refuse la suppression). */
export async function deleteInvoice(id: string) {
  if (!z.uuid().safeParse(id).success) return { ok: false };
  const { data, error } = await (await createClient()).from("invoices").delete().eq("id", id).eq("document_type", "devis").select("id");
  revalidatePath("/dashboard/invoices");
  return { ok: !error && (data?.length ?? 0) > 0 };
}
