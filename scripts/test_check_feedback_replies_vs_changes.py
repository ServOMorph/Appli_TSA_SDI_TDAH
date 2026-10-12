"""Auto-tests stdlib de check_feedback_replies_vs_changes.py et feedback_state.py.

Lancer avec : python scripts/test_check_feedback_replies_vs_changes.py
"""

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import feedback_state  # noqa: E402
from check_feedback_replies_vs_changes import flag_reports, map_changes_to_screens  # noqa: E402

SCREEN_FILES = [
    "src/ui/screens/dashboard/E10Dashboard.tsx",
    "src/ui/screens/dashboard/E12WeekPlanning.tsx",
    "src/ui/screens/dashboard/PlanningBoard.tsx",
    "src/ui/screens/tasks/E22TaskDetail.tsx",
]


class MapChangesTests(unittest.TestCase):
    def test_fichier_sans_code_rattache_aux_ecrans_de_son_dossier(self):
        codes, unmapped = map_changes_to_screens(["src/ui/screens/dashboard/PlanningBoard.tsx"], SCREEN_FILES)
        self.assertEqual(codes, {"E10", "E12"})
        self.assertEqual(unmapped, [])

    def test_code_dans_le_nom_du_fichier(self):
        codes, _ = map_changes_to_screens(["src/ui/screens/tasks/E22TaskDetail.test.tsx"], SCREEN_FILES)
        self.assertEqual(codes, {"E22"})

    def test_fichier_hors_ecrans_liste_a_part_et_hors_src_ignore(self):
        codes, unmapped = map_changes_to_screens(
            ["src/app/AppContext.tsx", "scripts/x.py", "CHANGELOG.md"], SCREEN_FILES
        )
        self.assertEqual(codes, set())
        self.assertEqual(unmapped, ["src/app/AppContext.tsx"])

    def test_retours_signales_par_code_d_ecran(self):
        reports = [{"id": "a", "screen_code": "E10"}, {"id": "b", "screen_code": "E77"}, {"id": "c", "screen_code": None}]
        flagged, others = flag_reports(reports, {"E10", "E12"})
        self.assertEqual([r["id"] for r in flagged], ["a"])
        self.assertEqual([r["id"] for r in others], ["b", "c"])


class FeedbackStateTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        state_patch = patch.object(feedback_state, "STATE_FILE", Path(directory.name) / "etat.json")
        state_patch.start()
        self.addCleanup(state_patch.stop)

    def test_pose_et_retrait(self):
        feedback_state.set_state("retour-1", "attend_decision", "question Marie livrets")
        self.assertEqual(feedback_state.read_state()["retour-1"]["statut"], "attend_decision")
        self.assertTrue(feedback_state.clear_state("retour-1"))
        self.assertFalse(feedback_state.clear_state("retour-1"))

    def test_statut_inconnu_refuse(self):
        with self.assertRaises(feedback_state.FeedbackStateError):
            feedback_state.set_state("retour-1", "corrige", "x")

    def test_reference_obligatoire(self):
        with self.assertRaises(feedback_state.FeedbackStateError):
            feedback_state.set_state("retour-1", "en_roadmap", "  ")


if __name__ == "__main__":
    unittest.main(verbosity=2)
