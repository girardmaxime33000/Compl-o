import Link from "next/link";
import type { Metadata } from "next";
import { activeCategories, categoryPath, indexablePosts } from "@/lib/blog";
import { NOINDEX, pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { PostList } from "@/components/blog/post-list";

export function generateMetadata(): Metadata {
  const base = pageMetadata({
    title: "Blog : revenu complémentaire et budget du foyer",
    description: "Articles de Compléo pour démarrer un revenu complémentaire, suivre son budget et dépenser moins, avec sources officielles et dates de mise à jour.",
    path: "/blog",
  });
  const withFeed = { ...base, alternates: { ...base.alternates, types: { "application/rss+xml": "/blog/rss.xml" } } };
  // Sans article relu, la page serait vide (contenu mince) : jamais indexée.
  return indexablePosts().length > 0 ? withFeed : { ...withFeed, ...NOINDEX };
}

export default function BlogIndexPage() {
  const posts = indexablePosts();
  const categories = activeCategories();
  return (
    <>
      <BreadcrumbJsonLd path="/blog" items={[{ name: "Blog", path: "/blog" }]} />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <h1 className="text-3xl font-bold">Le blog Compléo</h1>
          <p className="mt-2 text-muted-foreground">
            Démarrer un revenu complémentaire, tenir son budget, dépenser moins. Chaque article cite ses sources officielles et indique sa date de mise à jour.
          </p>
        </div>
        {categories.length > 0 && (
          <nav aria-label="Catégories" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.slug} href={categoryPath(c)} className="rounded-full border px-3 py-1 text-sm hover:bg-accent/50">{c.name}</Link>
            ))}
          </nav>
        )}
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className="text-muted-foreground">Les premiers articles arrivent bientôt. En attendant, consultez nos <Link href="/guides" className="text-primary underline">guides</Link>.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
