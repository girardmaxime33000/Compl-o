import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Carte de partage 1200×630 : marque, titre et sous-titre sur dégradé. Texte seul (aucune donnée inventée). */
export function ogCard({ kicker, title, subtitle, from, to }: { kicker: string; title: string; subtitle: string; from: string; to: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: `linear-gradient(135deg, ${from}, ${to})`, color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700, opacity: 0.9 }}>Compléo · {kicker}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 28, opacity: 0.9 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.8 }}>compleo.work</div>
      </div>
    ),
    OG_SIZE,
  );
}
