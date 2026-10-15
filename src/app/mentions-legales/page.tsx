import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { legalMetadata } from "@/lib/seo";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { LEGAL } from "@/lib/legal";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = legalMetadata({ title: "Mentions légales", description: "Mentions légales du site Compléo : éditeur, hébergement, données personnelles et médiation.", path: "/mentions-legales" });

function Field({ value }: { value: string }) {
  return value ? <>{value}</> : <mark className="rounded bg-amber-100 px-1 text-amber-900">[À compléter]</mark>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export default function LegalNoticePage() {
  return (
    <>
      <BreadcrumbJsonLd path="/mentions-legales" />
      <main className="container max-w-3xl space-y-8 py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary"><Rocket className="h-5 w-5" /> Compléo</Link>
        <div>
          <h1 className="text-3xl font-bold">Mentions légales</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dernière mise à jour : {LEGAL.lastUpdate}</p>
        </div>

        <Section title="1. Éditeur du site">
          <p>
            Le site {LEGAL.siteName} (<span>{LEGAL.siteUrl}</span>) est édité par :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Dénomination sociale : <Field value={LEGAL.companyName} /></li>
            <li>Forme juridique : <Field value={LEGAL.legalForm} /></li>
            <li>Capital social : <Field value={LEGAL.capital} /></li>
            <li>Représentant légal : {LEGAL.publisherName}</li>
            <li>Siège social : <Field value={LEGAL.address} /></li>
            <li>Immatriculation (SIRET, RCS) : <Field value={LEGAL.siret} /></li>
            <li>TVA : <Field value={LEGAL.vat} /></li>
            <li>E-mail : <Field value={LEGAL.email} /></li>
            <li>Téléphone : <Field value={LEGAL.phone} /></li>
          </ul>
          <p>Directeur de la publication : <Field value={LEGAL.publicationDirector} />.</p>
        </Section>

        <Section title="2. Hébergement">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Application web : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis ·{" "}
              <a className="text-primary underline" href="https://vercel.com" rel="noopener noreferrer">vercel.com</a>.
            </li>
            <li>
              Base de données et authentification : Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992. Les données
              sont hébergées dans l'Union européenne (Francfort, Allemagne) ·{" "}
              <a className="text-primary underline" href="https://supabase.com" rel="noopener noreferrer">supabase.com</a>.
            </li>
          </ul>
        </Section>

        <Section title="3. Objet du service">
          <p>
            {LEGAL.siteName} aide les particuliers à choisir une micro-activité, à rédiger leurs annonces à l'aide d'un outil
            d'intelligence artificielle, à estimer leurs cotisations et à émettre des devis et factures. Le service est proposé
            gratuitement dans une offre limitée et par abonnement mensuel (offre Premium).
          </p>
          <p>
            Les paiements sont traités par Stripe Payments Europe Ltd, 1 Grand Canal Street Lower, Dublin 2, Irlande.
            {" "}{LEGAL.siteName} ne conserve aucun numéro de carte bancaire.
          </p>
        </Section>

        <Section title="4. Nature des informations fournies">
          <p>
            Les estimations de revenus, le simulateur « Net dans la poche » et le calcul de cumul avec l'allocation chômage
            sont fournis à titre purement indicatif. Ils reposent sur des taux et plafonds susceptibles d'évoluer et ne
            constituent ni un conseil fiscal, juridique ou comptable, ni une décision de France Travail ou de l'URSSAF.
            L'utilisateur reste responsable de ses déclarations et doit vérifier sa situation auprès des organismes compétents.
          </p>
          <p>
            Les annonces sont générées automatiquement. Elles peuvent comporter des erreurs et doivent être relues et
            adaptées par l'utilisateur avant publication. Il est seul responsable de leur contenu et du respect des
            conditions d'utilisation des plateformes sur lesquelles il les diffuse.
          </p>
          <p>
            Les devis et factures générés incluent la mention « TVA non applicable, art. 293 B du CGI » : l'utilisateur doit
            s'assurer qu'elle correspond à sa situation et que les informations saisies (identité, SIRET, adresse) sont exactes.
          </p>
        </Section>

        <Section title="5. Propriété intellectuelle">
          <p>
            La marque, le nom, l'identité visuelle, les textes, le code et la structure du site sont protégés par le droit de
            la propriété intellectuelle. Toute reproduction ou exploitation sans autorisation écrite de l'éditeur est interdite.
            Les contenus créés par l'utilisateur (annonces, factures) lui appartiennent.
          </p>
        </Section>

        <Section title="6. Données personnelles">
          <p>
            Le responsable du traitement est l'éditeur identifié à l'article 1. Les données collectées (adresse e-mail,
            nom, informations de profil et de facturation saisies, annonces, documents, historique d'abonnement) servent à
            fournir le service, gérer le compte et l'abonnement, et respecter les obligations légales. Elles sont fondées sur
            l'exécution du contrat et, pour la sécurité du service, sur l'intérêt légitime.
          </p>
          <p>Destinataires et sous-traitants :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Supabase (hébergement de la base de données et authentification) ;</li>
            <li>Vercel (hébergement de l'application) ;</li>
            <li>Stripe (paiement et gestion des abonnements) ;</li>
            <li>le fournisseur du modèle d'IA, auquel sont transmis le service, la ville et la plateforme saisis pour générer une annonce.</li>
          </ul>
          <p>
            Certains de ces prestataires sont établis hors de l'Union européenne et encadrent les transferts par des clauses
            contractuelles types. Les données sont conservées pendant la durée du compte, puis supprimées, sauf obligation
            légale de conservation (notamment les données de facturation de l'abonnement).
          </p>
          <p>
            Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits d'accès, de rectification,
            d'effacement, de limitation, d'opposition et de portabilité. Pour les exercer :{" "}
            <Field value={LEGAL.email} />. Vous pouvez aussi introduire une réclamation auprès de la CNIL (
            <a className="text-primary underline" href="https://www.cnil.fr" rel="noopener noreferrer">cnil.fr</a>).
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Le site n'utilise que des cookies strictement nécessaires à son fonctionnement (session de connexion). Aucun
            cookie publicitaire n'est déposé. Une mesure d'audience interne, anonyme et sans cookie compte des événements
            (pages vues du simulateur, inscriptions, achats) sans identifiant, sans adresse IP et sans outil tiers ; elle
            respecte les signaux « Do Not Track » et « Global Privacy Control ».
          </p>
        </Section>

        <Section title="8. Médiation de la consommation">
          <p>
            En cas de litige non résolu avec l'éditeur, le consommateur peut recourir gratuitement au médiateur suivant :{" "}
            <Field value={LEGAL.mediatorName} />
            {LEGAL.mediatorUrl ? (
              <> (<a className="text-primary underline" href={LEGAL.mediatorUrl} rel="noopener noreferrer">{LEGAL.mediatorUrl}</a>)</>
            ) : (
              <> · <Field value="" /></>
            )}
            . Plateforme européenne de règlement en ligne des litiges :{" "}
            <a className="text-primary underline" href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
          </p>
        </Section>

        <Section title="9. Responsabilité et disponibilité">
          <p>
            L'éditeur s'efforce d'assurer l'accès au service mais ne garantit pas une disponibilité continue. Sa
            responsabilité ne saurait être engagée pour les dommages indirects, la perte de revenus ou les conséquences d'une
            décision prise sur la seule base des estimations du service.
          </p>
        </Section>

        <Section title="10. Droit applicable">
          <p>
            Les présentes mentions sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les
            tribunaux français sont compétents, sous réserve des règles protectrices applicables aux consommateurs.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
