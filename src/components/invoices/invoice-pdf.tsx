import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Invoice, Profile } from "@/types/database";
import { invoiceNumber, TVA_MENTION } from "@/lib/invoice-number";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  muted: { color: "#64748b" },
  bold: { fontFamily: "Helvetica-Bold" },
  block: { marginBottom: 20 },
  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#cbd5e1", paddingBottom: 6, marginTop: 12 },
  tableRow: { flexDirection: "row", paddingVertical: 8 },
  colDesc: { flexGrow: 1 },
  colAmount: { width: 100, textAlign: "right" },
  total: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16, fontSize: 13, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 40, left: 48, right: 48, fontSize: 9, color: "#64748b" },
});

const fmtEur = (n: number) => `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n).replace(/[  ]/g, " ")} EUR`;
const fmtDate = (iso: string) => iso.split("-").reverse().join("/");

export function InvoicePdf({ invoice, issuer }: { invoice: Invoice; issuer: Pick<Profile, "full_name" | "siret" | "address" | "email"> }) {
  const isQuote = invoice.document_type === "devis";
  return (
    <Document title={`${isQuote ? "Devis" : "Facture"} ${invoiceNumber(invoice)}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{isQuote ? "DEVIS" : "FACTURE"}</Text>
            <Text style={styles.muted}>N° {invoiceNumber(invoice)}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text>Date : {fmtDate(invoice.issue_date)}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.bold}>{issuer.full_name}</Text>
          <Text>{issuer.address}</Text>
          <Text>SIRET : {issuer.siret}</Text>
          {issuer.email && <Text>{issuer.email}</Text>}
        </View>

        <View style={styles.block}>
          <Text style={[styles.muted, { marginBottom: 2 }]}>{isQuote ? "Devis destiné à" : "Facturé à"}</Text>
          <Text style={styles.bold}>{invoice.client_name}</Text>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.colDesc, styles.muted]}>Désignation</Text>
          <Text style={[styles.colAmount, styles.muted]}>Montant</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>{invoice.description}</Text>
          <Text style={styles.colAmount}>{fmtEur(invoice.amount)}</Text>
        </View>

        <View style={styles.total}>
          <Text>Total à payer : {fmtEur(invoice.amount)}</Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <Text>{TVA_MENTION}</Text>
          {isQuote ? (
            <Text style={styles.muted}>Devis valable 30 jours. Bon pour accord (date et signature du client) :</Text>
          ) : (
            <Text style={styles.muted}>Paiement à réception. En cas de retard : pénalités au taux légal et indemnité forfaitaire de recouvrement de 40 EUR.</Text>
          )}
        </View>

        <Text style={styles.footer} fixed>
          {issuer.full_name} · SIRET {issuer.siret} · {TVA_MENTION}
        </Text>
      </Page>
    </Document>
  );
}
