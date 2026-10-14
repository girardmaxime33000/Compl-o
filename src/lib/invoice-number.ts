import type { Invoice } from "@/types/database";

export const TVA_MENTION = "TVA non applicable, art. 293 B du CGI";

export function invoiceNumber(inv: Pick<Invoice, "id" | "issue_date" | "document_type">) {
  const prefix = inv.document_type === "devis" ? "D" : "F";
  return `${prefix}-${inv.issue_date.slice(0, 4)}-${inv.id.slice(0, 6).toUpperCase()}`;
}
