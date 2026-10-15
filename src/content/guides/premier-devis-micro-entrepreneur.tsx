import { Callout, Checklist, DataTable, Disclaimer, Section, Sources, Steps, Tldr, num } from "@/components/guides/blocks";
import { TAX_PARAMS as T } from "@/lib/tax";

export function PremierDevis() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> le devis est obligatoire pour certaines activités (travaux et dépannage du
        bâtiment, déménagement, services à la personne à partir de {num(T.quoteHomeServicesThreshold)} € TTC par mois, entre autres). Dans
        les autres cas, il reste recommandé : il fixe le prix, la prestation et les délais avant le début du travail.
      </p>

      <Tldr
        rows={[
          ["Quand c'est obligatoire", "Travaux et dépannage du bâtiment, déménagement, location de voiture, services à la personne (≥ 100 € TTC par mois), entre autres"],
          ["Sanction", `Amende administrative jusqu'à ${num(T.quoteFineIndividual)} € (entrepreneur individuel) ou ${num(T.quoteFineCompany)} € (société)`],
          ["Valeur", "Le devis engage le professionnel dès l'acceptation, le client dès sa signature"],
          ["Démarchage", "Rétractation possible sous 14 jours (hors urgence)"],
          ["Franchise de TVA", "Mention « TVA non applicable, art. 293 B du CGI » à porter sur les documents"],
        ]}
      />

      <Disclaimer />

      <Section title="1. Votre activité est-elle concernée ?">
        <DataTable
          caption="Principales activités pour lesquelles le devis est obligatoire"
          head={["Activité", "Précision"]}
          rows={[
            ["Travaux et dépannage du bâtiment et de l'équipement de maison", "Maçonnerie, plomberie, électricité, peinture, serrurerie, couverture, isolation, etc."],
            ["Déménagement", "Devis gratuit, avec les conditions générales du contrat"],
            ["Services à la personne", `Obligatoire si le prix mensuel est ≥ ${num(T.quoteHomeServicesThreshold)} € TTC, sinon sur demande du client`],
            ["Location de voiture, optique, appareillage auditif", "Obligations spécifiques, voir la fiche officielle"],
          ]}
        />
        <Callout kind="attention">
          <p>La fiche officielle sur le devis a été vérifiée pour la dernière fois le 9 septembre 2022. Contrôlez les règles actuelles de votre secteur avant d'émettre un devis obligatoire.</p>
        </Callout>
      </Section>

      <Section title="2. Contenu d'un devis">
        <p>Mentions communes à la plupart des activités (travaux et services à la personne) :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Date de rédaction et durée de validité de l'offre</li>
          <li>Nom ou raison sociale et adresse du prestataire</li>
          <li>Nom et adresse du client, lieu d'exécution</li>
          <li>Description précise de chaque prestation, quantités et prix unitaires ou forfaitaires</li>
          <li>Frais annexes éventuels (déplacement)</li>
          <li>Montant total à payer, HT et TTC avec taux de TVA, ou mention de non-application de la TVA</li>
          <li>Devis gratuit ou payant, et son coût s'il est payant (travaux)</li>
        </ul>
        <Callout kind="astuce">
          <p>Conservez le devis au moins un an (obligation de la fiche pour les services à la personne) et gardez la preuve de l'acceptation du client.</p>
        </Callout>
      </Section>

      <Section title="3. Étapes">
        <Steps
          items={[
            { title: "Cadrer le besoin", body: "Lieu, nature exacte de la prestation, contraintes, délai souhaité." },
            { title: "Chiffrer", body: "Décomposez temps, matériel et déplacement. Précisez ce qui n'est pas inclus." },
            { title: "Rédiger et envoyer", body: "Incluez toutes les mentions et la durée de validité." },
            { title: "Obtenir la signature", body: "Le client signe avec « bon pour accord » : il n'est engagé qu'à partir de là." },
            { title: "Facturer conformément au devis", body: "Toute modification de prix ou de prestation passe par un avenant." },
          ]}
        />
      </Section>

      <Section title="4. Acompte ou arrhes">
        <p>
          Avec un acompte, le devis engage les deux parties : celui qui se dégage doit des dommages et intérêts. Avec des
          arrhes, le consommateur peut renoncer en perdant la somme versée, et le professionnel qui renonce rend le double.
          Si le contrat ne précise rien, la somme versée est considérée comme des arrhes.
        </p>
      </Section>

      <Section title="5. Erreurs fréquentes">
        <ul className="list-disc space-y-1 pl-5">
          <li>Un devis vague (« travaux divers ») qui ne protège personne.</li>
          <li>Oublier la durée de validité.</li>
          <li>Ne pas préciser acompte ou arrhes.</li>
          <li>Débuter avant signature.</li>
        </ul>
      </Section>

      <Section title="6. Checklist">
        <Checklist
          items={[
            "J'ai vérifié si mon activité impose un devis",
            "Toutes les mentions obligatoires figurent sur le devis",
            "La durée de validité est indiquée",
            "Le client a signé avant le début de la prestation",
            "Je conserve le devis signé",
          ]}
        />
      </Section>

      <Sources
        items={[
          { label: "Devis obligatoire : activités concernées", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31144", verified: "9 septembre 2022" },
          { label: "Tout savoir sur la facturation", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23208", verified: "7 août 2026" },
        ]}
      />
    </div>
  );
}
