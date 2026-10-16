import { buildBlogRss } from "@/lib/blog-rss";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildBlogRss(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
