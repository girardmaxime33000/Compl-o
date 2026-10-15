/**
 * Informations légales de l'éditeur, affichées sur /mentions-legales.
 * Les champs vides s'affichent « [À compléter] » : à renseigner avant la mise en ligne.
 */
export const LEGAL = {
  siteName: "Compléo",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  publisherName: "Maxime Girard",
  /** Forme juridique, ex. « Micro-entrepreneur (entreprise individuelle) » */
  legalForm: "Société en cours d'immatriculation",
  /** Dénomination sociale de la société éditrice : à renseigner (ex. « Compléo SAS »). */
  companyName: "",
  /** Capital social, ex. « 1 000 € » : à renseigner. */
  capital: "",
  address: "",
  email: "",
  phone: "",
  /** Tant que la société n'est pas immatriculée : indiquer le statut ; remplacer par le SIRET et le RCS dès réception. */
  siret: "Société en cours d'immatriculation : numéro SIRET et RCS à venir",
  /** Ex. « TVA non applicable, art. 293 B du CGI » ou « FR12345678901 » */
  vat: "TVA non applicable, art. 293 B du CGI",
  /** Ex. « Maxime Girard » : le directeur de la publication est une personne physique. */
  publicationDirector: "Maxime Girard",
  /** Médiateur de la consommation : obligatoire pour la vente de services à des consommateurs. */
  mediatorName: "",
  mediatorUrl: "",
  lastUpdate: "14 octobre 2026",
  /** Version des CGU/CGV acceptées au paiement : à modifier à chaque changement de texte. */
  termsVersion: "2026-10-14-brouillon-3",
} as const;
