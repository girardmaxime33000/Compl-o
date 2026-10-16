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

describe("logo horizontal et favicon", () => {
  it("logo.svg et logo-white.svg : symbole identique à brand.ts, nom en tracés (aucun élément <text>), couleurs attendues", () => {
    for (const [file, color] of [["public/logo/logo.svg", BRAND_BLUE], ["public/logo/logo-white.svg", "#ffffff"]] as const) {
      const svg = read(file);
      expect(svg, file).toContain(`d="${LOGO_ARC.d}" stroke-width="${LOGO_ARC.strokeWidth}"`);
      expect(svg, file).toContain(`d="${LOGO_PLUS.d}" stroke-width="${LOGO_PLUS.strokeWidth}"`);
      expect(svg, file).toContain(`fill="${color}" d="M`);
      expect(svg, file).not.toContain("<text");
      expect(svg, file).toMatch(/viewBox="0 0 \d+(\.\d)? \d+(\.\d)?"/);
    }
  });

  it("buildIco : en-tête, entrées et décalages cohérents, PNG conservés tels quels", async () => {
    const { buildIco } = await import("@/lib/ico");
    const png16 = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
    const png32 = new Uint8Array([137, 80, 78, 71, 9, 9, 9, 9, 9]);
    const ico = buildIco([{ size: 16, png: png16 }, { size: 32, png: png32 }]);
    const v = new DataView(ico.buffer);
    expect([v.getUint16(0, true), v.getUint16(2, true), v.getUint16(4, true)]).toEqual([0, 1, 2]);
    expect([ico[6], ico[7]]).toEqual([16, 16]);
    expect([ico[22], ico[23]]).toEqual([32, 32]);
    const off0 = v.getUint32(6 + 12, true);
    const off1 = v.getUint32(22 + 12, true);
    expect(off0).toBe(6 + 32);
    expect(off1).toBe(off0 + png16.length);
    expect(v.getUint32(6 + 8, true)).toBe(png16.length);
    expect(Array.from(ico.slice(off0, off0 + png16.length))).toEqual(Array.from(png16));
    expect(Array.from(ico.slice(off1))).toEqual(Array.from(png32));
    expect(ico.length).toBe(off1 + png32.length);
  });
});
