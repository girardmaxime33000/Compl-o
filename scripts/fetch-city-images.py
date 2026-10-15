#!/usr/bin/env python3
"""
Sélectionne des photos Unsplash pour les pages ville et écrit src/data/city-images.json.

Clé API : variable d'environnement UNSPLASH_ACCESS_KEY (jamais dans le dépôt). Elle n'est utilisée que par ce script,
pas par le site : les pages lisent le JSON généré, sans appel à l'API à l'exécution.

Étapes (stdlib seule) :
  1. python3 scripts/fetch-city-images.py search [slug ...]
     (avec des slugs : ne relance que ces villes, ex. `search saint-denis-reunion`)
     Cherche des photos pour chacune des villes de src/data/cities.json, écrit
     data/unsplash/candidates.json et une planche de contact data/unsplash/candidates.html
     (à ouvrir dans un navigateur). Si scripts/city-images-selection.json n'existe pas, y écrit un brouillon
     (première photo de chaque ville).
  2. Relire la planche, corriger scripts/city-images-selection.json ({"paris": "<id Unsplash>", ...}).
  3. python3 scripts/fetch-city-images.py build
     Récupère les métadonnées des photos retenues, déclare le « téléchargement » à Unsplash (obligation des
     directives de l'API : endpoint download_location, une fois par photo retenue) et écrit src/data/city-images.json.

Les images ne sont PAS copiées dans le dépôt : le site les affiche depuis images.unsplash.com (hotlink exigé par les
directives de l'API), avec crédit du photographe et lien vers Unsplash.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CITIES = ROOT / "src" / "data" / "cities.json"
OUT = ROOT / "src" / "data" / "city-images.json"
SELECTION = ROOT / "scripts" / "city-images-selection.json"
WORK = ROOT / "data" / "unsplash"
API = "https://api.unsplash.com"
PER_CITY = 8

# Requêtes plus précises que « <ville> France » quand le nom est ambigu ou peu photographié.
QUERY_OVERRIDES = {
    "saint-denis-reunion": "Saint-Denis La Réunion île",
    "villeurbanne": "Villeurbanne Lyon",
    "saint-etienne": "Saint-Etienne Loire",
    "le-havre": "Le Havre port",
}


def key():
    k = os.environ.get("UNSPLASH_ACCESS_KEY", "").strip()
    if not k:
        sys.exit("UNSPLASH_ACCESS_KEY manquante (export UNSPLASH_ACCESS_KEY=... puis relancer).")
    return k


def call(path, params=None):
    url = f"{API}{path}" + (f"?{urllib.parse.urlencode(params)}" if params else "")
    req = urllib.request.Request(url, headers={"Authorization": f"Client-ID {key()}", "Accept-Version": "v1"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            remaining = r.headers.get("X-Ratelimit-Remaining")
            if remaining is not None and int(remaining) < 3:
                sys.exit("Quota horaire Unsplash presque épuisé (50 requêtes par heure en mode demo) : relancer plus tard.")
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Erreur Unsplash {e.code} sur {path} : {e.read().decode()[:200]}")


def load_cities():
    return json.loads(CITIES.read_text(encoding="utf-8"))["cities"]


def search(only=None):
    """only : liste de slugs à (re)chercher ; les autres villes gardent leurs candidats et leur sélection."""
    WORK.mkdir(parents=True, exist_ok=True)
    candidates_file = WORK / "candidates.json"
    candidates = json.loads(candidates_file.read_text(encoding="utf-8")) if only and candidates_file.exists() else {}
    for city in load_cities():
        if only and city["slug"] not in only:
            continue
        query = QUERY_OVERRIDES.get(city["slug"], f"{city['name']} France")
        data = call("/search/photos", {"query": query, "per_page": PER_CITY, "orientation": "landscape", "content_filter": "high"})
        candidates[city["slug"]] = {
            "query": query,
            "photos": [
                {
                    "id": p["id"],
                    "alt": p.get("alt_description") or p.get("description") or "",
                    "author": p["user"]["name"],
                    "thumb": p["urls"]["small"],
                    "page": p["links"]["html"],
                    "width": p["width"],
                    "height": p["height"],
                }
                for p in data["results"]
            ],
        }
        print(f"{city['slug']}: {len(data['results'])} candidats ({query})")
        time.sleep(0.5)
    (WORK / "candidates.json").write_text(json.dumps(candidates, ensure_ascii=False, indent=2), encoding="utf-8")

    rows = []
    for slug, c in candidates.items():
        cells = "".join(
            f'<figure><img src="{p["thumb"]}" loading="lazy" alt=""><figcaption><code>{p["id"]}</code><br>{p["author"]}<br>'
            f'<small>{p["alt"]}</small></figcaption></figure>'
            for p in c["photos"]
        )
        rows.append(f"<h2>{slug} <small>({c['query']})</small></h2><div class=row>{cells}</div>")
    html = (
        "<!doctype html><meta charset=utf-8><title>Candidats Unsplash</title>"
        "<style>body{font-family:system-ui;margin:24px}.row{display:flex;gap:12px;flex-wrap:wrap}"
        "figure{margin:0;width:220px}img{width:220px;height:150px;object-fit:cover;border-radius:8px}"
        "figcaption{font-size:12px}</style><h1>Candidats : reporter l'id retenu dans scripts/city-images-selection.json</h1>"
        + "".join(rows)
    )
    (WORK / "candidates.html").write_text(html, encoding="utf-8")

    draft = json.loads(SELECTION.read_text(encoding="utf-8")) if SELECTION.exists() else {}
    for slug, c in candidates.items():
        # Sans argument : ne touche pas à une sélection existante. Avec des slugs : remet la première photo des villes citées.
        if c["photos"] and (slug in (only or []) or slug not in draft):
            draft[slug] = c["photos"][0]["id"]
    SELECTION.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Brouillon de sélection : {SELECTION.relative_to(ROOT)} (première photo par ville, à relire).")
    print(f"Planche de contact : {(WORK / 'candidates.html').relative_to(ROOT)}")


def build():
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    known = {c["slug"] for c in load_cities()}
    unknown = set(selection) - known
    if unknown:
        sys.exit(f"Villes inconnues dans la sélection : {sorted(unknown)}")
    photos = {}
    for slug, photo_id in sorted(selection.items()):
        p = call(f"/photos/{photo_id}")
        call_url = p["links"]["download_location"]
        # Déclaration du téléchargement (directives de l'API) : l'URL contient déjà le paramètre ixid.
        req = urllib.request.Request(call_url, headers={"Authorization": f"Client-ID {key()}", "Accept-Version": "v1"})
        urllib.request.urlopen(req, timeout=30).read()
        raw = p["urls"]["raw"].split("?")[0] + "?" + urllib.parse.urlencode({"ixid": urllib.parse.parse_qs(urllib.parse.urlparse(p["urls"]["raw"]).query).get("ixid", [""])[0]})
        photos[slug] = {
            "id": p["id"],
            "raw": raw,
            "width": p["width"],
            "height": p["height"],
            "author": p["user"]["name"],
            "authorUrl": p["user"]["links"]["html"],
            "pageUrl": p["links"]["html"],
            "alt": p.get("alt_description") or "",
        }
        print(f"{slug}: {p['id']} par {p['user']['name']}")
        time.sleep(0.5)
    out = {"source": "Unsplash", "selectedOn": time.strftime("%Y-%m-%d"), "photos": photos}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(photos)} photos écrites dans {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "search":
        search(sys.argv[2:] or None)
    elif cmd == "build":
        build()
    else:
        sys.exit(__doc__)
