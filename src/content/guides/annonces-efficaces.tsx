import Link from "next/link";
import { ACTIVITIES } from "@/lib/activities";
import { demoListing } from "@/lib/demo-listings";

const example = demoListing(ACTIVITIES[0]!);

export function AnnoncesEfficaces() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <p className="rounded-md border bg-muted/40 p-4 text-base">
        <strong>En bref :</strong> une bonne annonce de services dit clairement ce que vous faites, où, à quel tarif
        indicatif et comment vous contacter, sans rien promettre que vous ne puissiez tenir. Un titre concret, des
        informations vérifiables et une réponse rapide comptent plus qu'un texte long.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Un titre concret et local</h2>
        <p>
          Le titre est lu avant tout le reste. Nommez le service précis et la ville ou le quartier : « Montage de meubles à
          Nantes » informe mieux que « Homme à tout faire disponible ». Évitez les majuscules, les points d'exclamation
          répétés et les formules vagues.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Un texte structuré, centré sur le client</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Une phrase d'accroche qui décrit le service rendu.</li>
          <li>Trois à cinq avantages concrets pour le client (délais, matériel apporté, devis avant intervention).</li>
          <li>Ce que vous faites, et aussi ce que vous ne faites pas, pour éviter les demandes hors sujet.</li>
          <li>Vos zones et vos créneaux d'intervention.</li>
          <li>Un appel à l'action simple : demander un devis, poser une question.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Un tarif indicatif et honnête</h2>
        <p>
          Annoncer un tarif ou une fourchette filtre les demandes et inspire confiance. Précisez l'unité (à l'heure, au
          forfait, à la visite) et ce qui est inclus ou non : déplacement, matériel, fournitures. Les repères de tarifs
          moyens par activité sont sur les <Link href="/activites" className="text-primary underline">pages activités</Link>.
          Ils sont indicatifs : adaptez-les à votre situation et à votre ville.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Des preuves réelles, jamais inventées</h2>
        <p>
          N'affichez ni diplôme, ni certification, ni avis clients, ni numéro d'entreprise que vous ne possédez pas. Mettez
          plutôt en avant ce qui est vrai et vérifiable : votre expérience, le matériel dont vous disposez, vos
          disponibilités. Les pratiques commerciales trompeuses sont sanctionnées : pour les règles applicables à la
          publicité, consultez le site de la DGCCRF (economie.gouv.fr/dgccrf).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Des photos utiles</h2>
        <p>
          Si la plateforme le permet, ajoutez des photos de vos réalisations ou de votre matériel, prises par vous. Une
          photo lumineuse et nette vaut mieux que plusieurs images floues. Ne reprenez pas les photos d'autrui.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Répondre vite et clairement</h2>
        <p>
          Répondre dans la journée, poser les questions utiles (lieu, surface, délai) et proposer un devis écrit avant
          d'intervenir évite les malentendus. Respectez les règles de chaque plateforme : certaines interdisent par exemple
          de partager ses coordonnées dans l'annonce.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Exemple d'annonce structurée</h2>
        <div className="rounded-lg border p-4">
          <p className="font-semibold">{example.title}</p>
          <p className="mt-2 whitespace-pre-line">{example.body}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Exemple rédigé à l'avance, à adapter à votre situation. Annonce générée par IA, à relire avant publication.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Gagner du temps avec Compléo</h2>
        <p>
          Le générateur d'annonces de Compléo rédige une annonce à partir de votre service, de votre ville et de la
          plateforme visée. Relisez-la et corrigez-la avant publication : vous restez responsable de son contenu.
        </p>
      </section>
    </div>
  );
}
