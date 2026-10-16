import { ImageResponse } from "next/og";
import { LogoMarkImage } from "@/lib/og";

export const dynamic = "force-static";

/** Symbole en PNG 192 × 192, fond transparent : les e-mails n'affichent pas les SVG (utilisé par `email-templates.ts`). */
export function GET() {
  return new ImageResponse(<LogoMarkImage size={192} />, { width: 192, height: 192 });
}
