"""Auto-tests de backup_marie_snapshot.py (roadmap_sav_snapshot_marie.md, Phase 1).

Bibliotheque standard uniquement : `python scripts/test_backup_marie_snapshot.py`.
Ne couvre que les fonctions pures — le chemin reseau reste verifie a la main
(cf. tests_manuels.md). Aucun acces aux vraies donnees de Marie : les payloads
sont synthetiques.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backup_marie_snapshot import (  # noqa: E402
    build_stamp,
    find_duplicate,
    payload_problem,
    plan_retention,
    select_target,
    serialize_payload,
)


def row(device_id: str, n_tests: int, n_tasks: int = 1,
        synced_at: str = "2026-09-01T18:37:52.246694+00:00") -> dict:
    return {
        "device_id": device_id,
        "synced_at": synced_at,
        "payload": {
            "tasks": [{"id": f"t{i}"} for i in range(n_tasks)],
            "manual_test_results": [{"id": f"r{i}"} for i in range(n_tests)],
        },
    }


class SelectTarget(unittest.TestCase):
    def test_liste_vide(self):
        self.assertIsNone(select_target([]))

    def test_retient_le_plus_de_resultats_de_tests(self):
        rows = [row("aaaaaaaa", 0), row("bbbbbbbb", 49), row("cccccccc", 3)]
        self.assertEqual(select_target(rows)["device_id"], "bbbbbbbb")

    def test_payload_absent_compte_pour_zero(self):
        rows = [{"device_id": "aaaaaaaa", "payload": None}, row("bbbbbbbb", 1)]
        self.assertEqual(select_target(rows)["device_id"], "bbbbbbbb")

    def test_egalite_retient_le_premier(self):
        # Comportement de max() : pas de tie-break interne, la premiere ligne gagne.
        rows = [row("aaaaaaaa", 5), row("bbbbbbbb", 5)]
        self.assertEqual(select_target(rows)["device_id"], "aaaaaaaa")

    def test_egalite_departagee_par_le_plus_recent(self):
        # La requete PostgREST renvoie desormais les lignes triees par synced_at
        # decroissant (&order=synced_at.desc) : a egalite de manual_test_results,
        # max() retient la premiere, donc la plus recente.
        rows = [
            row("aaaaaaaa", 5, synced_at="2026-09-02T10:00:00+00:00"),
            row("bbbbbbbb", 5, synced_at="2026-09-01T10:00:00+00:00"),
        ]
        self.assertEqual(select_target(rows)["device_id"], "aaaaaaaa")


class PayloadProblem(unittest.TestCase):
    def test_payload_valide(self):
        self.assertIsNone(payload_problem({"tasks": [{"id": "t"}]}))
        self.assertIsNone(payload_problem({"manual_test_results": [{"id": "r"}]}))

    def test_payload_absent(self):
        self.assertEqual(payload_problem(None), "payload absent")

    def test_payload_du_mauvais_type(self):
        self.assertIn("list", payload_problem([]))

    def test_payload_sans_donnees_exploitables(self):
        for vide in ({}, {"tasks": [], "manual_test_results": []}, {"autre": 1}):
            self.assertIsNotNone(payload_problem(vide))


class BuildStamp(unittest.TestCase):
    def test_format_utc_explicite(self):
        # Format issu de la Phase 2 : datetime.fromisoformat, suffixe z = UTC,
        # minutes non dupliquees.
        self.assertEqual(build_stamp("2026-09-01T18:37:52.246694+00:00"), "20260901-1837z")

    def test_formes_de_synced_at(self):
        # Insensible a la presence de microsecondes et a la notation Z / +00:00 ;
        # un decalage non nul est ramene en UTC avant formatage.
        for valeur in (
            "2026-09-01T18:37:52+00:00",
            "2026-09-01T18:37:52.246694+00:00",
            "2026-09-01T18:37:52Z",
            "2026-09-01T20:37:52.246694+02:00",
        ):
            self.assertEqual(build_stamp(valeur), "20260901-1837z")

    def test_stamp_utilisable_dans_un_nom_de_fichier(self):
        stamp = build_stamp("2026-09-01T15:26:00+00:00")
        self.assertNotIn(":", stamp)
        self.assertNotIn("/", stamp)


class FindDuplicate(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        self.content = serialize_payload({"tasks": [{"id": "t1"}], "manual_test_results": []})

    def ecrire(self, nom: str, contenu: str) -> Path:
        path = self.dir / nom
        path.write_text(contenu, encoding="utf-8")
        return path

    def test_dossier_absent(self):
        self.assertIsNone(find_duplicate(self.dir / "nexiste_pas", "192f2411", self.content))

    def test_aucune_sauvegarde(self):
        self.assertIsNone(find_duplicate(self.dir, "192f2411", self.content))

    def test_detecte_un_contenu_identique(self):
        attendu = self.ecrire("snapshot-supabase-192f2411-2026-09-01-1641h41.json", self.content)
        self.assertEqual(find_duplicate(self.dir, "192f2411", self.content), attendu)

    def test_ignore_un_contenu_different(self):
        autre = serialize_payload({"tasks": [{"id": "t2"}], "manual_test_results": []})
        self.ecrire("snapshot-supabase-192f2411-2026-09-01-1641h41.json", autre)
        self.assertIsNone(find_duplicate(self.dir, "192f2411", self.content))

    def test_ignore_un_autre_appareil(self):
        self.ecrire("snapshot-supabase-b310e7ed-2026-09-01-1641h41.json", self.content)
        self.assertIsNone(find_duplicate(self.dir, "192f2411", self.content))

    def test_ignore_les_exports_historiques(self):
        self.ecrire("export-audhd-2026-08-30-20h14.json", self.content)
        self.assertIsNone(find_duplicate(self.dir, "192f2411", self.content))

    def test_meme_taille_contenu_different(self):
        # Deux payloads de meme longueur serialisee : la comparaison ne doit pas
        # s'arreter au filtre de taille.
        autre = self.content.replace("t1", "t9")
        self.assertEqual(len(autre), len(self.content))
        self.ecrire("snapshot-supabase-192f2411-2026-09-01-1641h41.json", autre)
        self.assertIsNone(find_duplicate(self.dir, "192f2411", self.content))

    def test_contenu_non_ascii(self):
        contenu = serialize_payload({"tasks": [{"title": "Réveil à 8 h — café"}]})
        attendu = self.ecrire("snapshot-supabase-192f2411-2026-09-01-1641h41.json", contenu)
        self.assertEqual(find_duplicate(self.dir, "192f2411", contenu), attendu)


class PlanRetention(unittest.TestCase):
    def noms(self, device: str, stamps: list[str]) -> list[str]:
        return [f"snapshot-supabase-{device}-{s}.json" for s in stamps]

    def test_sous_le_seuil_tout_conserve(self):
        noms = self.noms("192f2411", ["20260901-1000z", "20260902-1000z"])
        keep, purge = plan_retention(noms, keep_last=30)
        self.assertEqual(purge, [])
        self.assertEqual(sorted(keep), sorted(noms))

    def test_au_dela_du_seuil_garde_les_plus_recents_et_le_premier_du_mois(self):
        stamps = [f"202609{j:02d}-1200z" for j in range(1, 11)]
        keep, purge = plan_retention(self.noms("192f2411", stamps), keep_last=3)
        self.assertIn("snapshot-supabase-192f2411-20260910-1200z.json", keep)
        self.assertIn("snapshot-supabase-192f2411-20260908-1200z.json", keep)
        self.assertIn("snapshot-supabase-192f2411-20260901-1200z.json", keep)
        self.assertNotIn("snapshot-supabase-192f2411-20260905-1200z.json", keep)
        self.assertEqual(len(purge), 6)

    def test_premier_de_chaque_mois_conserve(self):
        stamps = ["20260701-0900z", "20260715-0900z", "20260801-0900z",
                  "20260902-0900z", "20260903-0900z", "20260904-0900z"]
        keep, purge = plan_retention(self.noms("192f2411", stamps), keep_last=2)
        for garde in ("20260701-0900z", "20260801-0900z", "20260902-0900z",
                      "20260903-0900z", "20260904-0900z"):
            self.assertIn(f"snapshot-supabase-192f2411-{garde}.json", keep)
        self.assertEqual(purge, ["snapshot-supabase-192f2411-20260715-0900z.json"])

    def test_exports_historiques_jamais_purges(self):
        noms = ["export-audhd-2026-08-30-20h14.json"] + self.noms(
            "192f2411", [f"202609{j:02d}-1200z" for j in range(1, 11)]
        )
        keep, purge = plan_retention(noms, keep_last=1)
        self.assertIn("export-audhd-2026-08-30-20h14.json", keep)
        self.assertNotIn("export-audhd-2026-08-30-20h14.json", purge)

    def test_fichier_etranger_conserve(self):
        keep, purge = plan_retention(
            ["notes.txt", "snapshot-supabase-192f2411-20260901-1200z.json"], keep_last=1
        )
        self.assertIn("notes.txt", keep)
        self.assertEqual(purge, [])

    def test_appareils_isoles(self):
        noms = self.noms("aaaaaaaa", [f"202609{j:02d}-1200z" for j in range(1, 6)]) + \
               self.noms("bbbbbbbb", [f"202609{j:02d}-1200z" for j in range(1, 6)])
        keep, purge = plan_retention(noms, keep_last=2)
        self.assertEqual(len(purge), 4)
        self.assertTrue(any("aaaaaaaa" in n for n in purge))
        self.assertTrue(any("bbbbbbbb" in n for n in purge))

    def test_ancien_et_nouveau_format_ordonnes(self):
        noms = [
            "snapshot-supabase-192f2411-2026-09-01-1526h26.json",
            "snapshot-supabase-192f2411-2026-09-01-1837h37.json",
            "snapshot-supabase-192f2411-20260901-2343z.json",
        ]
        keep, purge = plan_retention(noms, keep_last=1)
        self.assertIn("snapshot-supabase-192f2411-20260901-2343z.json", keep)
        self.assertIn("snapshot-supabase-192f2411-2026-09-01-1526h26.json", keep)
        self.assertEqual(purge, ["snapshot-supabase-192f2411-2026-09-01-1837h37.json"])

    def test_stamp_illisible_conserve(self):
        noms = ["snapshot-supabase-192f2411-sansdate.json"]
        keep, purge = plan_retention(noms, keep_last=1)
        self.assertEqual(keep, noms)
        self.assertEqual(purge, [])


class SerializePayload(unittest.TestCase):
    def test_stable_entre_deux_appels(self):
        payload = {"tasks": [{"id": "t1"}], "manual_test_results": [{"id": "r1"}]}
        self.assertEqual(serialize_payload(payload), serialize_payload(payload))

    def test_conserve_les_accents_en_clair(self):
        self.assertIn("é", serialize_payload({"tasks": [{"title": "été"}]}))

    def test_relisible_en_json(self):
        payload = {"tasks": [{"id": "t1"}]}
        self.assertEqual(json.loads(serialize_payload(payload)), payload)


if __name__ == "__main__":
    unittest.main(verbosity=2)
