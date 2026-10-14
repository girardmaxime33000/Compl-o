export type SubscriptionStatus = "free" | "active" | "canceled";
export type Platform = "leboncoin" | "allovoisins" | "gensdeconfiance" | "vinted" | "taskrabbit";
export type InvoiceStatus = "draft" | "sent" | "paid";
export type DocumentType = "devis" | "facture";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  stripe_customer_id: string | null;
  siret: string | null;
  address: string | null;
  subscription_status: SubscriptionStatus;
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

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  platform: Platform;
  description: string;
  price_suggested: number | null;
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
}
