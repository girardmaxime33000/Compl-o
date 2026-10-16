import type { ComponentType } from "react";
import type { Source } from "@/components/guides/blocks";
import { ComparerPrix, faq as comparerFaq } from "@/content/blog/comparer-prix-au-kilo-shrinkflation";
import { CalculerNetMicro, faq as calculerNetFaq } from "@/content/blog/calculer-net-micro-entrepreneur";
import { DlcDdm, faq as dlcFaq } from "@/content/blog/dlc-ddm-jeter-moins-produits-alimentaires";
import { ObjectifRevenuBudget, faq as objectifFaq } from "@/content/blog/objectif-revenu-complementaire-budget";
import { PremiersPasComplement } from "@/content/blog/premiers-pas-revenu-complementaire";
import { ResilierTroisClics, faq as resilierFaq } from "@/content/blog/resilier-abonnement-en-ligne-trois-clics";
import { QuelTarifFixer, faq as tarifFaq } from "@/content/blog/quel-tarif-fixer-activite-services";

/**
 * Blog de demande generation. Même modèle que les guides (composants typés, pas de MDX) : les chiffres fiscaux sont
 * importés de `tax.ts`, jamais écrits en dur dans le texte.
 *
 * Règle éditoriale (décision du propriétaire, 2026-10-16) : relecture ciblée (chiffres, juridique, sources) avant
 * publication. Un article sans `reviewedOn` reste accessible par son URL mais en `noindex`, absent du sitemap, de la
 * liste du blog, des pages catégorie et du flux RSS.
 */

export interface BlogCategory {
  slug: string;
  name: string;
  /** Description de la page catégorie (méta description). */
  description: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: "revenu-complementaire",
    name: "Revenu complémentaire",
    description: "Démarrer une activité de services près de chez soi, statut micro-entrepreneur, tarifs, annonces et clients.",
  },
  {
    slug: "budget",
    name: "Budget du foyer",
    description: "Suivre ses dépenses, fixer un objectif d'épargne et décider quand un revenu complémentaire devient utile.",
  },
  {
    slug: "economies",
    name: "Économies au quotidien",
    description: "Courses, énergie, abonnements : des pistes concrètes pour dépenser moins sur le budget du foyer.",
  },
];

/** Même format que les guides : `verified` reprend la date « Vérifié le » affichée sur la fiche officielle. */
export type BlogSource = Source;

/** Signature éditoriale (décision du propriétaire). Aucune biographie n'est publiée tant qu'elle n'est pas fournie. */
export const BLOG_AUTHOR = { name: "Maxime Girard" } as const;

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory["slug"];
  /** Date de première publication (ISO). */
  published: string;
  /** Date de dernière mise à jour du contenu (ISO). */
  updated: string;
  /** Date de la relecture ciblée (chiffres, juridique, sources). Absente : `noindex`, hors sitemap, liste et RSS. */
  reviewedOn?: string;
  /** Sources officielles citées dans l'article. Obligatoires si l'article contient un chiffre fiscal ou juridique. */
  sources: BlogSource[];
  faq?: { question: string; answer: string }[];
  /** Slugs d'articles liés (maillage interne), uniquement des articles existants. */
  related?: string[];
  /** Appel à l'action de fin d'article. Par défaut : simulateur public. */
  cta?: { title: string; text: string; label: string; href: string };
  Content: ComponentType;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "premiers-pas-revenu-complementaire",
    title: "Revenu complémentaire : par où commencer",
    description:
      "Les étapes pour démarrer une activité de services en complément de vos revenus : choisir l'activité, estimer le net, créer l'annonce et émettre la première facture.",
    category: "revenu-complementaire",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Régime micro-social",
        url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353",
        verified: "21 février 2026",
      },
    ],
    Content: PremiersPasComplement,
  },
  {
    slug: "calculer-net-micro-entrepreneur",
    title: "Micro-entrepreneur : calculer ce qu'il reste après cotisations",
    description:
      "La formule du net avant impôt en micro-entreprise, trois exemples chiffrés avec les taux 2026 et les seuils à surveiller, calculés avec le simulateur de Compléo.",
    category: "revenu-complementaire",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Régime micro-social",
        url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353",
        verified: "21 février 2026",
      },
    ],
    faq: calculerNetFaq,
    related: ["quel-tarif-fixer-activite-services", "premiers-pas-revenu-complementaire"],
    Content: CalculerNetMicro,
  },
  {
    slug: "quel-tarif-fixer-activite-services",
    title: "Quel tarif fixer pour une activité de services, et que reste-t-il ?",
    description:
      "Du tarif affiché au net par heure : cotisations 2026, temps non facturé et repères de tarifs du catalogue Compléo pour chaque activité de services.",
    category: "revenu-complementaire",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Régime micro-social",
        url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353",
        verified: "21 février 2026",
      },
    ],
    faq: tarifFaq,
    related: ["calculer-net-micro-entrepreneur", "objectif-revenu-complementaire-budget"],
    Content: QuelTarifFixer,
  },
  {
    slug: "objectif-revenu-complementaire-budget",
    title: "Combien de revenu complémentaire viser pour équilibrer son budget",
    description:
      "Mesurer l'écart de budget, convertir un objectif net en chiffre d'affaires puis en heures de travail, avec un exemple chiffré fictif et les taux 2026.",
    category: "budget",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Régime micro-social",
        url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353",
        verified: "21 février 2026",
      },
    ],
    faq: objectifFaq,
    related: ["calculer-net-micro-entrepreneur", "quel-tarif-fixer-activite-services"],
    Content: ObjectifRevenuBudget,
  },
  {
    slug: "dlc-ddm-jeter-moins-produits-alimentaires",
    title: "DLC ou DDM : quelles dates respecter pour jeter moins",
    description:
      "Différence entre date limite de consommation et date de durabilité minimale, mentions sur l'étiquette et gestes simples pour ne pas jeter des produits encore consommables.",
    category: "economies",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Date limite de consommation (DLC), de durabilité minimale (DDM), de congélation",
        url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10990",
        verified: "6 février 2026",
      },
    ],
    faq: dlcFaq,
    related: ["comparer-prix-au-kilo-shrinkflation", "resilier-abonnement-en-ligne-trois-clics"],
    cta: {
      title: "Et si vous ajoutiez un revenu complémentaire ?",
      text: "Trois questions, sans inscription : 3 activités recommandées et un revenu estimé selon votre temps disponible.",
      label: "Faire mon diagnostic",
      href: "/onboarding",
    },
    Content: DlcDdm,
  },
  {
    slug: "comparer-prix-au-kilo-shrinkflation",
    title: "Comparer les prix en magasin : prix au kilo et shrinkflation",
    description:
      "Lire le prix à l'unité de mesure, calculer un prix au kilo et repérer la mention de baisse de quantité imposée aux grandes surfaces, avec des exemples chiffrés fictifs.",
    category: "economies",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Affichage des prix : règles à respecter",
        url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F34344",
        verified: "2 juillet 2024",
      },
      {
        label: "Shrinkflation : obligation d'informer les consommateurs sur les produits concernés",
        url: "https://entreprendre.service-public.gouv.fr/actualites/A17378",
        verified: "29 juillet 2024",
        kind: "actualite",
      },
    ],
    faq: comparerFaq,
    related: ["dlc-ddm-jeter-moins-produits-alimentaires", "resilier-abonnement-en-ligne-trois-clics"],
    cta: {
      title: "Et si vous ajoutiez un revenu complémentaire ?",
      text: "Trois questions, sans inscription : 3 activités recommandées et un revenu estimé selon votre temps disponible.",
      label: "Faire mon diagnostic",
      href: "/onboarding",
    },
    Content: ComparerPrix,
  },
  {
    slug: "resilier-abonnement-en-ligne-trois-clics",
    title: "Résilier un abonnement en ligne : la règle des trois clics",
    description:
      "Contrats concernés, étapes de la résiliation en ligne, ce que le professionnel doit confirmer et méthode pour faire l'inventaire de ses abonnements.",
    category: "economies",
    published: "2026-10-16",
    updated: "2026-10-16",
    reviewedOn: "2026-10-16",
    sources: [
      {
        label: "Résiliation « en 3 clics » : application et étapes",
        url: "https://entreprendre.service-public.gouv.fr/actualites/A16599",
        verified: "14 septembre 2023",
        kind: "actualite",
      },
    ],
    faq: resilierFaq,
    related: ["comparer-prix-au-kilo-shrinkflation", "objectif-revenu-complementaire-budget"],
    cta: {
      title: "Et si vous ajoutiez un revenu complémentaire ?",
      text: "Trois questions, sans inscription : 3 activités recommandées et un revenu estimé selon votre temps disponible.",
      label: "Faire mon diagnostic",
      href: "/onboarding",
    },
    Content: ResilierTroisClics,
  },
];

export const findPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
export const findCategory = (slug: string) => BLOG_CATEGORIES.find((c) => c.slug === slug);
export const postPath = (p: BlogPost) => `/blog/${p.slug}`;
export const categoryPath = (c: BlogCategory) => `/blog/categorie/${c.slug}`;

/** Indexable = relu. Les autres articles sont consultables par URL directe uniquement. */
export const isIndexable = (p: BlogPost) => Boolean(p.reviewedOn);

/** Articles publics (relus), du plus récent au plus ancien selon la date de publication. */
export function indexablePosts(posts: BlogPost[] = BLOG_POSTS): BlogPost[] {
  return posts.filter(isIndexable).sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
}

export const postsInCategory = (slug: string, posts: BlogPost[] = BLOG_POSTS) => indexablePosts(posts).filter((p) => p.category === slug);

/** Catégories ayant au moins un article public : une catégorie vide n'a ni page ni entrée de sitemap (contenu mince). */
export const activeCategories = (posts: BlogPost[] = BLOG_POSTS) => BLOG_CATEGORIES.filter((c) => postsInCategory(c.slug, posts).length > 0);

/** Articles liés (existants et publics), puis complétés par la même catégorie, sans l'article courant. */
export function relatedPosts(post: BlogPost, limit = 3, posts: BlogPost[] = BLOG_POSTS): BlogPost[] {
  const pub = indexablePosts(posts).filter((p) => p.slug !== post.slug);
  const explicit = (post.related ?? []).map((s) => pub.find((p) => p.slug === s)).filter((p): p is BlogPost => Boolean(p));
  const sameCategory = pub.filter((p) => p.category === post.category && !explicit.includes(p));
  return [...explicit, ...sameCategory].slice(0, limit);
}

/** Date la plus récente de mise à jour parmi les articles publics (`lastmod` de /blog). */
export const latestBlogUpdate = (posts: BlogPost[] = BLOG_POSTS) => indexablePosts(posts).map((p) => p.updated).sort().at(-1);
