"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/marketing/tracked-link";
import { cn } from "@/lib/utils";

/** Distance de défilement (px) à partir de laquelle la barre apparaît : le haut de page porte déjà le CTA de l'en-tête. */
const SHOW_AFTER = 400;

/**
 * Barre d'action fixe en bas d'écran, mobile uniquement (< 768 px), pour les pages de contenu longues.
 * À placer en fin de page : elle ajoute un espace en bas pour ne pas masquer le pied de page.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-200 motion-reduce:transition-none md:hidden",
          "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          visible ? "translate-y-0" : "translate-y-full",
        )}
        // Hors écran tant qu'elle n'est pas affichée : ni lue ni atteignable au clavier.
        aria-hidden={!visible}
      >
        <Button asChild size="lg" className="w-full">
          <TrackedLink href="/onboarding" tabIndex={visible ? 0 : -1} trackProps={{ source: "sticky", target: "diagnostic" }}>
            Faire mon diagnostic gratuit
          </TrackedLink>
        </Button>
      </div>
    </>
  );
}
