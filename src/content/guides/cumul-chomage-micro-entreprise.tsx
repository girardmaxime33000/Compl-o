import Link from "next/link";
import { eur, simulate, TAX_PARAMS as T } from "@/lib/tax";
import { Callout, Checklist, DataTable, Disclaimer, Section, Sources, Steps, Tldr, pct } from "@/components/guides/blocks";

const case1 = simulate({ monthlyRevenue: 800, regime: "bnc", unemployment: { enabled: true, monthlyAre: 1200, referenceSalary: 0 } });
const case2 = simulate({ monthlyRevenue: 800, regime: "bnc", unemployment: { enabled: true, monthlyAre: 1200, referenceSalary: 1300 } });

export function CumulChomageMicroEntreprise() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> oui, si vous êtes déjà inscrit à France Travail, vous pouvez cumuler l'ARE et
        les revenus de votre micro-entreprise. L'allocation est réduite de {pct(T.areReductionRate)} du revenu retenu
        (chiffre d'affaires après abattement), et le cumul s'arrête quand vous avez consommé {pct(T.areCumulCapShare)} de
        vos droits restants. L'alternative est l'Arce : {pct(T.arceShare)} de vos droits restants versés en capital.
      </p>

      <Tldr
        rows={[
          ["Pour qui", "Demandeur d'emploi indemnisé (ARE) qui crée une micro-entreprise"],
          ["Deux options", "Cumul mensuel ARE + revenus, ou Arce (capital)"],
          ["Réduction de l'ARE", `${pct(T.areReductionRate)} du revenu retenu`],
          ["Revenu retenu", `Chiffre d'affaires moins abattement : ${pct(T.areAbatementSales)} (vente), ${pct(T.areAbatement.bic)} (services), ${pct(T.areAbatement.bnc)} (professions libérales BNC)`],
          ["Plafond du cumul", "Le salaire mensuel moyen brut ayant servi à calculer l'ARE"],
          ["À faire", "Déclarer chaque mois vos revenus à France Travail"],
        ]}
      />

      <Disclaimer />

      <Section title="1. Les deux options à la création">
        <p>Si vous êtes inscrit à France Travail au moment de la création, vous choisissez entre :</p>
        <DataTable
          caption="Cumul mensuel ou Arce"
          head={["", "Cumul ARE + revenus", "Arce (capital)"]}
          rows={[
            ["Principe", "L'ARE continue d'être versée, réduite selon vos revenus", `Capital égal à ${pct(T.arceShare)} des droits ARE restants, en deux versements`],
            ["Retraite de base", "Périodes assimilées prises en compte pour valider des trimestres", "Ne permet pas de valider de trimestres de retraite de base"],
            ["Conditions", "Être inscrit et indemnisé", "Être indemnisé et bénéficier de l'Acre (exonération partielle de charges la première année)"],
            ["Limite", `Cumul possible jusqu'à ${pct(T.areCumulCapShare)} des droits restants à la création`, "Second versement 6 mois après le premier, sous conditions"],
          ]}
        />
        <Callout kind="regle">
          <p>Le choix entre cumul et Arce dépend de votre trésorerie et de votre niveau de revenus attendu. Un conseiller France Travail peut le simuler avec vous.</p>
        </Callout>
      </Section>

      <Section title="2. Comment l'ARE est réduite">
        <p>
          L'ARE normalement due est diminuée de {pct(T.areReductionRate)} des revenus de l'activité. Pour un
          micro-entrepreneur, le revenu pris en compte est le chiffre d'affaires moins l'abattement pour frais
          professionnels, selon la nature de l'activité :
        </p>
        <DataTable
          caption="Abattements retenus par France Travail"
          head={["Activité", "Abattement"]}
          rows={[
            ["Vente et assimilées", pct(T.areAbatementSales)],
            ["Prestations de services et locations meublées", pct(T.areAbatement.bic)],
            ["Bénéfices non commerciaux (professions libérales)", pct(T.areAbatement.bnc)],
          ]}
        />
        <p>Le cumul de l'ARE et des revenus ne peut pas dépasser le salaire mensuel moyen brut qui a servi à calculer votre ARE.</p>
      </Section>

      <Section title="3. Démarches pas à pas">
        <Steps
          items={[
            { title: "Créer la micro-entreprise", body: "Immatriculation via le guichet des formalités des entreprises." },
            { title: "Informer France Travail", body: "Déclarez la création depuis votre espace personnel et indiquez la nature de l'activité." },
            { title: "Déclarer vos revenus chaque mois", body: "Indiquez le chiffre d'affaires encaissé, même s'il est nul. France Travail applique l'abattement et recalcule l'allocation." },
            { title: "Conserver les justificatifs", body: "Si vous ne pouvez pas déclarer vos revenus chaque mois, un versement provisoire ou une avance est possible dans l'attente de l'avis d'imposition." },
            { title: "Surveiller le plafond de 60 %", body: "Une fois atteint, l'ARE s'arrête. Une poursuite exceptionnelle est possible via l'instance paritaire régionale si vous n'avez tiré aucun revenu de l'activité, demande à faire dans les 6 mois." },
          ]}
        />
      </Section>

      <Section title="4. Cas pratiques (estimations)">
        <p>
          Hypothèses : profession libérale non réglementée (BNC), ARE de 1 200 € par mois, chiffre d'affaires de 800 € par
          mois. Calculs avec les paramètres de Compléo, à titre indicatif.
        </p>
        <DataTable
          caption="Estimation mensuelle"
          head={["", "Sans plafond de salaire", "Avec salaire de référence de 1 300 €"]}
          rows={[
            ["Revenu retenu", eur(case1.unemployment!.retainedIncome), eur(case2.unemployment!.retainedIncome)],
            ["ARE après réduction", eur(case1.unemployment!.areAfterCumul), eur(case2.unemployment!.areAfterCumul)],
            ["Net micro-entreprise après cotisations", eur(case1.netMonthly), eur(case2.netMonthly)],
            ["Total estimé", eur(case1.unemployment!.totalMonthly), eur(case2.unemployment!.totalMonthly)],
          ]}
        />
        <p>
          Le simulateur applique ce calcul à votre situation : <Link className="text-primary underline" href="/simulateur-micro-entrepreneur">ouvrir le simulateur</Link>.
          Le montant réel dépend de votre dossier France Travail.
        </p>
      </Section>

      <Section title="5. Erreurs fréquentes">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Oublier une déclaration mensuelle</strong> : elle est requise même sans revenu.</li>
          <li><strong>Confondre chiffre d'affaires et revenu retenu</strong> : seul le revenu après abattement réduit l'ARE.</li>
          <li><strong>Ignorer les cotisations</strong> : le micro-social n'ouvre pas droit à l'indemnisation chômage ; elles restent dues sur le chiffre d'affaires ({pct(T.urssafRate.bnc)} en BNC non réglementé, {pct(T.urssafRate.bic)} en services BIC).</li>
          <li><strong>Choisir l'Arce sans anticiper</strong> : après cessation d'activité, l'ARE reprend après un différé correspondant aux allocations perçues lors du second versement.</li>
        </ul>
        <Callout kind="attention">
          <p>L'Arce ne permet pas de valider de trimestres de retraite de base, contrairement au maintien de l'ARE.</p>
        </Callout>
      </Section>

      <Section title="6. Checklist">
        <Checklist
          items={[
            "Je suis inscrit à France Travail avant la création",
            "J'ai comparé cumul mensuel et Arce",
            "Je connais l'abattement applicable à mon activité",
            "Je déclare mes revenus chaque mois à France Travail",
            "Je déclare mon chiffre d'affaires à l'Urssaf à la bonne fréquence",
            "Je suis la consommation de mes droits restants",
          ]}
        />
      </Section>

      <Sources
        items={[
          { label: "Peut-on créer une entreprise et continuer à percevoir des allocations chômage ?", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36613", verified: "29 septembre 2026" },
          { label: "Aide à la reprise ou à la création d'entreprise (Arce)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F15252", verified: "13 août 2026" },
          { label: "Régime micro-social", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353", verified: "21 février 2026" },
        ]}
      />
    </div>
  );
}
