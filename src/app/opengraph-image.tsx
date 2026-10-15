import { ImageResponse } from "next/og";

export const alt = "Compléo : un coup de main près de chez vous, un revenu en plus";
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
        <div style={{ fontSize: 44, marginTop: 24 }}>Un coup de main près de chez vous, un revenu en plus.</div>
        <div style={{ fontSize: 28, marginTop: 32, opacity: 0.85 }}>Activités locales, annonces, net après cotisations, factures</div>
      </div>
    ),
    size,
  );
}
