import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_PAGES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((p) => ({ url: absoluteUrl(p.path), priority: p.priority }));
}
