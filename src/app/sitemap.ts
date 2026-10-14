import type { MetadataRoute } from "next";
import { absoluteUrl, ACTIVITY_PAGES, PUBLIC_PAGES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PUBLIC_PAGES, ...ACTIVITY_PAGES].map((p) => ({ url: absoluteUrl(p.path), priority: p.priority }));
}
