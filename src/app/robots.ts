import type { MetadataRoute } from "next";
import { absoluteUrl, AI_BOTS, DISALLOWED_PATHS } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
      // Bots d'IA : même politique que `*` (contenu public autorisé, chemins privés interdits).
      { userAgent: [...AI_BOTS], allow: "/", disallow: DISALLOWED_PATHS },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
