import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BeforeAfter } from "@/components/marketing/before-after";
import { ACTIVITIES } from "@/lib/activities";

const activity = ACTIVITIES[0];
if (!activity) throw new Error("catalogue vide");
const html = renderToStaticMarkup(createElement(BeforeAfter, { activity }));

describe("<BeforeAfter>", () => {
  it("montre l'annonce sans aide puis l'annonce Compléo, présentées comme des exemples", () => {
    expect(html).toContain("sans aide (exemple)");
    expect(html).toContain("Avec Compléo");
    expect(html).toContain("Exemple rédigé à l&#x27;avance");
    expect(html).toContain("à relire avant publication");
  });

  it("le texte Compléo vient du catalogue, tarif compris", () => {
    expect(html).toContain(activity.title);
    expect(html).toContain(`${activity.rateMin} € à ${activity.rateMax} €`);
  });

  it("n'affiche aucune photo ni chiffre de revenu", () => {
    expect(html).not.toContain("<img");
    expect(html).not.toContain("par mois");
  });
});
