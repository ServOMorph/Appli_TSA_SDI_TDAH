"""Auto-tests stdlib de feedback_state.py.

Lancer avec : python scripts/test_feedback_state.py
"""

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import feedback_state  # noqa: E402
from feedback_state import FeedbackStateError, read_state  # noqa: E402


class ReadStateTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.path = Path(directory.name) / "etat_retours.json"
        patcher = patch.object(feedback_state, "STATE_FILE", self.path)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_fichier_absent_donne_un_etat_vide(self):
        self.assertEqual(read_state(), {})

    def test_fichier_valide_est_lu(self):
        self.path.write_text('{"retour-1": {"statut": "en_roadmap"}}', encoding="utf-8")
        self.assertEqual(read_state()["retour-1"]["statut"], "en_roadmap")

    def test_json_corrompu_leve_une_erreur_explicite(self):
        self.path.write_text("{oups", encoding="utf-8")
        with self.assertRaises(FeedbackStateError):
            read_state()

    def test_json_qui_nest_pas_un_objet_leve_une_erreur_explicite(self):
        self.path.write_text("[]", encoding="utf-8")
        with self.assertRaises(FeedbackStateError):
            read_state()


if __name__ == "__main__":
    unittest.main(verbosity=2)
