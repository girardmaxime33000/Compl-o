import { LEGAL } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import { centsToDecimal, OFFERS } from "@/lib/offers";

/** Builders JSON-LD : fonctions pures, sans effet de bord. La sérialisation passe par `serializeJsonLd`. */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface JsonLdObject {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

const CONTEXT = "https://schema.org" as const;

const organizationRef = () => ({ "@type": "Organization", name: LEGAL.siteName, url: absoluteUrl("/") });

/** Image par défaut des pages (Open Graph dynamique du site). */
export const DEFAULT_IMAGE_PATH = "/opengraph-image";

export function organizationJsonLd(): JsonLdObject {
  return { "@context": CONTEXT, "@type": "Organization", name: LEGAL.siteName, url: absoluteUrl("/") };
}

export function softwareApplicationJsonLd(): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "SoftwareApplication",
    name: LEGAL.siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/"),
    inLanguage: "fr-FR",
    offers: [
      { "@type": "Offer", name: "Gratuit", price: "0", priceCurrency: "EUR" },
      ...Object.values(OFFERS).map((o) => ({
        "@type": "Offer",
        name: o.name,
        price: centsToDecimal(o.cents),
        priceCurrency: "EUR",
      })),
    ],
  };
}

/** Outil en ligne gratuit (simulateur public). */
export function webApplicationJsonLd({ name, description, path }: { name: string; description: string; path: string }): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "WebApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    provider: organizationRef(),
  };
}

/** Le premier élément du fil d'Ariane est toujours l'accueil. */
export function breadcrumbJsonLd(trail: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...trail].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function articleJsonLd(args: {
  title: string;
  description: string;
  path: string;
  published: string;
  updated: string;
  imagePath?: string;
  /** Auteur nommé (blog). Sans lui, l'auteur est l'organisation (guides). */
  authorName?: string;
}): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: args.title,
    description: args.description,
    inLanguage: "fr-FR",
    datePublished: args.published,
    dateModified: args.updated,
    author: args.authorName ? { "@type": "Person", name: args.authorName } : organizationRef(),
    publisher: organizationRef(),
    image: absoluteUrl(args.imagePath ?? DEFAULT_IMAGE_PATH),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(args.path) },
  };
}

/** Les réponses doivent figurer dans le contenu visible de la page. */
export function faqPageJsonLd(items: FaqItem[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

/** Sérialise pour une balise <script> : échappe "<" (et les séparateurs de ligne Unicode) pour qu'aucune balise ne ferme le script. */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}
