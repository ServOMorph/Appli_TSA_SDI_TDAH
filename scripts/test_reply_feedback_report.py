"""Auto-tests stdlib de reply_feedback_report.py.

Lancer avec : python scripts/test_reply_feedback_report.py
"""

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _supabase import SupabaseError  # noqa: E402
from reply_feedback_report import (  # noqa: E402
    build_open_reports_query,
    build_report_messages_query,
    deposit_reply,
    find_report,
    list_reports_needing_reply,
)


class ReplyFeedbackReportTests(unittest.TestCase):
    def test_requete_retours_ouverts_filtre_et_trie(self):
        query = build_open_reports_query()
        self.assertIn("resolved_at=is.null", query)
        self.assertIn("order=created_at.asc", query)

    def test_requete_messages_encode_les_identifiants(self):
        query = build_report_messages_query(["retour 1", "retour-2"])
        self.assertIn("select=report_id,author,created_at", query)
        self.assertIn("report_id=in.(retour%201,retour-2)", query)

    def test_liste_exclut_les_retours_dont_le_dernier_message_est_de_lagent(self):
        reports = [{"id": "retour-1"}, {"id": "retour-2"}, {"id": "retour-3"}]
        messages = [
            {"report_id": "retour-1", "author": "agent", "created_at": "2026-09-15T06:55:55Z"},
            {"report_id": "retour-2", "author": "agent", "created_at": "2026-09-15T06:00:00Z"},
            {"report_id": "retour-2", "author": "user", "created_at": "2026-09-15T11:54:30Z"},
        ]
        with patch(
            "reply_feedback_report.fetch_rows",
            side_effect=[reports, messages],
        ) as fetch:
            result = list_reports_needing_reply("https://example.test", "key")
        # retour-1 : dernier message de l'agent, exclu. retour-2 : relance du testeur apres la
        # reponse de l'agent, inclus. retour-3 : jamais repondu, inclus.
        self.assertEqual([r["id"] for r in result], ["retour-2", "retour-3"])
        self.assertEqual(fetch.call_count, 2)

    def test_liste_vide_ne_requete_pas_les_messages(self):
        with patch("reply_feedback_report.fetch_rows", side_effect=[[]]) as fetch:
            result = list_reports_needing_reply("https://example.test", "key")
        self.assertEqual(result, [])
        self.assertEqual(fetch.call_count, 1)

    def test_retour_introuvable_est_rejete(self):
        with patch("reply_feedback_report.fetch_rows", return_value=[]):
            with self.assertRaises(SupabaseError):
                find_report("https://example.test", "key", "retour-1")

    def test_reponse_vide_est_rejetee_sans_appel_reseau(self):
        with patch("reply_feedback_report.fetch_rows") as fetch:
            with self.assertRaises(SupabaseError):
                deposit_reply("https://example.test", "key", "retour-1", "   ")
        fetch.assert_not_called()

    def test_retour_deja_valide_est_rejete(self):
        with patch(
            "reply_feedback_report.find_report",
            return_value={"id": "retour-1", "device_id": "appareil-1", "resolved_at": "2026-09-14T10:00:00Z"},
        ):
            with patch("reply_feedback_report.insert_row") as insert:
                with self.assertRaises(SupabaseError):
                    deposit_reply("https://example.test", "key", "retour-1", "Le correctif est en ligne.")
            insert.assert_not_called()

    def test_depot_construit_un_message_agent_bien_forme(self):
        with patch(
            "reply_feedback_report.find_report",
            return_value={"id": "retour-1", "device_id": "appareil-1", "resolved_at": None},
        ):
            with patch("reply_feedback_report.insert_row", return_value={"id": "message-1"}) as insert:
                result = deposit_reply("https://example.test", "key", "retour-1", "Le correctif est en ligne.")
        self.assertEqual(result, {"id": "message-1"})
        insert.assert_called_once()
        args, _ = insert.call_args
        table, message = args[2], args[3]
        self.assertEqual(table, "feedback_messages")
        self.assertEqual(message["report_id"], "retour-1")
        self.assertEqual(message["device_id"], "appareil-1")
        self.assertEqual(message["author"], "agent")
        self.assertEqual(message["body"], "Le correctif est en ligne.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
