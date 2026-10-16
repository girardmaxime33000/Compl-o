import { BLOG_POSTS, findCategory, findPost } from "@/lib/blog";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Article du blog Compléo";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  return ogCard({
    kicker: "Blog",
    title: post?.title ?? "Blog",
    subtitle: post ? (findCategory(post.category)?.name ?? "") : "",
    from: "#2563eb",
    to: "#1e3a8a",
  });
}
