import { Callout, Checklist, DataTable, Disclaimer, Section, Sources, Steps, Tldr, num, pct } from "@/components/guides/blocks";
import { TAX_PARAMS as T } from "@/lib/tax";

export function PlafondsMicro2026() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> en 2026, le régime micro-entrepreneur s'applique tant que votre chiffre
        d'affaires hors taxe ne dépasse pas {num(T.microCeilingServices)} € en prestations de services et professions
        libérales, ou {num(T.microCeilingSales)} € en vente de marchandises. Les cotisations sont un pourcentage du
        chiffre d'affaires encaissé : {pct(T.urssafRateSales)} en vente, {pct(T.urssafRate.bic)} en services BIC,{" "}
        {pct(T.urssafRate.bnc)} en professions libérales non réglementées.
      </p>

      <Tldr
        rows={[
          ["Plafond services et libérales", `${num(T.microCeilingServices)} € HT`],
          ["Plafond vente", `${num(T.microCeilingSales)} € HT`],
          ["Activité mixte", `Chiffre d'affaires global ≤ ${num(T.microCeilingSales)} € et chaque activité sous son propre plafond`],
          ["Dépassement", "Le régime ne s'applique plus en N si le plafond est dépassé en N-1 et en N-2"],
          ["Démarrage en cours d'année", "Plafond ajusté au prorata de la durée d'exploitation"],
        ]}
      />

      <Disclaimer />

      <Section title="1. Plafonds et taux 2026">
        <DataTable
          caption="Micro-social 2026"
          head={["Activité", "Taux de cotisations", "Plafond de CA"]}
          rows={[
            ["Vente de marchandises, fourniture de logement", pct(T.urssafRateSales), `${num(T.microCeilingSales)} €`],
            ["Prestations de services BIC", pct(T.urssafRate.bic), `${num(T.microCeilingServices)} €`],
            ["Professions libérales non réglementées (hors Cipav)", pct(T.urssafRate.bnc), `${num(T.microCeilingServices)} €`],
            ["Professions libérales relevant de la Cipav", pct(T.urssafRateCipav), `${num(T.microCeilingServices)} €`],
          ]}
        />
        <p>
          Ces taux couvrent l'ensemble des cotisations de protection sociale obligatoire (maladie-maternité, allocations
          familiales, CSG/CRDS, invalidité-décès, retraites). La contribution à la formation professionnelle s'ajoute.
        </p>
      </Section>

      <Section title="2. Comment le plafond s'apprécie">
        <p>
          Le régime micro s'applique au 1er janvier de l'année N si le chiffre d'affaires HT de N-1 ou de N-2 n'a pas
          dépassé le plafond. Il cesse de s'appliquer si le plafond est dépassé deux années consécutives, N-1 et N-2.
        </p>
        <Callout kind="regle">
          <p>Plafond de chiffre d'affaires du régime micro et seuil de franchise de TVA sont deux limites différentes. Voir le guide sur la franchise de TVA.</p>
        </Callout>
      </Section>

      <Section title="3. Suivre son chiffre d'affaires">
        <Steps
          items={[
            { title: "Noter chaque encaissement", body: "Le chiffre d'affaires déclaré est celui encaissé, pas celui facturé." },
            { title: "Ventiler par catégorie", body: "Si vous cumulez plusieurs activités, déclarez le chiffre d'affaires par catégorie : chacune a son taux." },
            { title: "Cumuler sur l'année civile", body: "Comparez votre total à la fois au plafond global et au plafond de chaque activité." },
            { title: "Anticiper à 80 %", body: "Prévoyez le passage au régime réel ou à une autre structure avant d'atteindre le plafond." },
          ]}
        />
      </Section>

      <Section title="4. Cas pratique">
        <p>
          Un chiffre d'affaires mensuel de 3 500 € en vente de marchandises donne 3 500 × {pct(T.urssafRateSales)} ={" "}
          {num(3500 * T.urssafRateSales)} € de cotisations (exemple de la fiche officielle). En services BIC, le même
          chiffre d'affaires donne {num(3500 * T.urssafRate.bic)} € de cotisations.
        </p>
      </Section>

      <Section title="5. Erreurs fréquentes">
        <ul className="list-disc space-y-1 pl-5">
          <li>Appliquer le taux de la vente à une prestation de services.</li>
          <li>Oublier de proratiser le plafond la première année.</li>
          <li>Déclarer le montant facturé plutôt que le montant encaissé.</li>
        </ul>
        <Callout kind="attention">
          <p>Les plafonds et taux sont revalorisés périodiquement. Vérifiez la fiche officielle chaque début d'année.</p>
        </Callout>
      </Section>

      <Section title="6. Checklist">
        <Checklist
          items={[
            "J'ai identifié ma catégorie d'activité et mon taux",
            "Je suis mon chiffre d'affaires encaissé sur l'année civile",
            "Je ventile mes activités si elles sont mixtes",
            "Je me fixe une alerte à 80 % du plafond",
          ]}
        />
      </Section>

      <Sources
        items={[{ label: "Régime micro-social", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353", verified: "21 février 2026" }]}
      />
    </div>
  );
}
