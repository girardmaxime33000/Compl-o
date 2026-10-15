import { Callout, Checklist, DataTable, Disclaimer, Section, Sources, Steps, Tldr, num } from "@/components/guides/blocks";
import { TAX_PARAMS as T } from "@/lib/tax";

const prorata = Math.round((27_000 * 365) / 232);

export function FranchiseTva() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> en prestation de services, vous ne facturez pas la TVA tant que votre chiffre
        d'affaires de l'année précédente reste à {num(T.vatThreshold)} € ou moins, avec une tolérance jusqu'à{" "}
        {num(T.vatThresholdMajored)} € dans l'année en cours. Vos factures portent alors la mention « TVA non applicable,
        art. 293 B du CGI ».
      </p>

      <Tldr
        rows={[
          ["Principe", "Pas de TVA facturée, pas de déclaration de TVA, mais pas de TVA déductible sur vos achats"],
          ["Services et professions libérales", `${num(T.vatThreshold)} € (seuil), ${num(T.vatThresholdMajored)} € (seuil majoré)`],
          ["Vente et hébergement", `${num(T.vatThresholdSales)} € (seuil), ${num(T.vatThresholdSalesMajored)} € (seuil majoré)`],
          ["Mention obligatoire", "TVA non applicable - article 293 B du CGI, sur chaque facture"],
          ["Année de démarrage", "Chiffre d'affaires ramené à une année complète au prorata"],
        ]}
      />

      <Disclaimer />

      <Section title="1. Les seuils 2026">
        <DataTable
          caption="Franchise en base de TVA, année 2026"
          head={["Activité", "Seuil (année N-1)", "Seuil majoré (année N)"]}
          rows={[
            ["Prestations de services, professions libérales (hors avocat)", `${num(T.vatThreshold)} €`, `${num(T.vatThresholdMajored)} €`],
            ["Activité commerciale et hébergement", `${num(T.vatThresholdSales)} €`, `${num(T.vatThresholdSalesMajored)} €`],
          ]}
        />
        <p>
          Les seuils 2026 sont inchangés. La proposition d'un seuil unique de 25 000 € issue de la loi de finances pour
          2025 a été abandonnée, selon la fiche officielle.
        </p>
        <Callout kind="regle">
          <p>
            Seuil de base dépassé en N-1 : la TVA s'applique dès le 1er janvier suivant. Seuil majoré dépassé en
            cours d'année : la TVA s'applique dès le premier jour du dépassement. Entre les deux, la franchise est
            conservée jusqu'au 31 décembre.
          </p>
        </Callout>
      </Section>

      <Section title="2. Ce qui change dans votre facturation">
        <ul className="list-disc space-y-1 pl-5">
          <li>Vous facturez hors taxe et vous portez la mention « TVA non applicable - article 293 B du CGI » sur chaque facture.</li>
          <li>Vous ne déclarez pas la TVA, mais vous ne déduisez pas non plus celle de vos achats professionnels.</li>
          <li>Pour déduire la TVA sur vos achats, il faut opter pour le régime réel de TVA.</li>
        </ul>
        <Callout kind="attention">
          <p>Sans la mention, un contrôle fiscal peut aboutir à un redressement pour non-respect du formalisme.</p>
        </Callout>
      </Section>

      <Section title="3. Que faire en cas de dépassement">
        <Steps
          items={[
            { title: "Identifier le seuil dépassé", body: "Seuil de base : la TVA s'applique au 1er janvier suivant. Seuil majoré : dès le premier jour du dépassement." },
            { title: "Vous identifier à la TVA", body: "Rapprochez-vous de votre service des impôts des entreprises pour déclarer le changement de régime." },
            { title: "Changer vos factures", body: "Ajoutez le taux de TVA, le montant HT et le montant TTC, et supprimez la mention 293 B." },
            { title: "Ajuster vos prix", body: "Décidez si vous répercutez la TVA sur vos clients ou si vous réduisez votre marge." },
          ]}
        />
      </Section>

      <Section title="4. Cas pratique : démarrage en cours d'année">
        <p>
          Vous démarrez le 14 mai 2025 et encaissez 27 000 € jusqu'au 31 décembre 2025. Le chiffre d'affaires est ramené
          à une année complète : 27 000 € × 365 / 232 = {num(prorata)} €. Ce montant dépasse le seuil majoré de {num(T.vatThresholdMajored)} € :
          la franchise ne s'applique plus en 2026. Exemple tiré de la fiche officielle.
        </p>
      </Section>

      <Section title="5. Erreurs fréquentes">
        <ul className="list-disc space-y-1 pl-5">
          <li>Appliquer le seuil des ventes à une activité de services.</li>
          <li>Oublier de proratiser l'année de démarrage.</li>
          <li>Continuer d'afficher « TVA non applicable » après le dépassement.</li>
          <li>Confondre le plafond du régime micro et le seuil de franchise de TVA : ce sont deux limites distinctes.</li>
        </ul>
      </Section>

      <Section title="6. Checklist">
        <Checklist
          items={[
            "Je connais mon seuil selon la nature de mon activité",
            "Je suis mon chiffre d'affaires cumulé de l'année",
            "Mes factures portent la mention 293 B",
            "J'ai prévu la procédure en cas de dépassement",
          ]}
        />
      </Section>

      <Sources
        items={[{ label: "Franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", verified: "1er janvier 2026" }]}
      />
    </div>
  );
}
