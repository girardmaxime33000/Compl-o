import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_BLUE, LOGO_ARC, LOGO_PLUS, LOGO_VIEWBOX } from "@/lib/brand";
import { newsletterConfirmationEmail, onboardingDay1 } from "@/lib/email-templates";

const read = (p: string) => readFileSync(p, "utf8");

describe("identité visuelle", () => {
  it("les fichiers SVG du dépôt reprennent exactement la géométrie de brand.ts", () => {
    for (const [file, color] of [["public/logo/logo-mark.svg", BRAND_BLUE], ["public/logo/logo-mark-white.svg", "#ffffff"], ["src/app/icon.svg", BRAND_BLUE]] as const) {
      const svg = read(file);
      expect(svg, file).toContain(`viewBox="${LOGO_VIEWBOX}"`);
      expect(svg, file).toContain(`d="${LOGO_ARC.d}" stroke-width="${LOGO_ARC.strokeWidth}"`);
      expect(svg, file).toContain(`d="${LOGO_PLUS.d}" stroke-width="${LOGO_PLUS.strokeWidth}"`);
      expect(svg, file).toContain(`stroke="${color}"`);
    }
  });

  it("le symbole tient dans la grille avec une marge (aucun tracé hors cadre)", () => {
    const nums = `${LOGO_ARC.d} ${LOGO_PLUS.d}`.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    expect(Math.max(...nums)).toBeLessThanOrEqual(120);
  });

  it("les e-mails affichent le logo par une URL absolue en PNG (les SVG ne sont pas pris en charge)", () => {
    for (const mail of [onboardingDay1("11111111-1111-4111-8111-111111111111"), newsletterConfirmationEmail("https://exemple.fr/c?t=1")]) {
      expect(mail.html).toMatch(/<img src="https?:\/\/[^"]+\/logo\/mark\.png" width="32" height="32" alt=""/);
    }
  });
});
