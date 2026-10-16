import { writeFileSync } from "node:fs";
import { generateObject } from "ai";
import { afterAll, describe, expect, it } from "vitest";
import { getModel } from "@/lib/ai";
import { buildListingPrompt, outputSchemaFor, SYSTEM_PROMPT } from "@/lib/listing";
import { compliantFake, evaluate, SCENARIOS, versionText, type EvalOutput, type Finding } from "@/lib/listing-eval";

/**
 * Essai de la génération d'annonces EN CONDITIONS RÉELLES (T20 et T21). Ignoré par `npm test` : il appelle le vrai modèle,
 * donc coûte des appels d'API et dépend du fournisseur configuré (AI_PROVIDER, AI_BASE_URL, AI_MODEL, AI_API_KEY...).
 *
 *   LIVE_AI=1   : appelle le modèle configuré, sans toucher à la base ni à Stripe ;
 *   LIVE_AI=dry : sorties fabriquées conformes, pour vérifier le câblage sans modèle.
 *
 * Écrit un rapport lisible (annonces complètes, constats, durées) dans `listing-eval-report.md` (ou LIVE_AI_REPORT).
 * Voir docs/essai-modele-ia.md.
 */
const mode = process.env.LIVE_AI;
const enabled = mode === "1" || mode === "dry";

interface Row { id: string; label: string; ms: number; tokens?: number; output?: EvalOutput; findings: Finding[]; error?: string }
const rows: Row[] = [];

describe.skipIf(!enabled)("essai en conditions réelles de la génération d'annonces", () => {
  for (const scenario of SCENARIOS) {
    it(scenario.id, async () => {
      const started = Date.now();
      const row: Row = { id: scenario.id, label: scenario.label, ms: 0, findings: [] };
      rows.push(row);
      try {
        if (mode === "dry") {
          row.output = compliantFake(scenario);
        } else {
          const result = await generateObject({
            model: getModel(),
            schema: outputSchemaFor(scenario.platforms),
            system: SYSTEM_PROMPT,
            prompt: buildListingPrompt(scenario.input, scenario.platforms),
          });
          row.output = result.object as EvalOutput;
          row.tokens = result.usage?.totalTokens;
        }
      } catch (e) {
        row.error = e instanceof Error ? e.message : String(e);
      }
      row.ms = Date.now() - started;
      if (row.error) throw new Error(`Échec de la génération : ${row.error}`);
      row.findings = evaluate(scenario, row.output as EvalOutput);
      const fails = row.findings.filter((f) => f.level === "fail");
      expect(fails, fails.map((f) => `${f.platform ?? "-"} ${f.rule} : ${f.detail}`).join("\n")).toEqual([]);
      // La route a une limite de 60 s (maxDuration) : un appel plus long échouerait en production.
      expect(row.ms, "durée de l'appel (limite de la route : 60 000 ms)").toBeLessThan(60_000);
    }, 90_000);
  }

  afterAll(() => {
    const lines = [
      `# Essai de la génération d'annonces`,
      ``,
      `Mode : ${mode === "dry" ? "sorties fabriquées (aucun modèle appelé)" : `modèle réel (${process.env.AI_PROVIDER ?? "openai-compatible"} / ${process.env.AI_MODEL ?? "modèle par défaut"})`}. Généré le ${new Date().toISOString()}.`,
      ``,
      `| Scénario | Durée | Tokens | Échecs | Alertes |`,
      `|---|---|---|---|---|`,
      ...rows.map((r) => `| ${r.id} | ${(r.ms / 1000).toFixed(1)} s | ${r.tokens ?? "-"} | ${r.error ? "ERREUR" : r.findings.filter((f) => f.level === "fail").length} | ${r.findings.filter((f) => f.level === "warn").length} |`),
      ``,
    ];
    for (const r of rows) {
      lines.push(`## ${r.id} : ${r.label}`, ``);
      if (r.error) lines.push(`**Erreur** : ${r.error}`, ``);
      for (const f of r.findings) lines.push(`- ${f.level === "fail" ? "**ÉCHEC**" : "alerte"} ${f.platform ?? ""} \`${f.rule}\` : ${f.detail}`);
      if (r.findings.length) lines.push(``);
      for (const [platform, v] of Object.entries(r.output?.versions ?? {})) lines.push(`### ${platform}`, ``, "```", versionText(v), "```", ``);
    }
    writeFileSync(process.env.LIVE_AI_REPORT ?? "listing-eval-report.md", lines.join("\n"));
  });
});
