import Link from "next/link";
import { notFound } from "next/navigation";
import { activeCategories, categoryPath, findCategory, postsInCategory } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { PostList } from "@/components/blog/post-list";

// Une catégorie sans article relu n'a pas de page : 404 plutôt qu'une page vide indexable.
export const dynamicParams = false;

export function generateStaticParams() {
  return activeCategories().map((c) => ({ cat: c.slug }));
}

export async function generateMetadata(props: { params: Promise<{ cat: string }> }) {
  const { cat } = await props.params;
  const category = findCategory(cat);
  if (!category) return {};
  return pageMetadata({ title: `${category.name} : articles du blog`, description: category.description, path: categoryPath(category) });
}

export default async function BlogCategoryPage(props: { params: Promise<{ cat: string }> }) {
  const { cat } = await props.params;
  const category = findCategory(cat);
  const posts = category ? postsInCategory(category.slug) : [];
  if (!category || posts.length === 0) notFound();
  return (
    <>
      <BreadcrumbJsonLd path={categoryPath(category)} items={[{ name: "Blog", path: "/blog" }, { name: category.name, path: categoryPath(category) }]} />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <p className="text-sm text-muted-foreground"><Link href="/blog" className="underline">Blog</Link> / {category.name}</p>
          <h1 className="mt-1 text-3xl font-bold">{category.name}</h1>
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        </div>
        <PostList posts={posts} />
      </main>
      <SiteFooter />
    </>
  );
}
