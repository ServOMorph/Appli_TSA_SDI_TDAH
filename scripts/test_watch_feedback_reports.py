"""Auto-tests stdlib de watch_feedback_reports.py.

Lancer avec : python scripts/test_watch_feedback_reports.py
"""

import io
import sys
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import watch_feedback_reports as watch  # noqa: E402
from _supabase import SupabaseError  # noqa: E402


class FakeStdout(io.StringIO):
    def reconfigure(self, **kwargs):
        pass


def entry(report_id, last_at=None, etat=False, relance=False):
    result = {"id": report_id, "last_message": {"created_at": last_at, "author": "user"} if last_at else None}
    if etat:
        result["etat"] = {"status": "en_roadmap"}
        result["relance_depuis_etat"] = relance
    return result


class FiltreTests(unittest.TestCase):
    def test_retour_masque_par_son_etat_est_ignore(self):
        self.assertEqual(watch.actionable([entry("a", etat=True)]), [])

    def test_retour_relance_depuis_son_etat_est_retenu(self):
        self.assertEqual(len(watch.actionable([entry("a", "2026-10-12T10:00:00", etat=True, relance=True)])), 1)

    def test_reference_ecarte_ce_qui_existait(self):
        existing = entry("a", "2026-10-12T10:00:00")
        baseline = {watch.entry_key(existing)}
        newer = entry("a", "2026-10-12T11:00:00")
        self.assertEqual(watch.new_entries([existing], baseline), [])
        self.assertEqual(watch.new_entries([newer, entry("b")], baseline), [newer, entry("b")])


class BoucleTests(unittest.TestCase):
    def run_main(self, argv, side_effects):
        out, err = FakeStdout(), io.StringIO()
        with patch.object(sys, "argv", ["watch"] + argv), patch.object(sys.stdout, "reconfigure", create=True), \
                patch("watch_feedback_reports.read_credentials", return_value=("u", "k")), \
                patch("watch_feedback_reports.list_reports_needing_reply", side_effect=side_effects), \
                patch("watch_feedback_reports.time.sleep"), redirect_stdout(out), redirect_stderr(err):
            code = watch.main()
        return code, out.getvalue(), err.getvalue()

    def test_sort_avec_10_et_affiche_les_retours(self):
        code, out, _ = self.run_main(["--interval", "1"], [[], [entry("a", "2026-10-12T10:00:00")]])
        self.assertEqual(code, watch.EXIT_TO_PROCESS)
        self.assertIn('"id": "a"', out)

    def test_une_fois_sans_rien_sort_avec_0(self):
        code, out, _ = self.run_main(["--une-fois"], [[]])
        self.assertEqual((code, out), (0, ""))

    def test_ignorer_existants_attend_un_nouveau_retour(self):
        code, out, _ = self.run_main(
            ["--ignorer-existants"], [[entry("a")], [entry("a")], [entry("a"), entry("b")]]
        )
        self.assertEqual(code, watch.EXIT_TO_PROCESS)
        self.assertIn('"id": "b"', out)
        self.assertNotIn('"id": "a"', out)

    def test_erreur_passagere_ne_stoppe_pas_la_surveillance(self):
        code, _, _ = self.run_main([], [SupabaseError("reseau"), [entry("a")]])
        self.assertEqual(code, watch.EXIT_TO_PROCESS)

    def test_erreurs_persistantes_sortent_avec_1(self):
        code, _, _ = self.run_main([], [SupabaseError("reseau")] * watch.MAX_CONSECUTIVE_ERRORS)
        self.assertEqual(code, 1)


if __name__ == "__main__":
    unittest.main()
