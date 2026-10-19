export type SubscriptionStatus = "free" | "active" | "canceled";
export type SubscriptionPlan = "monthly" | "annual";
export type Platform =
  | "leboncoin" | "allovoisins" | "gensdeconfiance" | "vinted" | "taskrabbit"
  | "needhelp" | "yoojo" | "stootie" | "luludansmarue" | "nextdoor" | "pap"
  | "blablacar" | "karos" | "klaxit" | "getaround"
  | "animaute" | "holidog" | "rover"
  | "cocolis" | "jestocke" | "ouistock"
  | "geev" | "trocservices";
export type InvoiceStatus = "draft" | "sent" | "paid";
export type DocumentType = "devis" | "facture";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  stripe_customer_id: string | null;
  siret: string | null;
  address: string | null;
  /** Consentement aux e-mails de conseils et d'alerte de plafond (migration 0006). */
  email_tips_optin: boolean;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan | null;
  /** Obsolète depuis la migration 0005 : les crédits sont dans listing_credit_grants. */
  listing_credits: number;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  category: string;
  equipment_available: string[];
  weekly_availability_hours: number;
  created_at: string;
}

/** Version d'une annonce adaptée à une plateforme. */
export interface ListingVariant {
  platform: Platform;
  title: string;
  description: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  platform: Platform;
  description: string;
  price_suggested: number | null;
  /** Versions par plateforme (annonce multi-sites) ; null pour les annonces d'une seule plateforme. */
  variants: ListingVariant[] | null;
  created_at: string;
}

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface Testimonial {
  id: string;
  user_id: string;
  first_name: string;
  city: string | null;
  body: string;
  status: TestimonialStatus;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_name: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
  document_type: DocumentType;
  issue_date: string;
  created_at: string;
  /** Numéro séquentiel par utilisateur, type et année (null pour les documents antérieurs à la migration 0012). */
  number: number | null;
  /** Numéro affiché sur le document, attribué par la base à la création (ex. F-2026-0001). */
  reference: string;
  /** Identité de l'émetteur figée à la création du document. */
  issuer_name: string | null;
  issuer_siret: string | null;
  issuer_address: string | null;
  issuer_email: string | null;
}

export interface ListingCreditGrant {
  id: string;
  user_id: string;
  amount: number;
  remaining: number;
  granted_at: string;
  expires_at: string;
}
