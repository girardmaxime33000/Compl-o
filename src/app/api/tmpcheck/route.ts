import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@/components/invoices/invoice-pdf";
import { simulate } from "@/lib/tax";
import { recommend } from "@/lib/activities";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get("pdf")) {
    const buf = await renderToBuffer(InvoicePdf({ invoice: { id: "abcdef12-0000-0000-0000-000000000000", user_id: "u", client_name: "Élodie Martin", amount: 120.5, status: "draft", description: "Montage de meubles — 3 h", document_type: "facture", issue_date: "2026-10-14", created_at: "" }, issuer: { full_name: "Jean Dupont", siret: "12345678901234", address: "1 rue de la Paix, 33000 Bordeaux", email: "j@x.fr" } }));
    return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/pdf" } });
  }
  return NextResponse.json({
    sim: simulate({ monthlyRevenue: 3000, regime: "bnc", unemployment: { enabled: true, monthlyAre: 1200, referenceSalary: 0 } }),
    rec: recommend({ categories: ["bricolage"], equipment: ["outils"], weeklyHours: 8 }).map((r) => `${r.activity.id}:${r.score}:${r.monthlyMin}-${r.monthlyMax}`),
  });
}
