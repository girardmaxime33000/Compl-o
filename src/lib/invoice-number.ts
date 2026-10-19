import type { Invoice } from "@/types/database";

export const TVA_MENTION = "TVA non applicable, art. 293 B du CGI";

/** Numéro du document : attribué par la base à la création (séquentiel, sans trou), jamais recalculé. */
export const invoiceNumber = (inv: Pick<Invoice, "reference">) => inv.reference;
