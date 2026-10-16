import Link from "next/link";
import { Callout, Checklist, Disclaimer, Section, Steps, Tldr, num, pct } from "@/components/guides/blocks";
import { TAX_PARAMS as T } from "@/lib/tax";

export function PremiersPasComplement() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>Réponse courte :</strong> pour démarrer un revenu complémentaire, choisissez une activité de services
        que vous pouvez assurer près de chez vous, estimez ce qu'il vous reste après cotisations, rédigez une annonce
        claire, puis établissez un devis et une facture conformes dès la première mission. Les revenus dépendent de
        votre profil et du temps disponible : aucun montant n'est garanti.
      </p>

      <Tldr
        rows={[
          ["Pour qui", "Toute personne qui souhaite ajouter une activité de services à son budget, en parallèle d'un emploi, du chômage ou de la retraite"],
          ["Cotisations micro-social 2026", `${pct(T.urssafRate.bic)} du chiffre d'affaires (services BIC) ou ${pct(T.urssafRate.bnc)} (BNC non réglementé)`],
          ["Franchise de TVA 2026", `${num(T.vatThreshold)} € par an en prestations de services`],
          ["Plafond du régime micro 2026", `${num(T.microCeilingServices)} € par an en prestations de services`],
        ]}
      />

      <Disclaimer variant="article" />

      <Section title="1. Choisir une activité réaliste">
        <p>
          Partez de ce que vous savez déjà faire et de la demande autour de chez vous : bricolage, ménage, garde
          d'animaux, cours particuliers. Le{" "}
          <Link href="/onboarding" className="text-primary underline">diagnostic gratuit</Link> propose trois activités
          selon vos réponses, sans inscription. Le{" "}
          <Link href="/activites" className="text-primary underline">catalogue des activités</Link> détaille pour chacune
          le tarif moyen observé et un revenu estimé selon le temps que vous y consacrez.
        </p>
      </Section>

      <Section title="2. Estimer ce qu'il vous reste">
        <p>
          Le chiffre d'affaires n'est pas votre revenu : les cotisations sociales en retirent une part. Le{" "}
          <Link href="/simulateur-micro-entrepreneur" className="text-primary underline">simulateur</Link> calcule le net
          avant impôt, les seuils de TVA et les plafonds, y compris en cas de cumul avec l'allocation chômage. C'est une
          estimation indicative.
        </p>
      </Section>

      <Section title="3. Connaître vos limites avant de démarrer">
        <p>
          Deux seuils sont distincts : le plafond du régime micro ({num(T.microCeilingServices)} € en prestations de
          services) et la franchise de TVA ({num(T.vatThreshold)} €). Pour le détail, consultez le guide{" "}
          <Link href="/guides/plafonds-micro-entreprise-2026" className="text-primary underline">plafonds et taux 2026</Link> et
          le guide{" "}
          <Link href="/guides/franchise-tva-micro-entrepreneur" className="text-primary underline">franchise de TVA</Link>.
        </p>
        <Callout kind="regle">
          <p>
            Si vous percevez le chômage ou une pension de retraite, le cumul obéit à des règles propres : voir les guides{" "}
            <Link href="/guides/cumul-chomage-micro-entreprise" className="text-primary underline">chômage et micro-entreprise</Link> et{" "}
            <Link href="/guides/micro-entreprise-retraite" className="text-primary underline">retraite et micro-entreprise</Link>.
          </p>
        </Callout>
      </Section>

      <Section title="4. Les quatre étapes de démarrage">
        <Steps
          items={[
            { title: "Définir l'offre", body: "Une prestation précise, une zone géographique et un tarif horaire ou au forfait." },
            { title: "Rédiger l'annonce", body: <>Un titre clair, le tarif, la zone et vos disponibilités. Voir le guide <Link href="/guides/annonces-efficaces" className="text-primary underline">annonce de services efficace</Link>.</> },
            { title: "Établir le devis", body: <>Le devis fixe le prix et la prestation avant le début de la mission. Voir le guide <Link href="/guides/premier-devis-micro-entrepreneur" className="text-primary underline">premier devis</Link>.</> },
            { title: "Facturer", body: "Chaque facture porte la mention « TVA non applicable, art. 293 B du CGI » tant que la franchise de TVA s'applique." },
          ]}
        />
      </Section>

      <Section title="5. Checklist avant la première mission">
        <Checklist
          items={[
            "Mon activité et ma zone sont définies",
            "J'ai estimé mon net après cotisations",
            "Je connais le plafond micro et le seuil de TVA qui me concernent",
            "Mon annonce est rédigée et relue",
            "Mon modèle de devis et de facture est prêt",
          ]}
        />
      </Section>
    </div>
  );
}
