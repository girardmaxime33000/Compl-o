#!/usr/bin/env python3
"""
Sélectionne des photos Unsplash et écrit les fichiers JSON lus par le site (aucun appel à l'API à l'exécution).

Deux périmètres (premier argument après la commande, `cities` par défaut) :
  cities : une photo par ville de src/data/cities.json            -> src/data/city-images.json
  site   : accueil, CTA final, login, activités, activités urbaines, guides
           (catalogue de requêtes : scripts/site-images-catalogue.json) -> src/data/site-images.json

Clé API : variable d'environnement UNSPLASH_ACCESS_KEY (jamais dans le dépôt), utilisée par ce script uniquement.

Étapes (stdlib seule) :
  1. python3 scripts/fetch-unsplash-images.py search [cities|site] [clé ...]
     Cherche des photos pour chaque entrée (ou seulement les clés citées), écrit data/unsplash/<périmètre>-candidates.json
     et une planche de contact data/unsplash/<périmètre>-candidates.html (à ouvrir dans un navigateur). Si le fichier de
     sélection n'existe pas, y écrit un brouillon (première photo de chaque entrée).
  2. Relire la planche, corriger scripts/<périmètre>-images-selection.json ({"clé": "<id Unsplash>", ...}).
  3. python3 scripts/fetch-unsplash-images.py build [cities|site]
     Déclare le « téléchargement » à Unsplash (obligation des directives de l'API, une fois par photo retenue) et écrit
     le JSON du site. Reprise possible après un arrêt de quota : les photos déjà écrites sont conservées.
  4. python3 scripts/fetch-unsplash-images.py colors [cities|site]
     Ajoute la couleur moyenne (fond avant chargement) aux photos déjà retenues, sans nouvelle déclaration.
  5. python3 scripts/fetch-unsplash-images.py check [cities|site]
     Vérifie la sélection (clés connues, doublons) et le JSON écrit, sans appeler l'API.

Les images ne sont PAS copiées dans le dépôt : le site les affiche depuis images.unsplash.com (hotlink exigé par les
directives de l'API), avec crédit du photographe et lien vers Unsplash.
"""
import html
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "data" / "unsplash"
API = "https://api.unsplash.com"
PER_ENTRY = 8

# Requêtes plus précises que « <ville> France » quand le nom est ambigu ou peu photographié.
CITY_QUERY_OVERRIDES = {
    "saint-denis-reunion": "Saint-Denis Reunion",
    "villeurbanne": "Villeurbanne Lyon",
    "saint-etienne": "Saint-Etienne Loire",
    "le-havre": "Le Havre port",
}

SCOPES = ("cities", "site")


def paths(scope):
    """Fichiers du périmètre : JSON du site, sélection, candidats, planche de contact."""
    out = ROOT / "src" / "data" / ("city-images.json" if scope == "cities" else "site-images.json")
    return {
        "out": out,
        "selection": ROOT / "scripts" / f"{'city' if scope == 'cities' else 'site'}-images-selection.json",
        "candidates": WORK / f"{scope}-candidates.json",
        "sheet": WORK / f"{scope}-candidates.html",
    }


def entries(scope):
    """Entrées du périmètre : {clé: {"query": ..., "orientation": ...}}."""
    if scope == "cities":
        cities = json.loads((ROOT / "src" / "data" / "cities.json").read_text(encoding="utf-8"))["cities"]
        return {
            c["slug"]: {"query": CITY_QUERY_OVERRIDES.get(c["slug"], f"{c['name']} France"), "orientation": "landscape"}
            for c in cities
        }
    return json.loads((ROOT / "scripts" / "site-images-catalogue.json").read_text(encoding="utf-8"))


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
                sys.exit("Quota horaire Unsplash presque épuisé (50 requêtes par heure en mode demo) : relancer la commande dans une heure, ce qui est déjà fait est conservé.")
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Erreur Unsplash {e.code} sur {path} : {e.read().decode()[:200]}")


def declare_download(download_location):
    """Déclaration du téléchargement (directives de l'API) : l'URL contient déjà le paramètre ixid."""
    req = urllib.request.Request(download_location, headers={"Authorization": f"Client-ID {key()}", "Accept-Version": "v1"})
    urllib.request.urlopen(req, timeout=30).read()


def candidate(p):
    """Champs conservés pour un résultat de recherche : de quoi afficher la planche et construire l'entrée finale."""
    return {
        "id": p["id"],
        "alt": p.get("alt_description") or p.get("description") or "",
        "author": p["user"]["name"],
        "authorUrl": p["user"]["links"]["html"],
        "thumb": p["urls"]["small"],
        "raw": p["urls"]["raw"],
        "page": p["links"]["html"],
        "download": p["links"]["download_location"],
        "width": p["width"],
        "height": p["height"],
        "color": p.get("color") or "",
    }


def photo_entry(c):
    """Entrée du JSON du site, à partir d'un candidat ou d'un objet photo de l'API (même noms pour les champs communs)."""
    raw = c["raw"] if "raw" in c and isinstance(c["raw"], str) else c["urls"]["raw"]
    ixid = urllib.parse.parse_qs(urllib.parse.urlparse(raw).query).get("ixid", [""])[0]
    return {
        "id": c["id"],
        "raw": raw.split("?")[0] + "?" + urllib.parse.urlencode({"ixid": ixid}),
        "width": c["width"],
        "height": c["height"],
        "author": c["author"] if "author" in c else c["user"]["name"],
        "authorUrl": c["authorUrl"] if "authorUrl" in c else c["user"]["links"]["html"],
        "pageUrl": c["page"] if "page" in c else c["links"]["html"],
        "alt": c.get("alt") if "alt" in c else (c.get("alt_description") or ""),
        "color": c.get("color") or "",
    }


def contact_sheet(candidates):
    rows = []
    for k, c in candidates.items():
        cells = "".join(
            f'<figure><img src="{html.escape(p["thumb"])}" loading="lazy" alt=""><figcaption><code>{html.escape(p["id"])}</code><br>'
            f'{html.escape(p["author"])}<br><small>{html.escape(p["alt"])}</small></figcaption></figure>'
            for p in c["photos"]
        )
        rows.append(f"<h2>{html.escape(k)} <small>({html.escape(c['query'])})</small></h2><div class=row>{cells}</div>")
    return (
        "<!doctype html><meta charset=utf-8><title>Candidats Unsplash</title>"
        "<style>body{font-family:system-ui;margin:24px}.row{display:flex;gap:12px;flex-wrap:wrap}"
        "figure{margin:0;width:220px}img{width:220px;height:150px;object-fit:cover;border-radius:8px}"
        "figcaption{font-size:12px}</style><h1>Candidats : reporter l'id retenu dans le fichier de sélection</h1>"
        + "".join(rows)
    )


def search(scope, only=None):
    """only : clés à (re)chercher ; les autres entrées gardent leurs candidats et leur sélection."""
    f = paths(scope)
    WORK.mkdir(parents=True, exist_ok=True)
    wanted = entries(scope)
    unknown = set(only or []) - set(wanted)
    if unknown:
        sys.exit(f"Clés inconnues pour « {scope} » : {sorted(unknown)}")
    candidates = json.loads(f["candidates"].read_text(encoding="utf-8")) if only and f["candidates"].exists() else {}
    for k, spec in wanted.items():
        if only and k not in only:
            continue
        data = call("/search/photos", {"query": spec["query"], "per_page": PER_ENTRY, "orientation": spec["orientation"], "content_filter": "high"})
        candidates[k] = {"query": spec["query"], "photos": [candidate(p) for p in data["results"]]}
        print(f"{k}: {len(data['results'])} candidats ({spec['query']})")
        time.sleep(0.5)
    f["candidates"].write_text(json.dumps(candidates, ensure_ascii=False, indent=2), encoding="utf-8")
    f["sheet"].write_text(contact_sheet(candidates), encoding="utf-8")

    draft = json.loads(f["selection"].read_text(encoding="utf-8")) if f["selection"].exists() else {}
    for k, c in candidates.items():
        # Sans argument : ne touche pas à une sélection existante. Avec des clés : remet la première photo des entrées citées.
        if k in (only or []) and not c["photos"]:
            draft.pop(k, None)  # aucune photo : on retire l'ancienne sélection, la page garde son visuel généré
        elif c["photos"] and (k in (only or []) or k not in draft):
            draft[k] = c["photos"][0]["id"]
    f["selection"].write_text(json.dumps(draft, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Brouillon de sélection : {f['selection'].relative_to(ROOT)} (première photo par entrée, à relire).")
    print(f"Planche de contact : {f['sheet'].relative_to(ROOT)}")


def check_selection(scope, selection):
    """Problèmes de la sélection : clés inconnues, doublons. Retourne (erreurs, avertissements)."""
    errors, warnings = [], []
    unknown = set(selection) - set(entries(scope))
    if unknown:
        errors.append(f"clés inconnues dans la sélection : {sorted(unknown)}")
    by_id = {}
    for k, pid in selection.items():
        by_id.setdefault(pid, []).append(k)
    for pid, ks in by_id.items():
        if len(ks) > 1:
            warnings.append(f"la photo {pid} est utilisée par plusieurs emplacements : {sorted(ks)}")
    return errors, warnings


def build(scope):
    f = paths(scope)
    selection = json.loads(f["selection"].read_text(encoding="utf-8"))
    errors, warnings = check_selection(scope, selection)
    if errors:
        sys.exit("Sélection invalide : " + " ; ".join(errors))
    for w in warnings:
        print("Attention :", w)
    candidates = json.loads(f["candidates"].read_text(encoding="utf-8")) if f["candidates"].exists() else {}
    # Reprise : les entrées déjà écrites avec la même photo sont conservées (aucun appel, aucune nouvelle déclaration).
    done = json.loads(f["out"].read_text(encoding="utf-8")).get("photos", {}) if f["out"].exists() else {}
    photos = {k: p for k, p in done.items() if selection.get(k) == p["id"]}

    def save():
        out = {"source": "Unsplash", "selectedOn": time.strftime("%Y-%m-%d"), "photos": dict(sorted(photos.items()))}
        f["out"].write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for k, photo_id in sorted(selection.items()):
        if k in photos:
            print(f"{k}: déjà fait ({photo_id})")
            continue
        # Les métadonnées viennent des candidats quand ils existent (1 requête par photo au lieu de 2).
        known = next((p for p in candidates.get(k, {}).get("photos", []) if p["id"] == photo_id), None)
        if known:
            entry, download = photo_entry(known), known["download"]
        else:
            p = call(f"/photos/{photo_id}")
            entry, download = photo_entry(p), p["links"]["download_location"]
        declare_download(download)
        photos[k] = entry
        save()  # écriture après chaque entrée : un arrêt (quota) ne perd rien
        print(f"{k}: {entry['id']} par {entry['author']}")
        time.sleep(0.5)
    save()
    print(f"{len(photos)} photos dans {f['out'].relative_to(ROOT)}")


def colors(scope):
    """Ajoute la couleur moyenne aux photos déjà retenues. Lecture seule : aucune nouvelle déclaration de téléchargement."""
    out = paths(scope)["out"]
    data = json.loads(out.read_text(encoding="utf-8"))
    changed = 0
    for k, photo in sorted(data["photos"].items()):
        if photo.get("color"):
            continue
        photo["color"] = call(f"/photos/{photo['id']}").get("color") or ""
        changed += 1
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")  # reprise possible après un arrêt de quota
        print(f"{k}: {photo['color']}")
        time.sleep(0.5)
    print(f"{changed} couleurs ajoutées dans {out.relative_to(ROOT)}")


def check(scope):
    """Contrôle hors ligne : sélection (clés, doublons), JSON écrit (champs obligatoires, hotlink), emplacements sans photo."""
    f = paths(scope)
    problems = 0
    if f["selection"].exists():
        errors, warnings = check_selection(scope, json.loads(f["selection"].read_text(encoding="utf-8")))
        for m in errors:
            print("ERREUR :", m)
        for m in warnings:
            print("Attention :", m)
        problems += len(errors)
    photos = json.loads(f["out"].read_text(encoding="utf-8")).get("photos", {}) if f["out"].exists() else {}
    for k, p in photos.items():
        for field in ("id", "raw", "width", "height", "author", "authorUrl", "pageUrl"):
            if not p.get(field):
                print(f"ERREUR : {k} sans {field}")
                problems += 1
        if not str(p.get("raw", "")).startswith("https://images.unsplash.com/"):
            print(f"ERREUR : {k} : l'URL n'est pas un lien images.unsplash.com (hotlink exigé)")
            problems += 1
        if not str(p.get("authorUrl", "")).startswith("https://unsplash.com/"):
            print(f"ERREUR : {k} : lien photographe invalide")
            problems += 1
    missing = sorted(set(entries(scope)) - set(photos))
    print(f"{len(photos)} photos écrites, {len(missing)} emplacements sans photo" + (f" : {missing}" if missing and len(missing) <= 30 else ""))
    sys.exit(1 if problems else 0)


COMMANDS = {"search": search, "build": build, "colors": colors, "check": check}

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] not in COMMANDS:
        sys.exit(__doc__)
    cmd, rest = args[0], args[1:]
    scope = rest.pop(0) if rest and rest[0] in SCOPES else "cities"
    if cmd == "search":
        search(scope, rest or None)
    elif rest:
        sys.exit(f"« {cmd} » n'accepte pas de clés (seulement `search`).")
    else:
        COMMANDS[cmd](scope)
