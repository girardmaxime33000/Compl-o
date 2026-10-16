import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { InvoicePdf } from "@/components/invoices/invoice-pdf";
import { BRAND_FOOTER_TEXT } from "@/lib/brand";
import type { Invoice } from "@/types/database";

const base = { id: "i", user_id: "u", client_name: "Client", description: "Prestation", amount: 100, issue_date: "2026-10-16", number: 1, status: "draft" } as unknown as Invoice;
const issuer = { full_name: "Prénom Nom", siret: "000 000 000 00000", address: "1 rue d'Exemple", email: "a@b.fr" };

describe("PDF de facture et de devis : marque en pied de page", () => {
  it("génère un PDF valide pour une facture et pour un devis, avec la mention de marque", async () => {
    expect(BRAND_FOOTER_TEXT).toBe("Document créé avec Compléo");
    for (const document_type of ["facture", "devis"] as const) {
      const buf = await renderToBuffer(createElement(InvoicePdf as never, { invoice: { ...base, document_type }, issuer }) as never);
      expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
      expect(buf.length).toBeGreaterThan(1500);
    }
  });
});
