"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Une vue d'accueil par chargement : dénominateur des taux de clic. `visual` distingue le hero avec ou sans photo. */
export function HomeViewTracker({ visual }: { visual: "photo" | "none" }) {
  useEffect(() => {
    track("home_view", { visual });
  }, [visual]);
  return null;
}
