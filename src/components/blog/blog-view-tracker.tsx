"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Une vue par chargement d'article : dénominateur des clics vers les outils (`article` = slug, aucune donnée personnelle). */
export function BlogViewTracker({ article }: { article: string }) {
  useEffect(() => {
    track("blog_view", { article });
  }, [article]);
  return null;
}
