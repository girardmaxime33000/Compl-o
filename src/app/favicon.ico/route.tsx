import { ImageResponse } from "next/og";
import { buildIco } from "@/lib/ico";
import { LogoMarkImage } from "@/lib/og";

export const dynamic = "force-static";

const SIZES = [16, 32, 48];

/** /favicon.ico : symbole en 16, 32 et 48 px, fond transparent, généré au build (aucun fichier binaire dans le dépôt). */
export async function GET() {
  const images = await Promise.all(
    SIZES.map(async (size) => ({
      size,
      png: new Uint8Array(await new ImageResponse(<LogoMarkImage size={size} />, { width: size, height: size }).arrayBuffer()),
    })),
  );
  return new Response(buildIco(images) as BodyInit, { headers: { "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=86400" } });
}
