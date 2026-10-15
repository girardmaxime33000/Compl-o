import { ImageResponse } from "next/og";

export const alt = "Compléo : complément de salaire, activités et services près de chez vous";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: 80, background: "#1d4ed8", color: "white",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>Compléo</div>
        <div style={{ fontSize: 44, marginTop: 24 }}>Complément de salaire près de chez vous.</div>
        <div style={{ fontSize: 28, marginTop: 32, opacity: 0.85 }}>Activités locales, annonces, net après cotisations, factures</div>
      </div>
    ),
    size,
  );
}
