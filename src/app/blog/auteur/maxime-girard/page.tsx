import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_AUTHOR, indexablePosts } from "@/lib/blog";
import { LEGAL } from "@/lib/legal";
import { NOINDEX, pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd, PersonJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { PostList } from "@/components/blog/post-list";

export function generateMetadata(): Metadata {
  const base = pageMetadata({
    title: `${BLOG_AUTHOR.name}, auteur du blog`,
    description: `Présentation de ${BLOG_AUTHOR.name}, éditeur de Compléo et auteur des articles du blog, et liste de ses articles.`,
    path: BLOG_AUTHOR.path,
  });
  // Sans article public, la page n'a rien à présenter : jamais indexée.
  return indexablePosts().length > 0 ? base : { ...base, ...NOINDEX };
}

export default function AuthorPage() {
  const posts = indexablePosts();
  return (
    <>
      <BreadcrumbJsonLd path={BLOG_AUTHOR.path} items={[{ name: "Blog", path: "/blog" }, { name: BLOG_AUTHOR.name, path: BLOG_AUTHOR.path }]} />
      <PersonJsonLd name={BLOG_AUTHOR.name} description={BLOG_AUTHOR.bio} path={BLOG_AUTHOR.path} />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <p className="text-sm text-muted-foreground"><Link href="/blog" className="underline">Blog</Link> / Auteur</p>
          <h1 className="mt-1 text-3xl font-bold">{BLOG_AUTHOR.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Éditeur de {LEGAL.siteName}, auteur des articles du blog</p>
        </div>
        <p className="leading-relaxed">{BLOG_AUTHOR.bio}</p>
        <p className="text-sm text-muted-foreground">
          Présentation rédigée par l'auteur. Les informations légales de l'éditeur figurent dans les{" "}
          <Link href="/mentions-legales" className="underline">mentions légales</Link>.
        </p>
        {posts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Articles de {BLOG_AUTHOR.name}</h2>
            <PostList posts={posts} />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
