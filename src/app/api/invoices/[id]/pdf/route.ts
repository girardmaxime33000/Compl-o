import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { InvoicePdf } from "@/components/invoices/invoice-pdf";
import { invoiceNumber } from "@/lib/invoice-number";
import type { Invoice } from "@/types/database";

export const runtime = "nodejs";

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!z.uuid().safeParse(params.id).success) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  // La RLS garantit que seule une facture de l'utilisateur est retournée.
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", params.id).single<Invoice>();
  if (!invoice) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(InvoicePdf({ invoice }));
  } catch (e) {
    console.error("invoice-pdf render", e);
    return NextResponse.json({ error: "Génération du PDF impossible." }, { status: 500 });
  }
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceNumber(invoice)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
