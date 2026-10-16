import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_AUTHOR, BLOG_POSTS, findCategory, findPost, isIndexable, postPath, categoryPath, relatedPosts } from "@/lib/blog";
import { DEFAULT_CTA } from "@/lib/guides";
import { NOINDEX, pageMetadata } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Sources } from "@/components/guides/blocks";
import { FaqSection } from "@/components/marketing/faq";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { BlogViewTracker } from "@/components/blog/blog-view-tracker";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { PostCta } from "@/components/blog/post-cta";
import { PostList, formatDate } from "@/components/blog/post-list";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = findPost(slug);
  if (!post) return {};
  const base = pageMetadata({ title: post.title, description: post.description, path: postPath(post) });
  // Article non relu : consultable par son URL, jamais indexé.
  return isIndexable(post) ? base : { ...base, ...NOINDEX };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = findPost(slug);
  if (!post) notFound();
  const { Content } = post;
  const category = findCategory(post.category);
  const related = relatedPosts(post);

  return (
    <>
      <BreadcrumbJsonLd
        path={postPath(post)}
        items={[
          { name: "Blog", path: "/blog" },
          ...(category ? [{ name: category.name, path: categoryPath(category) }] : []),
          { name: post.title, path: postPath(post) },
        ]}
      />
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        path={postPath(post)}
        published={post.published}
        updated={post.updated}
        imagePath={`${postPath(post)}/opengraph-image`}
        authorName={BLOG_AUTHOR.name}
        authorPath={BLOG_AUTHOR.path}
      />
      <BlogViewTracker article={post.slug} />
      <SiteHeader />
      <main className="container max-w-3xl space-y-8 py-10">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/blog" className="underline">Blog</Link>
            {category && <> / <Link href={categoryPath(category)} className="underline">{category.name}</Link></>}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Par <Link href={BLOG_AUTHOR.path} className="underline">{BLOG_AUTHOR.name}</Link> · Publié le {formatDate(post.published)} · Mis à jour le {formatDate(post.updated)}
            {post.reviewedOn && <> · Chiffres et sources relus le {formatDate(post.reviewedOn)}</>}
          </p>
        </div>

        <Content />
        {post.faq && <FaqSection items={post.faq} />}
        <Sources items={post.sources} />
        <PostCta article={post.slug} cta={post.cta ?? DEFAULT_CTA} />
        <NewsletterSignup source={`blog:${post.slug}`} />

        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">À lire aussi</h2>
            <PostList posts={related} />
          </section>
        )}
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
