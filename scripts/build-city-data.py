#!/usr/bin/env python3
"""
Construit src/data/cities.json à partir des fichiers bruts de data/raw/.

Sources (téléchargées par le propriétaire le 2026-10-14) :
- INSEE, populations légales des communes (fichier donnees_communes.csv, archive datée du 2022-12-14,
  populations en vigueur au 1er janvier 2023) : data/raw/insee_populations_legales_communes.csv
- INSEE, « Dossier complet » (recensement 2023, Filosofi), extrait des 20 communes par
  scripts/extract-dossier-complet.py : data/raw/insee_dossier_complet_20_communes.csv
- France Travail, enquête Besoins en main-d'œuvre (BMO), données ouvertes 2024 et 2025 :
  data/raw/Base_open_data_BMO_2024.xlsx, data/raw/Base_open_data_BMO_2025.xlsx
  Le millésime 2026 (Base-open-data-BMO-2026.xlsx) n'est pas utilisé : il est publié par comité local pour
  l'emploi (plusieurs lignes par bassin) et chaque ligne masquée rend le total du bassin incomplet, ce qui interdit
  une comparaison fiable avec 2025.

Usage : python3 scripts/build-city-data.py   (nécessite openpyxl)

Les 20 villes sont les 20 communes les plus peuplées, calculées ici (Paris, Lyon et Marseille agrègent leurs
arrondissements). Le rattachement ville -> bassin d'emploi BMO est un choix éditorial listé dans BASSINS ; le
script échoue si un bassin n'est pas retrouvé exactement une fois dans chaque millésime.
"""
import csv
import json
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "src" / "data" / "cities.json"

YEARS = {
    2024: "Base_open_data_BMO_2024.xlsx",
    2025: "Base_open_data_BMO_2025.xlsx",
}
CITY_COUNT = 20

# Ville (code INSEE) -> (département du bassin, nom du bassin BMO). Rattachement éditorial : le bassin
# d'emploi qui porte le nom de la ville, ou celui où se situe la commune pour Paris et Saint-Denis (La Réunion).
BASSINS = {
    "75056": ("75", "T1 Paris"),
    "13055": ("13", "MARSEILLE"),
    "69123": ("69", "LYON CENTRE"),
    "31555": ("31", "TOULOUSE"),
    "06088": ("06", "NICE"),
    "44109": ("44", "NANTES"),
    "34172": ("34", "MONTPELLIER"),
    "67482": ("67", "STRASBOURG"),
    "33063": ("33", "BORDEAUX"),
    "59350": ("59", "LILLE"),
    "35238": ("35", "RENNES"),
    "51454": ("51", "REIMS"),
    "83137": ("83", "TOULON"),
    "42218": ("42", "SAINT ETIENNE"),
    "76351": ("76", "LE HAVRE"),
    "21231": ("21", "DIJON"),
    "38185": ("38", "GRENOBLE"),
    "49007": ("49", "ANGERS"),
    "69266": ("69", "VILLEURBANNE"),
    "97411": ("974", "REUNION NORD"),
}
SLUG_OVERRIDES = {"97411": "saint-denis-reunion"}

# Activité du catalogue -> métiers BMO (code FAP) retenus. Choix éditorial : les chiffres BMO sont des projets de
# recrutement de salariés, utilisés comme indicateur de l'activité locale du secteur, pas de demande de services.
GROUPS = {
    "bricolage": ("Entretien et second œuvre du bâtiment", ["G0A43", "B2X32", "B2X33", "B2X36", "B2X38"]),
    "montage_meubles": ("Ameublement, agencement et déménagement", ["R1X61", "B2X38", "J0X30", "J0X31"]),
    "soutien_scolaire": ("Enseignement et accompagnement des élèves", ["W0X80", "W0X90", "V5X84"]),
    "cours_langue": ("Formation, interprétariat et enseignement", ["W1X80", "U0X81", "W0X90"]),
    "coursier": ("Livraison et conduite de véhicules légers", ["J3X42", "J3X40"]),
    "garde_animaux": ("Soins aux animaux (vétérinaires)", ["V2X92"]),
    "menage": ("Ménage et aide à domicile", ["T1X60", "T4X60", "T2A60"]),
    "jardinage": ("Jardins, espaces verts et horticulture", ["A1X41", "A1X40"]),
    "aide_informatique": ("Support et services aux utilisateurs informatiques", ["M1X81", "M1X80"]),
    "depot_vente": ("Vente d'habillement, d'équipement du foyer et de loisirs", ["R1X62", "R1X61"]),
}


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return "-".join("".join(c.lower() if c.isalnum() else " " for c in s).split())


def load_population() -> dict:
    agg: dict = {}
    with open(RAW / "insee_populations_legales_communes.csv", encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f, delimiter=";"):
            dep, com = r["CODDEP"], r["CODCOM"]
            # Code INSEE : département + commune ; outre-mer (97x) : « 97 » + code commune à 3 chiffres (ex. 97411).
            code, name = ("97" + com if dep.startswith("97") else dep + com), r["COM"]
            if dep == "75":
                code, name = "75056", "Paris"
            elif dep == "69" and com.startswith("38") and len(com) == 3 and 381 <= int(com) <= 389:
                code, name = "69123", "Lyon"
            elif dep == "13" and 201 <= int(com) <= 216:
                code, name = "13055", "Marseille"
            a = agg.setdefault(code, {"name": name, "ptot": 0, "pmun": 0, "region": r["REG"], "dep": dep})
            a["ptot"] += int(r["PTOT"])
            a["pmun"] += int(r["PMUN"])
    return agg


def load_insee(codes) -> dict:
    """Indicateurs INSEE par commune (GEO_OBJECT = COM), au dernier millésime disponible de chaque tableau."""
    values: dict = {}  # (code, tableau) -> (période, {mesure: valeur})
    with open(RAW / "insee_dossier_complet_20_communes.csv", encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f, delimiter=";"):
            if r["GEO_OBJECT"] != "COM" or r["GEO"] not in codes or r["OBS_VALUE"] in ("", None):
                continue
            key = (r["GEO"], r["ID_TAB"])
            period = r["TIME_PERIOD"]
            if key not in values or period > values[key][0]:
                values[key] = (period, {})
            if values[key][0] == period:
                values[key][1][r["TAB_MEASURE"]] = float(r["OBS_VALUE"])

    def get(code, tab, measure):
        period, m = values[(code, tab)]
        if measure not in m:
            raise SystemExit(f"Mesure {measure} absente de {tab} pour {code}")
        return m[measure]

    def pct(a, b):
        return round(100 * a / b, 1)

    out = {}
    for code in codes:
        pop = get(code, "POP_T1", "POP")
        age = lambda m: get(code, "POP_T1", m)  # noqa: E731
        houses = get(code, "LOG_T3", "DWELLINGS_TDW_1")
        dwellings = sum(get(code, "LOG_T3", m) for m in ("DWELLINGS_TDW_1", "DWELLINGS_TDW_2", "DWELLINGS_TDW_3T6"))
        main = get(code, "LOG_T5", "DWELLINGS_OCS_DW_MAIN")
        built_total = get(code, "LOG_T8", "DWELLINGS_OCS_DW_MAIN_BUILD_END_Y_LT2021")
        old = sum(
            get(code, "LOG_T8", f"DWELLINGS_OCS_DW_MAIN_BUILD_END_Y{p}") for p in ("_LT1919", "1919T1945", "1946T1970")
        )
        out[code] = {
            "censusYear": int(values[(code, "POP_T1")][0]),
            "incomeYear": int(values[(code, "REV_T1")][0]),
            "under15": pct(age("POP_AGE_Y_LT15"), pop),
            "age15to24": pct(age("POP_AGE_Y15T24"), pop),
            "age65plus": pct(age("POP_AGE_Y65T79") + age("POP_AGE_Y_GE80"), pop),
            "age80plus": pct(age("POP_AGE_Y_GE80"), pop),
            "houses": pct(houses, dwellings),
            "noCar": round(100 - pct(get(code, "LOG_T12", "DWELLINGS_OCS_DW_MAIN_CARS_C_GE1"), main), 1),
            "builtBefore1971": pct(old, built_total),
            "movedLessThan2y": pct(get(code, "LOG_T9", "DWELLINGS_OCS_DW_MAIN_L_STAY_Y_LT2"), get(code, "LOG_T9", "DWELLINGS_OCS_DW_MAIN")),
            "medianIncome": round(get(code, "REV_T1", "MED_SL")),
            "povertyRate": round(get(code, "REV_T1", "PR_MD60"), 1),
        }
    return out


def num(v):
    """Entier, ou None si la valeur est masquée (« * », secret statistique)."""
    try:
        return int(str(v).strip())
    except ValueError:
        return None


def load_bmo(year: int, filename: str):
    wb = openpyxl.load_workbook(RAW / filename, read_only=True)
    ws = wb.worksheets[-1]
    it = ws.iter_rows(values_only=True)
    header = list(next(it))
    col = {h: i for i, h in enumerate(header)}
    be_name = next(h for h in header if h.startswith("NOMBE"))
    rows = []
    for r in it:
        if r[col["annee"]] is None:
            continue
        rows.append(
            {
                "metier": r[col["Code métier BMO"]],
                "metier_name": r[col["Nom métier BMO"]],
                "dept": str(r[col["Dept"]]),
                "bassin": str(r[col[be_name]]).strip(),
                "met": num(r[col["met"]]),
                "xmet": num(r[col["xmet"]]),
                "smet": num(r[col["smet"]]),
            }
        )
    return rows


def main():
    pop = load_population()
    ranking = sorted(pop.items(), key=lambda kv: -kv[1]["ptot"])[:CITY_COUNT]
    missing = [c for c, _ in ranking if c not in BASSINS]
    if missing:
        raise SystemExit(f"Rattachement bassin manquant pour : {missing}")

    insee = load_insee({c for c, _ in ranking})
    bmo = {y: load_bmo(y, f) for y, f in YEARS.items()}
    metier_names: dict = {}
    for rows in bmo.values():
        for r in rows:
            metier_names.setdefault(r["metier"], r["metier_name"].strip())

    cities = []
    for rank, (code, p) in enumerate(ranking, 1):
        dep, bassin = BASSINS[code]
        entry = {
            "slug": SLUG_OVERRIDES.get(code, slugify(p["name"])),
            "name": p["name"],
            "inseeCode": code,
            "region": p["region"],
            "rank": rank,
            "population": {"total": p["ptot"], "municipal": p["pmun"]},
            "bassin": bassin,
            "insee": insee[code],
            "bmo": {},
        }
        for year, rows in bmo.items():
            rows_city = [r for r in rows if r["dept"] == dep and r["bassin"] == bassin]
            if not rows_city:
                raise SystemExit(f"Bassin {bassin} ({dep}) introuvable en {year} pour {p['name']}")
            year_data = {}
            for activity, (_, codes) in GROUPS.items():
                rows_act = [r for r in rows_city if r["metier"] in codes]
                tot = {"met": 0, "xmet": 0, "smet": 0}
                complete = {"met": True, "xmet": True, "smet": True}
                for r in rows_act:
                    for k in tot:
                        if r[k] is None:
                            complete[k] = False  # valeur masquée : le total est un minimum
                        else:
                            tot[k] += r[k]
                year_data[activity] = {
                    **tot,
                    "complete": complete,
                    "metiersFound": len({r["metier"] for r in rows_act}),
                }
            entry["bmo"][str(year)] = year_data
        cities.append(entry)

    out = {
        "generatedBy": "scripts/build-city-data.py",
        "sources": {
            "population": {
                "label": "INSEE, populations légales des communes (en vigueur au 1er janvier 2023)",
                "url": "https://www.insee.fr/fr/statistiques/6683035",
                "file": "data/raw/insee_populations_legales_communes.csv",
                "note": "Paris, Lyon et Marseille : somme des arrondissements.",
            },
            "insee": {
                "label": "INSEE, Dossier complet : recensement de la population (millésime 2023) et Filosofi (revenus et pauvreté)",
                "url": "https://www.insee.fr/fr/statistiques/5359146",
                "file": "data/raw/insee_dossier_complet_20_communes.csv",
                "note": "Parts calculées sur les résidences principales (voiture, ancienneté d'emménagement, période de construction) ou sur l'ensemble des logements (maisons).",
            },
            "bmo": {
                "label": "France Travail, enquête Besoins en main-d'œuvre (BMO), données ouvertes 2024 et 2025",
                "url": "https://statistiques.francetravail.org/bmo",
                "files": list(YEARS.values()),
                "note": "Projets de recrutement de salariés déclarés par les établissements, par bassin d'emploi. Indicateur d'activité locale du secteur, pas de demande de services.",
            },
        },
        "downloadedOn": "2026-10-14",
        "years": sorted(YEARS),
        "groups": {
            a: {"label": label, "metiers": [{"code": c, "name": metier_names.get(c, c)} for c in codes]}
            for a, (label, codes) in GROUPS.items()
        },
        "cities": cities,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(cities)} villes écrites dans {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
