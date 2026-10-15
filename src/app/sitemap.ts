import type { MetadataRoute } from "next";
import { absoluteUrl, sitemapEntries } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries().map((e) => ({ url: absoluteUrl(e.path), lastModified: e.lastModified }));
}
