/**
 * Informations légales de l'éditeur, affichées sur /mentions-legales.
 * Les champs vides s'affichent « [À compléter] » : à renseigner avant la mise en ligne.
 */
export const LEGAL = {
  siteName: "Compléo",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  publisherName: "Maxime Girard",
  /** Forme juridique, ex. « Micro-entrepreneur (entreprise individuelle) » */
  legalForm: "",
  address: "",
  email: "",
  phone: "",
  siret: "",
  /** Ex. « TVA non applicable, art. 293 B du CGI » ou « FR12345678901 » */
  vat: "",
  /** Ex. « Maxime Girard » : le directeur de la publication est une personne physique. */
  publicationDirector: "Maxime Girard",
  /** Médiateur de la consommation : obligatoire pour la vente de services à des consommateurs. */
  mediatorName: "",
  mediatorUrl: "",
  lastUpdate: "14 octobre 2026",
} as const;
