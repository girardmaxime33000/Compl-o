import { BRAND_BLUE, LOGO_ARC, LOGO_PLUS, LOGO_VIEWBOX } from "@/lib/brand";

/** Symbole de Compléo (SVG en ligne, décoratif : le nom est écrit à côté). `currentColor` par défaut : suit la couleur du texte. */
export function LogoMark({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} aria-hidden="true" focusable="false" fill="none" stroke={color} strokeLinecap="round">
      <path d={LOGO_ARC.d} strokeWidth={LOGO_ARC.strokeWidth} />
      <path d={LOGO_PLUS.d} strokeWidth={LOGO_PLUS.strokeWidth} />
    </svg>
  );
}

export { BRAND_BLUE };
