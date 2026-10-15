"""Tests hors ligne du pipeline Unsplash (API simulée, fichiers dans un dossier temporaire).

Lancer : python3 -B -m unittest scripts/test_fetch_unsplash_images.py
"""
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "fetch-unsplash-images.py"
spec = importlib.util.spec_from_file_location("fetch_unsplash_images", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def api_photo(pid, author="Jeanne Dupont"):
    return {
        "id": pid,
        "alt_description": f"photo {pid}",
        "color": "#336699",
        "width": 4000,
        "height": 3000,
        "urls": {"raw": f"https://images.unsplash.com/photo-{pid}?ixid=IX{pid}&other=1", "small": f"https://images.unsplash.com/small-{pid}"},
        "links": {"html": f"https://unsplash.com/photos/{pid}", "download_location": f"https://api.unsplash.com/photos/{pid}/download?ixid=IX{pid}"},
        "user": {"name": author, "links": {"html": f"https://unsplash.com/@{author.split()[0].lower()}"}},
    }


class PipelineTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "scripts").mkdir()
        (self.tmp / "src" / "data").mkdir(parents=True)
        shutil.copy(SCRIPT.parent / "site-images-catalogue.json", self.tmp / "scripts")
        self.patches = [mock.patch.object(mod, "ROOT", self.tmp), mock.patch.object(mod, "WORK", self.tmp / "data" / "unsplash")]
        for p in self.patches:
            p.start()
        self.calls = []
        self.downloads = []

        def fake_call(path, params=None):
            self.calls.append(path)
            if path == "/search/photos":
                q = params["query"]
                return {"results": [api_photo(f"{abs(hash(q)) % 10**6}a"), api_photo(f"{abs(hash(q)) % 10**6}b")]}
            return api_photo(path.rsplit("/", 1)[1])

        for p in (mock.patch.object(mod, "call", fake_call), mock.patch.object(mod, "declare_download", self.downloads.append), mock.patch.object(mod.time, "sleep")):
            p.start()
            self.patches.append(p)

    def tearDown(self):
        mock.patch.stopall()
        shutil.rmtree(self.tmp)

    def test_photo_entry_garde_ixid_et_retire_les_autres_parametres(self):
        e = mod.photo_entry(mod.candidate(api_photo("abc")))
        self.assertEqual(e["raw"], "https://images.unsplash.com/photo-abc?ixid=IXabc")
        self.assertEqual((e["author"], e["authorUrl"], e["color"]), ("Jeanne Dupont", "https://unsplash.com/@jeanne", "#336699"))
        self.assertEqual(e["pageUrl"], "https://unsplash.com/photos/abc")
        self.assertEqual(mod.photo_entry(api_photo("xyz"))["raw"], "https://images.unsplash.com/photo-xyz?ixid=IXxyz")

    def test_search_ecrit_candidats_planche_et_brouillon(self):
        mod.search("site")
        sel = json.loads((self.tmp / "scripts" / "site-images-selection.json").read_text(encoding="utf-8"))
        self.assertEqual(set(sel), set(mod.entries("site")))
        self.assertTrue((self.tmp / "data" / "unsplash" / "site-candidates.html").exists())
        self.assertEqual(self.calls.count("/search/photos"), len(mod.entries("site")))

    def test_search_cible_une_cle_et_garde_le_reste(self):
        mod.search("site")
        sel_path = self.tmp / "scripts" / "site-images-selection.json"
        before = json.loads(sel_path.read_text(encoding="utf-8"))
        before["login"] = "choix-manuel"
        sel_path.write_text(json.dumps(before), encoding="utf-8")
        self.calls.clear()
        mod.search("site", ["hero:home"])
        self.assertEqual(self.calls, ["/search/photos"])
        after = json.loads(sel_path.read_text(encoding="utf-8"))
        self.assertEqual(after["login"], "choix-manuel")

    def test_search_refuse_une_cle_inconnue(self):
        with self.assertRaises(SystemExit):
            mod.search("site", ["activity:inexistante"])

    def test_build_declare_une_fois_par_photo_sans_requete_photos(self):
        mod.search("site", ["hero:home", "login"])
        self.calls.clear()
        mod.build("site")
        out = json.loads((self.tmp / "src" / "data" / "site-images.json").read_text(encoding="utf-8"))
        self.assertEqual(set(out["photos"]), {"hero:home", "login"})
        self.assertEqual(len(self.downloads), 2)
        self.assertNotIn("/photos", "".join(self.calls))  # métadonnées issues des candidats
        # reprise : rien n'est redéclaré
        mod.build("site")
        self.assertEqual(len(self.downloads), 2)

    def test_build_sans_candidats_interroge_la_photo(self):
        (self.tmp / "scripts" / "site-images-selection.json").write_text(json.dumps({"login": "zzz"}), encoding="utf-8")
        mod.build("site")
        self.assertEqual(self.calls, ["/photos/zzz"])
        self.assertEqual(len(self.downloads), 1)

    def test_build_refuse_une_cle_inconnue(self):
        (self.tmp / "scripts" / "site-images-selection.json").write_text(json.dumps({"nimporte": "zzz"}), encoding="utf-8")
        with self.assertRaises(SystemExit):
            mod.build("site")
        self.assertEqual(self.downloads, [])

    def test_doublons_signales(self):
        errors, warnings = mod.check_selection("site", {"login": "p1", "hero:home": "p1"})
        self.assertEqual(errors, [])
        self.assertEqual(len(warnings), 1)

    def test_check_detecte_un_lien_hors_unsplash(self):
        bad = {"photos": {"login": {"id": "a", "raw": "https://exemple.fr/a.jpg", "width": 1, "height": 1, "author": "x", "authorUrl": "https://unsplash.com/@x", "pageUrl": "https://unsplash.com/photos/a"}}}
        (self.tmp / "src" / "data" / "site-images.json").write_text(json.dumps(bad), encoding="utf-8")
        with self.assertRaises(SystemExit) as ctx:
            mod.check("site")
        self.assertEqual(ctx.exception.code, 1)

    def test_colors_ne_declare_aucun_telechargement(self):
        mod.search("site", ["login"])
        mod.build("site")
        out_path = self.tmp / "src" / "data" / "site-images.json"
        data = json.loads(out_path.read_text(encoding="utf-8"))
        data["photos"]["login"]["color"] = ""
        out_path.write_text(json.dumps(data), encoding="utf-8")
        n = len(self.downloads)
        mod.colors("site")
        self.assertEqual(len(self.downloads), n)
        self.assertEqual(json.loads(out_path.read_text(encoding="utf-8"))["photos"]["login"]["color"], "#336699")


if __name__ == "__main__":
    unittest.main()
