"""Auto-tests de ingest_manual_tests.py (roadmap_integration_onboard.md, Phase 6).

Bibliotheque standard uniquement : `python scripts/test_ingest_manual_tests.py`.
Aucun accès aux vraies données des testeurs : les exports sont synthétiques.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ingest_manual_tests import (  # noqa: E402
    journal_path,
    load_journal,
    normalize_tester_code,
    resolve_tester,
)


class NormalizeTesterCode(unittest.TestCase):
    def test_minuscule_et_trim(self):
        self.assertEqual(normalize_tester_code(" Marie "), "marie")

    def test_caracteres_speciaux_remplaces(self):
        self.assertEqual(normalize_tester_code("Marie B."), "marie-b")

    def test_vide_apres_normalisation(self):
        self.assertEqual(normalize_tester_code("   "), "")
        self.assertEqual(normalize_tester_code("!!!"), "")


class ResolveTester(unittest.TestCase):
    def test_explicite_prioritaire_sur_export(self):
        export = {"settings": {"tester_code": "satine"}}
        self.assertEqual(resolve_tester("morpheus", export), "morpheus")

    def test_deduit_de_lexport_si_absent(self):
        export = {"settings": {"tester_code": "Marie"}}
        self.assertEqual(resolve_tester(None, export), "marie")

    def test_aucun_testeur_resoluble(self):
        self.assertIsNone(resolve_tester(None, {}))
        self.assertIsNone(resolve_tester(None, {"settings": {}}))
        self.assertIsNone(resolve_tester(None, {"settings": {"tester_code": "   "}}))

    def test_explicite_vide_apres_normalisation_retombe_sur_lexport(self):
        # --tester "!!!" se normalise en chaine vide : ne doit jamais forcer un testeur "!!!"
        # invalide, mais un explicite vide n'a pas de sens d'usage - traite comme absent.
        self.assertIsNone(resolve_tester("!!!", {}))


class IngestJournal(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def ecrire_journal(self, tester: str, entries: list[dict]) -> Path:
        path = self.dir / f"{tester}.json"
        path.write_text(json.dumps({"entries": entries}, ensure_ascii=False), encoding="utf-8")
        return path

    def test_journal_absent_retourne_liste_vide(self):
        self.assertEqual(load_journal(self.dir / "morpheus.json"), {"entries": []})

    def test_journal_existant_relu(self):
        path = self.ecrire_journal("marie", [{"id": "r1", "test_id": "x", "created_at": "2026-01-01"}])
        self.assertEqual(load_journal(path)["entries"][0]["id"], "r1")

    def test_journal_path_isole_par_testeur(self):
        self.assertNotEqual(journal_path("marie"), journal_path("morpheus"))
        self.assertEqual(journal_path("marie").name, "marie.json")


if __name__ == "__main__":
    unittest.main(verbosity=2)
