#!/usr/bin/env python3
"""
Génère les logos horizontaux `public/logo/logo.svg` et `public/logo/logo-white.svg` : symbole « C + » suivi du nom
« Compléo » dessiné en tracés (aucune police nécessaire pour afficher le fichier).

    pip install fonttools uharfbuzz
    python3 scripts/build-wordmark.py [chemin/vers/Inter-SemiBold.otf]

Police : Inter SemiBold (licence SIL Open Font License 1.1, qui autorise l'incorporation des tracés dans un logo).
La géométrie du symbole est lue dans `src/lib/brand.ts` : modifier le symbole là, puis relancer ce script.
"""
import re
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = Path(sys.argv[1] if len(sys.argv) > 1 else "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf")
NAME = "Compléo"
BLUE = "#2563eb"

brand = (ROOT / "src/lib/brand.ts").read_text(encoding="utf-8")
arc = re.search(r'LOGO_ARC = \{ d: "([^"]+)", strokeWidth: ([\d.]+) \}', brand)
plus = re.search(r'LOGO_PLUS = \{ d: "([^"]+)", strokeWidth: ([\d.]+) \}', brand)
assert arc and plus, "géométrie du symbole introuvable dans src/lib/brand.ts"

# Emprise du symbole dans la grille 120 × 120 (mesurée sur le tracé : arc de rayon 42 centré en (62,8 ; 60), trait 16,43).
MARK_X0, MARK_Y0, MARK_W, MARK_H = 12.6, 9.8, 94.8, 100.4
FONT_SIZE, GAP = 70.0, 20.0

font = TTFont(FONT)
upem = font["head"].unitsPerEm
scale = FONT_SIZE / upem
cap = font["OS/2"].sCapHeight * scale
glyphs = font.getGlyphSet()
order = font.getGlyphOrder()

blob = hb.Blob.from_file_path(str(FONT))
hb_font = hb.Font(hb.Face(blob))
buf = hb.Buffer()
buf.add_str(NAME)
buf.guess_segment_properties()
hb.shape(hb_font, buf, {"kern": True, "liga": False})

text_x0 = MARK_W + GAP
baseline = MARK_H / 2 + cap / 2  # texte centré verticalement sur le symbole, d'après la hauteur des capitales
pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
x = 0.0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]
    ox = text_x0 + (x + pos.x_offset) * scale
    oy = baseline - pos.y_offset * scale
    glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, ox, oy)))
    x += pos.x_advance
text_w = x * scale
width = text_x0 + text_w
text_path = pen.getCommands()


def svg(color: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} {MARK_H:.1f}" role="img" aria-label="Compléo">'
        f"<title>Compléo</title>"
        f'<g transform="translate({-MARK_X0} {-MARK_Y0})" fill="none" stroke="{color}" stroke-linecap="round">'
        f'<path d="{arc.group(1)}" stroke-width="{arc.group(2)}"/><path d="{plus.group(1)}" stroke-width="{plus.group(2)}"/></g>'
        f'<path fill="{color}" d="{text_path}"/></svg>\n'
    )


(ROOT / "public/logo/logo.svg").write_text(svg(BLUE), encoding="utf-8")
(ROOT / "public/logo/logo-white.svg").write_text(svg("#ffffff"), encoding="utf-8")
print(f"logo.svg et logo-white.svg écrits (largeur {width:.1f}, hauteur {MARK_H}, texte {text_w:.1f} de large)")
