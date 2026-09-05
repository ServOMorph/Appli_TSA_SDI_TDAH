"""Auto-tests stdlib de read_feedback_reports.py.

Lancer avec : python scripts/test_read_feedback_reports.py
"""

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _supabase import SupabaseError  # noqa: E402
from read_feedback_reports import build_query, download_images, image_filename  # noqa: E402


class ReadFeedbackReportsTests(unittest.TestCase):
    def test_requete_liste_les_champs_et_trie_par_date(self):
        query = build_query(None)
        self.assertIn("select=id,device_id,screen_code,comment,storage_path", query)
        self.assertIn("order=created_at.desc", query)

    def test_requete_filtre_l_appareil_encode(self):
        self.assertIn("device_id=eq.appareil%20test", build_query("appareil test"))

    def test_nom_image_derive_de_l_identifiant(self):
        self.assertEqual(image_filename({"id": "retour-1"}), "retour-1.jpg")

    def test_identifiant_absent_est_rejete(self):
        with self.assertRaises(SupabaseError):
            image_filename({})

    def test_telecharge_chaque_image_dans_le_dossier_cible(self):
        reports = [
            {"id": "retour-1", "storage_path": "device-1/retour-1.jpg"},
            {"id": "retour-2", "storage_path": "device-1/retour-2.jpg"},
        ]
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "images"
            with patch("read_feedback_reports.download_storage_object", side_effect=[b"a", b"b"]) as download:
                self.assertEqual(download_images("https://example.test", "key", reports, output), 2)
            self.assertEqual((output / "retour-1.jpg").read_bytes(), b"a")
            self.assertEqual((output / "retour-2.jpg").read_bytes(), b"b")
            self.assertEqual(download.call_count, 2)

    def test_chemin_storage_absent_est_rejete(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(SupabaseError):
                download_images("https://example.test", "key", [{"id": "retour-1"}], Path(directory))


if __name__ == "__main__":
    unittest.main(verbosity=2)
