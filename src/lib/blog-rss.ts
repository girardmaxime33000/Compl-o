import { LEGAL } from "@/lib/legal";
import { BLOG_AUTHOR, findCategory, indexablePosts, postPath, type BlogPost } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Flux RSS 2.0 des articles relus uniquement. Les dates ISO (AAAA-MM-JJ) sont converties en RFC 822 à 00:00 UTC. */
export function buildBlogRss(posts: BlogPost[] = indexablePosts()): string {
  const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();
  const last = posts.map((p) => p.updated).sort().at(-1);
  const items = posts.map((p) => {
    const url = absoluteUrl(postPath(p));
    const category = findCategory(p.category);
    return [
      "    <item>",
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${rfc822(p.published)}</pubDate>`,
      `      <dc:creator>${escapeXml(BLOG_AUTHOR.name)}</dc:creator>`,
      ...(category ? [`      <category>${escapeXml(category.name)}</category>`] : []),
      `      <description>${escapeXml(p.description)}</description>`,
      "    </item>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(`Blog ${LEGAL.siteName}`)}</title>`,
    `    <link>${escapeXml(absoluteUrl("/blog"))}</link>`,
    `    <atom:link href="${escapeXml(absoluteUrl("/blog/rss.xml"))}" rel="self" type="application/rss+xml" />`,
    "    <description>Revenu complémentaire, budget du foyer et économies au quotidien.</description>",
    "    <language>fr-FR</language>",
    ...(last ? [`    <lastBuildDate>${rfc822(last)}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
