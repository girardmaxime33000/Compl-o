import type { ComponentType } from "react";
import type { Source } from "@/components/guides/blocks";
import { PremiersPasComplement } from "@/content/blog/premiers-pas-revenu-complementaire";

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
    sources: [
      {
        label: "Régime micro-social",
        url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37353",
        verified: "21 février 2026",
      },
    ],
    Content: PremiersPasComplement,
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
