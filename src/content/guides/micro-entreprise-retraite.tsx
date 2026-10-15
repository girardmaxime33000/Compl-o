import { Callout, Checklist, DataTable, Disclaimer, Section, Sources, Steps, Tldr, num } from "@/components/guides/blocks";
import { TAX_PARAMS as T } from "@/lib/tax";

export function MicroEntrepriseRetraite() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> un retraité peut être micro-entrepreneur s'il a liquidé tous ses droits à la
        retraite et respecte les plafonds de chiffre d'affaires. Le cumul avec la pension est total pour une retraite à
        taux plein et au-delà de l'âge légal, sinon il est plafonné.
      </p>

      <Tldr
        rows={[
          ["Conditions", "Avoir liquidé tous ses droits, avoir atteint l'âge légal, avoir cessé tout lien avec l'ancien employeur"],
          ["Cumul sans limite", "Âge légal atteint, carrière complète ou âge du taux plein, toutes pensions liquidées"],
          ["Cumul plafonné", `${num(T.retireeCapCnav)} € par an (Cnav), ${num(T.retireeCapCnavpl)} € (Cnavpl, ZFRR ou zone urbaine prioritaire)`],
          ["Démarche", "Informer la caisse de retraite par écrit dans le mois suivant la reprise d'activité"],
          ["Fiscalité et social", "Micro-fiscal et micro-social, sur le chiffre d'affaires"],
        ]}
      />

      <Disclaimer />

      <Section title="1. Conditions">
        <ul className="list-disc space-y-1 pl-5">
          <li>Vous avez liquidé tous vos droits à la retraite et atteint l'âge légal de départ.</li>
          <li>Vous avez cessé tout lien professionnel avec votre ancien employeur au moment de la rupture du contrat.</li>
          <li>Votre activité est commerciale, artisanale ou libérale relevant de la Cipav ou de la Sécurité sociale des indépendants (professions juridiques, médicales, experts-comptables, artistes-auteurs exclus).</li>
          <li>Votre chiffre d'affaires respecte les plafonds du régime micro.</li>
        </ul>
        <Callout kind="attention">
          <p>Les agents publics ont des règles propres de cumul d'activités. Vérifiez-les auprès de votre administration.</p>
        </Callout>
      </Section>

      <Section title="2. Cumul avec la pension">
        <DataTable
          caption="Cumul emploi-retraite"
          head={["Type", "Conditions", "Limite"]}
          rows={[
            ["Libéralisé", "Âge légal atteint, carrière complète ou âge du taux plein, toutes pensions liquidées", "Aucune"],
            ["Plafonné, régime Cnav", "Conditions du libéralisé non remplies", `${num(T.retireeCapCnav)} € par an (pensions + revenus)`],
            ["Plafonné, ZFRR, zone urbaine prioritaire ou régime Cnavpl", "Conditions du libéralisé non remplies", `${num(T.retireeCapCnavpl)} € par an (pensions + revenus)`],
          ]}
        />
        <p>Au-delà du plafond, les pensions ne sont plus versées. L'activité permet de cotiser pour une seconde retraite, pas pour une troisième.</p>
      </Section>

      <Section title="3. Démarches pas à pas">
        <Steps
          items={[
            { title: "Immatriculer l'activité", body: "Demande d'immatriculation via le guichet des formalités des entreprises." },
            { title: "Informer la caisse de retraite", body: "Par écrit, dans le mois suivant la reprise d'activité, auprès de la Cnav, Carsat, CGSS ou CSS." },
            { title: "Fournir les éléments demandés", body: "Nom et adresse de l'entreprise, date de début, nature et montant des revenus, régimes affiliés, justificatifs, organismes versant une pension." },
            { title: "Déclarer son chiffre d'affaires", body: "Chaque mois ou trimestre sur autoentrepreneur.urssaf.fr." },
          ]}
        />
      </Section>

      <Section title="4. Erreurs fréquentes">
        <ul className="list-disc space-y-1 pl-5">
          <li>Démarrer avant d'avoir liquidé toutes ses pensions.</li>
          <li>Ne pas prévenir la caisse de retraite dans le délai.</li>
          <li>Confondre revenu imposable et chiffre d'affaires dans le calcul du plafond de cumul.</li>
        </ul>
      </Section>

      <Section title="5. Checklist">
        <Checklist
          items={[
            "Toutes mes pensions sont liquidées",
            "Je sais si mon cumul est libéralisé ou plafonné",
            "J'ai informé ma caisse de retraite par écrit",
            "Mon activité est éligible au régime micro",
          ]}
        />
      </Section>

      <Sources
        items={[
          { label: "Comment cumuler les statuts de retraité et de micro-entrepreneur ?", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36611", verified: "1er janvier 2026" },
          { label: "Régime micro-social", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353", verified: "21 février 2026" },
        ]}
      />
    </div>
  );
}
