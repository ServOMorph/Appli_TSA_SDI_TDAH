"""Auto-tests stdlib de queue_pending_feedback_reply.py et republish_pending_feedback_replies.py.

Lancer avec : python scripts/test_queue_pending_feedback_reply.py
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _supabase import SupabaseError  # noqa: E402
import queue_pending_feedback_reply as queue_module  # noqa: E402
import reply_feedback_report  # noqa: E402
from republish_pending_feedback_replies import publish_entries  # noqa: E402
from reply_feedback_report import ReportResolvedError  # noqa: E402


class QueueTestCase(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.queue_file = Path(directory.name) / "file.json"
        for target in (reply_feedback_report, queue_module):
            file_patch = patch.object(target, "QUEUE_FILE", self.queue_file)
            file_patch.start()
            self.addCleanup(file_patch.stop)

    def entries(self) -> list[dict]:
        return json.loads(self.queue_file.read_text(encoding="utf-8"))


class QueuePendingFeedbackReplyTests(QueueTestCase):
    def test_ajout_horodate_l_entree(self):
        queue_module.queue_reply("retour-1", "E10", " Corrige. ")
        entry = self.entries()[0]
        self.assertEqual(entry["body"], "Corrige.")
        self.assertIn("queued_at", entry)

    def test_doublon_refuse_sans_replace(self):
        queue_module.queue_reply("retour-1", "E10", "Premier.")
        with self.assertRaises(SupabaseError):
            queue_module.queue_reply("retour-1", "E10", "Second.")

    def test_replace_remplace_sans_dupliquer(self):
        queue_module.queue_reply("retour-1", "E10", "Premier.")
        queue_module.queue_reply("retour-1", "E10", "Second.", replace=True)
        self.assertEqual([e["body"] for e in self.entries()], ["Second."])

    def test_replace_sans_entree_existante_refuse(self):
        with self.assertRaises(SupabaseError):
            queue_module.queue_reply("retour-1", "E10", "Texte.", replace=True)

    def test_retrait(self):
        queue_module.queue_reply("retour-1", "E10", "Un.")
        queue_module.queue_reply("retour-2", "E21", "Deux.")
        queue_module.remove_reply("retour-1")
        self.assertEqual([e["report_id"] for e in self.entries()], ["retour-2"])

    def test_retrait_d_une_entree_absente_refuse(self):
        with self.assertRaises(SupabaseError):
            queue_module.remove_reply("retour-1")


class RepublishTests(QueueTestCase):
    def test_retour_valide_entre_temps_est_retire_de_la_file(self):
        entries = [
            {"report_id": "retour-1", "body": "Un."},
            {"report_id": "retour-2", "body": "Deux."},
            {"report_id": "retour-3", "body": "Trois."},
        ]
        outcomes = [None, ReportResolvedError("valide"), SupabaseError("panne")]
        with patch("republish_pending_feedback_replies.deposit_reply", side_effect=outcomes):
            published, dropped, remaining = publish_entries("https://example.test", "key", entries)
        self.assertEqual((published, dropped), (1, 1))
        self.assertEqual([e["report_id"] for e in remaining], ["retour-3"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
