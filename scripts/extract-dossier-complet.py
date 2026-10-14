#!/usr/bin/env python3
"""
Extrait du « Dossier complet » INSEE (CSV très volumineux) les lignes des 20 communes de src/data/cities.json
et les colonnes utiles, pour produire un petit fichier versionnable :
    data/raw/insee_dossier_complet_20_communes.csv

Usage (à lancer en local, sans dépendance, Python 3.8+) :
    python3 scripts/extract-dossier-complet.py /chemin/vers/dossier_complet.csv

Le fichier est lu ligne à ligne (mémoire constante) ; seules les lignes dont le premier champ (CODGEO) est l'un des
20 codes INSEE sont analysées. Colonnes conservées :
- CODGEO (et LIBGEO si présent)
- populations par tranche d'âge : colonnes contenant « _POP » (ex. P21_POP0610, P21_POP1117, P21_POP80P)
- logements : colonnes se terminant par _LOG, _RP, _MAISON, _APPART
- revenu médian : colonnes commençant par MED
Le script affiche les colonnes retenues et signale les familles absentes. Rien n'est envoyé nulle part.
"""
import csv
import io
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "raw" / "insee_dossier_complet_20_communes.csv"
KEEP_ID = {"CODGEO", "LIBGEO"}
FAMILIES = {
    "population par âge": re.compile(r"^[PC]\d{2}_POP"),
    "logements": re.compile(r"^[PC]\d{2}_(LOG|RP|MAISON|APPART)$"),
    "revenu médian": re.compile(r"^MED\d{2}$"),
}


def detect_delimiter(header_line: str) -> str:
    return ";" if header_line.count(";") >= header_line.count(",") else ","


def discover_long_format(f, header, delim, codes) -> None:
    """Fichier au format long (une ligne par commune et par mesure) : affiche sa structure pour adapter l'extraction."""
    import collections
    import re as _re

    idx = {h: i for i, h in enumerate(header)}
    geo_i = idx["GEO"]
    code_rx = _re.compile(r"(?:^|[^0-9A-Za-z])(" + "|".join(sorted(codes)) + r")(?:$|[^0-9A-Za-z])")
    sample_code = "21231"  # Dijon : une seule commune suffit pour décrire la structure
    print("Format long détecté (colonne GEO, pas de CODGEO).")
    print("Colonnes :", header)
    combos = collections.Counter()
    geo_seen = collections.Counter()
    samples = []
    n_total = 0
    for line in f:
        n_total += 1
        parsed = line.rstrip("\r\n").split(delim)
        if geo_i >= len(parsed):
            continue
        geo = parsed[geo_i].strip().strip('"')
        m = code_rx.search(geo)
        if not m:
            continue
        geo_seen[geo] += 1
        if m.group(1) != sample_code:
            continue
        key = tuple(parsed[idx[c]].strip('"') for c in ("DS", "ID_TAB") if c in idx)
        combos[key] += 1
        if len(samples) < 6:
            samples.append(line.rstrip())
    print(f"Lignes lues : {n_total}")
    print("Valeurs GEO correspondant aux 20 communes (échantillon) :", list(geo_seen.items())[:25])
    print("Lignes d'exemple pour Dijon :")
    for line in samples:
        print("  ", line[:300])
    print(f"Jeux (DS, ID_TAB) pour Dijon : {len(combos)}")
    for key, n in sorted(combos.items(), key=lambda kv: kv[0])[:80]:
        print("  ", key, n)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1]).expanduser()
    codes = {c["inseeCode"] for c in json.loads((ROOT / "src" / "data" / "cities.json").read_text(encoding="utf-8"))["cities"]}
    print(f"{len(codes)} communes cherchées : {sorted(codes)}")

    with open(src, encoding="utf-8", errors="replace", newline="") as f:
        header_line = f.readline()
        delim = detect_delimiter(header_line)
        header = next(csv.reader(io.StringIO(header_line), delimiter=delim))
        header = [h.strip().strip('"') for h in header]
        idx = {h: i for i, h in enumerate(header)}
        if "CODGEO" not in idx:
            if "GEO" in idx:
                discover_long_format(f, header, delim, codes)
                return
            raise SystemExit(f"Colonne CODGEO introuvable. Premières colonnes : {header[:10]}")
        keep = [h for h in header if h in KEEP_ID or any(rx.match(h) for rx in FAMILIES.values())]
        for family, rx in FAMILIES.items():
            n = sum(1 for h in header if rx.match(h))
            print(f"  {family} : {n} colonnes")
            if n == 0:
                print("    ATTENTION : aucune colonne trouvée pour cette famille ; colonnes proches :")
                print("    ", [h for h in header if family.split()[0][:3].upper() in h.upper()][:15])
        rows = {}
        for line in f:
            first = line.split(delim, 1)[0].strip().strip('"')
            if first not in codes:
                continue
            parsed = next(csv.reader(io.StringIO(line), delimiter=delim))
            rows[first] = {h: parsed[idx[h]] for h in keep if idx[h] < len(parsed)}
            if len(rows) == len(codes):
                break

    missing = codes - set(rows)
    if missing:
        print(f"ATTENTION : communes absentes du fichier : {sorted(missing)}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="") as out:
        w = csv.DictWriter(out, fieldnames=keep, delimiter=";")
        w.writeheader()
        for code in sorted(rows):
            w.writerow(rows[code])
    print(f"{len(rows)} lignes, {len(keep)} colonnes écrites dans {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
