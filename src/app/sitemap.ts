import type { MetadataRoute } from "next";
import { absoluteUrl, ACTIVITY_PAGES, CITY_ACTIVITY_SITEMAP, GUIDE_PAGES, PUBLIC_PAGES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PUBLIC_PAGES, ...ACTIVITY_PAGES, ...GUIDE_PAGES, ...CITY_ACTIVITY_SITEMAP].map((p) => ({ url: absoluteUrl(p.path), priority: p.priority }));
}
