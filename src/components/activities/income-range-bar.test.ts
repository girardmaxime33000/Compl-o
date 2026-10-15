import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IncomeRangeBar } from "@/components/activities/income-range-bar";

const bar = (min: number, max: number, scaleMax: number) => renderToStaticMarkup(createElement(IncomeRangeBar, { min, max, scaleMax }));

describe("<IncomeRangeBar>", () => {
  it("positionne la fourchette sur l'échelle commune", () => {
    const html = bar(250, 500, 1000);
    expect(html).toContain("left:25%");
    expect(html).toContain("width:25%");
  });

  it("la ligne la plus haute atteint la fin de l'échelle", () => {
    const html = bar(800, 1000, 1000);
    expect(html).toContain("left:80%");
    expect(html).toContain("width:20%");
  });

  it("reste visible quand min et max sont égaux et ne dépasse jamais l'échelle", () => {
    expect(bar(500, 500, 1000)).toContain("width:2%");
    expect(bar(0, 5000, 1000)).toContain("width:100%");
  });

  it("échelle nulle : pas de NaN", () => {
    expect(bar(0, 0, 0)).not.toContain("NaN");
  });

  it("décorative : masquée aux lecteurs d'écran", () => {
    expect(bar(1, 2, 3)).toContain('aria-hidden="true"');
  });
});
