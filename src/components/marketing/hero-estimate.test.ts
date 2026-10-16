import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ACTIVITIES, BILLABLE_RATIO, monthlyIncomeRange, regimeOf } from "@/lib/activities";
import { simulate } from "@/lib/tax";
import { HeroEstimate, heroEstimateFigures } from "@/components/marketing/hero-estimate";
import { HeroIllustration } from "@/components/marketing/hero-illustration";

const nf = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/[  ]/g, " ").replace(/\s+/g, " ");

describe("carte d'estimation du hero", () => {
  const activity = ACTIVITIES[0]!;

  it("les chiffres sont recalculés depuis le catalogue et les taux, arrondis à la dizaine", () => {
    const f = heroEstimateFigures(activity, 5);
    const { monthlyMin, monthlyMax } = monthlyIncomeRange(activity, 5);
    expect(f.revenue).toBe(`${nf(Math.round(monthlyMin / 10) * 10)} à ${nf(Math.round(monthlyMax / 10) * 10)} €`);
    const r = regimeOf(activity);
    const netMin = simulate({ monthlyRevenue: monthlyMin, regime: r }).netMonthly;
    const netMax = simulate({ monthlyRevenue: monthlyMax, regime: r }).netMonthly;
    expect(f.net).toBe(`${nf(Math.round(netMin / 10) * 10)} à ${nf(Math.round(netMax / 10) * 10)} €`);
    expect(f.billablePercent).toBe(Math.round(BILLABLE_RATIO * 100));
  });

  it("le net est toujours inférieur au chiffre d'affaires, pour toutes les activités", () => {
    for (const a of ACTIVITIES) {
      const { monthlyMin } = monthlyIncomeRange(a, 5);
      const net = simulate({ monthlyRevenue: monthlyMin, regime: regimeOf(a) }).netMonthly;
      expect(net).toBeLessThan(monthlyMin);
    }
  });

  it("rendu : mention d'estimation, aucune garantie de revenu, pas de valeur manquante", () => {
    const t = text(renderToStaticMarkup(createElement(HeroEstimate, { activity, weeklyHours: 5 })));
    expect(t).toContain("Estimation selon profil et temps disponible, sans garantie de revenu");
    expect(t).toContain(activity.title);
    expect(t).toMatch(/environ [\d ]+ à [\d ]+ €/);
    expect(t).not.toMatch(/NaN|undefined|\[object/);
    expect(t).not.toMatch(/gagnez|garanti(?!e)|assuré/i);
  });
});

describe("illustration du hero", () => {
  it("décorative : masquée aux lecteurs d'écran, sans texte ni lien, avec le symbole de la marque", () => {
    const html = renderToStaticMarkup(createElement(HeroIllustration));
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<text");
    expect(html).not.toContain("<a ");
    expect(html).toContain("M99.17 39A42 42 0 1 0 99.17 81"); // arc du logo
  });
});
