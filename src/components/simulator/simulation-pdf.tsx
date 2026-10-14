import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { TAX_PARAMS, type SimulatorResult } from "@/lib/tax";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  muted: { color: "#64748b" },
  bold: { fontFamily: "Helvetica-Bold" },
  section: { marginTop: 22 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 0.5, borderColor: "#e2e8f0" },
  strong: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, fontFamily: "Helvetica-Bold", fontSize: 12 },
  note: { marginTop: 28, fontSize: 8.5, color: "#64748b", lineHeight: 1.4 },
});

const fmtEur = (n: number) =>
  `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n).replace(/[  ]/g, " ")} EUR`;
const fmtPct = (n: number) => `${(n * 100).toFixed(1).replace(".", ",")} %`;
const fmtDate = (d: Date) => d.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

export function SimulationPdf({ result, regime, date = new Date() }: { result: SimulatorResult; regime: "bnc" | "bic"; date?: Date }) {
  return (
    <Document title="Simulation Net dans la poche">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Simulation : net dans la poche</Text>
        <Text style={styles.muted}>Compléo · édité le {fmtDate(date)}</Text>

        <View style={styles.section}>
          <Text style={styles.h2}>Hypothèses</Text>
          <Row label="Chiffre d'affaires mensuel" value={fmtEur(result.monthlyRevenue)} />
          <Row label="Régime retenu" value={`${regime.toUpperCase()} (prestations de services, micro-entreprise)`} />
          <Row label={`Taux de cotisations URSSAF utilisé`} value={fmtPct(result.urssafRate)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Résultat</Text>
          <Row label="Cotisations URSSAF estimées par mois" value={`- ${fmtEur(result.urssaf)}`} />
          <View style={styles.strong}>
            <Text>Net avant impôts par mois</Text>
            <Text>{fmtEur(result.netMonthly)}</Text>
          </View>
          <Row label="Chiffre d'affaires annuel" value={fmtEur(result.annualRevenue)} />
          <Row label="Net annuel estimé" value={fmtEur(result.netAnnual)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Seuils</Text>
          {result.alerts.map((a) => (
            <View key={a.id} wrap={false} style={{ marginBottom: 6 }}>
              <Row label={a.label} value={`${fmtEur(a.annualRevenue)} / ${fmtEur(a.threshold)} par an (${fmtPct(a.ratio)})`} />
              <Text style={styles.muted}>{a.message}</Text>
            </View>
          ))}
        </View>

        {result.unemployment && (
          <View style={styles.section}>
            <Text style={styles.h2}>Cumul avec le chômage (ARE)</Text>
            <Row label="Revenu d'activité retenu (après abattement)" value={fmtEur(result.unemployment.retainedIncome)} />
            <Row label={`Réduction de l'ARE (${fmtPct(TAX_PARAMS.areReductionRate)} du revenu retenu)`} value={`- ${fmtEur(result.unemployment.areReduction)}`} />
            <Row label="ARE versée estimée" value={fmtEur(result.unemployment.areAfterCumul)} />
            <View style={styles.strong}>
              <Text>Total mensuel (ARE + net activité)</Text>
              <Text>{fmtEur(result.unemployment.totalMonthly)}</Text>
            </View>
            {result.unemployment.capped && <Text style={styles.muted}>Le cumul est plafonné à l'ancien salaire de référence.</Text>}
          </View>
        )}

        <Text style={styles.note}>
          Estimation indicative, ne constitue pas un conseil fiscal, juridique ou comptable. Les taux et plafonds évoluent :
          vérifiez-les sur autoentrepreneur.urssaf.fr et service-public.fr ; seul France Travail fait foi pour le cumul avec
          l'ARE. Document généré par Compléo à partir des valeurs saisies.
        </Text>
      </Page>
    </Document>
  );
}
