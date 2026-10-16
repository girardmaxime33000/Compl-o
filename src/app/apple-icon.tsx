import { ImageResponse } from "next/og";
import { LogoMarkImage } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icône d'écran d'accueil iOS : symbole bleu sur fond blanc, généré (aucun fichier binaire dans le dépôt). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <LogoMarkImage size={140} />
      </div>
    ),
    size,
  );
}
