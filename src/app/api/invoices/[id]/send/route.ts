import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InvoicePdf } from "@/components/invoices/invoice-pdf";
import { invoiceNumber } from "@/lib/invoice-number";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { invoiceEmail } from "@/lib/email-templates";
import type { Invoice } from "@/types/database";

export const runtime = "nodejs";

/** Envois de documents autorisés par utilisateur sur 24 h (limite anti-abus). */
const DAILY_SEND_LIMIT = 20;

const bodySchema = z.object({ to: z.email().max(254) });

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!z.uuid().safeParse(params.id).success) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  if (!isEmailConfigured()) return NextResponse.json({ error: "L'envoi par e-mail n'est pas disponible pour le moment." }, { status: 503 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  // La RLS garantit que seul un document de l'utilisateur est retourné.
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", params.id).single<Invoice>();
  if (!invoice) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  const admin = createAdminClient();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await admin
    .from("email_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("kind", "document_sent")
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_SEND_LIMIT) {
    return NextResponse.json({ error: "Limite d'envois quotidienne atteinte. Réessayez demain." }, { status: 429 });
  }

  const number = invoiceNumber(invoice);
  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(InvoicePdf({ invoice }));
  } catch (e) {
    console.error("invoice-send pdf render", e);
    return NextResponse.json({ error: "Génération du PDF impossible." }, { status: 500 });
  }
  const mail = invoiceEmail({
    number,
    documentLabel: invoice.document_type === "devis" ? "Devis" : "Facture",
    issuerName: invoice.issuer_name ?? "Votre prestataire",
    clientName: invoice.client_name,
    amount: Number(invoice.amount),
  });
  // Le destinataire n'est pas conservé : seul le journal d'envoi (utilisateur, document, date) l'est.
  const res = await sendEmail({
    to: body.data.to,
    ...mail,
    replyTo: invoice.issuer_email ?? user.email ?? undefined,
    attachments: [{ filename: `${number}.pdf`, content: Buffer.from(pdf) }],
  });
  if (!res.ok) return NextResponse.json({ error: "Envoi impossible. Réessayez plus tard." }, { status: 502 });

  await admin.from("email_log").insert({ user_id: user.id, kind: "document_sent", ref: `${invoice.id}:${Date.now()}` });
  if (invoice.status === "draft") await supabase.from("invoices").update({ status: "sent" }).eq("id", invoice.id);
  return NextResponse.json({ ok: true });
}
