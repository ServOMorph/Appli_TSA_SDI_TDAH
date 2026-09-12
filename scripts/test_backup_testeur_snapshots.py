"""Auto-tests de backup_testeur_snapshots.py (roadmap_integration_onboard.md, Phase 6).

Bibliotheque standard uniquement : `python scripts/test_backup_testeur_snapshots.py`.
Ne couvre que les fonctions pures — le chemin reseau reste verifie a la main
(cf. tests_manuels.md). Aucun acces aux vraies donnees des testeurs : les payloads
sont synthetiques.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from backup_testeur_snapshots import (  # noqa: E402
    UNKNOWN_TESTER_DIRNAME,
    archive_one,
    build_query,
    build_stamp,
    find_duplicate,
    payload_is_empty,
    payload_problem,
    plan_retention,
    resolve_tester_dirname,
    select_targets,
    serialize_payload,
)


def row(device_id: str, n_tests: int, n_tasks: int = 1,
        synced_at: str = "2026-09-01T18:37:52.246694+00:00",
        tester_code: str | None = None) -> dict:
    payload: dict = {
        "tasks": [{"id": f"t{i}"} for i in range(n_tasks)],
        "manual_test_results": [{"id": f"r{i}"} for i in range(n_tests)],
    }
    if tester_code is not None:
        payload["settings"] = {"tester_code": tester_code}
    return {
        "device_id": device_id,
        "synced_at": synced_at,
        "payload": payload,
    }


class SelectTargets(unittest.TestCase):
    def test_liste_vide(self):
        self.assertEqual(select_targets([]), [])

    def test_un_appareil_par_ligne_tout_retenu(self):
        rows = [row("aaaaaaaa", 0), row("bbbbbbbb", 49), row("cccccccc", 3)]
        self.assertEqual(
            [r["device_id"] for r in select_targets(rows)],
            ["aaaaaaaa", "bbbbbbbb", "cccccccc"],
        )

    def test_plusieurs_lignes_dun_appareil_retient_la_plus_recente(self):
        # Lignes triees synced_at decroissant par build_query : la premiere vue gagne.
        rows = [
            row("aaaaaaaa", 5, synced_at="2026-09-02T10:00:00+00:00"),
            row("aaaaaaaa", 5, synced_at="2026-09-01T10:00:00+00:00"),
            row("bbbbbbbb", 1, synced_at="2026-09-02T09:00:00+00:00"),
        ]
        cibles = select_targets(rows)
        self.assertEqual([r["device_id"] for r in cibles], ["aaaaaaaa", "bbbbbbbb"])
        self.assertEqual(cibles[0]["synced_at"], "2026-09-02T10:00:00+00:00")

    def test_ligne_sans_device_id_ignoree(self):
        rows = [{"payload": {"tasks": [{"id": "t"}]}}, row("bbbbbbbb", 1)]
        self.assertEqual([r["device_id"] for r in select_targets(rows)], ["bbbbbbbb"])


class ArchiveOne(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_deux_appareils_deux_archives_aucune_perte(self):
        # Sans tester_code, les deux appareils tombent dans le meme dossier _sans_code/.
        cibles = select_targets([
            row("aaaaaaaa", 3, synced_at="2026-09-02T10:00:00+00:00"),
            row("bbbbbbbb", 7, synced_at="2026-09-02T11:00:00+00:00"),
        ])
        ecrits = 0
        for r in cibles:
            code, did_write, skipped = archive_one(self.dir, r)
            self.assertEqual(code, 0)
            self.assertFalse(skipped)
            ecrits += int(did_write)
        self.assertEqual(ecrits, 2)
        noms = sorted(p.name for p in (self.dir / UNKNOWN_TESTER_DIRNAME).iterdir())
        self.assertEqual(len(noms), 2)
        self.assertTrue(any("aaaaaaaa" in n for n in noms))
        self.assertTrue(any("bbbbbbbb" in n for n in noms))

    def test_rejeu_aucune_reecriture(self):
        r = row("aaaaaaaa", 3)
        self.assertEqual(archive_one(self.dir, r), (0, True, False))
        tester_dir = self.dir / UNKNOWN_TESTER_DIRNAME
        avant = {p.name: p.read_text(encoding="utf-8") for p in tester_dir.iterdir()}
        self.assertEqual(archive_one(self.dir, r), (0, False, False))
        apres = {p.name: p.read_text(encoding="utf-8") for p in tester_dir.iterdir()}
        self.assertEqual(avant, apres)

    def test_payload_malforme_ninterrompt_pas_les_autres(self):
        cibles = [
            {"device_id": "aaaaaaaa", "synced_at": "2026-09-02T10:00:00+00:00", "payload": "corrompu"},
            row("bbbbbbbb", 4, synced_at="2026-09-02T11:00:00+00:00"),
        ]
        codes = [archive_one(self.dir, r) for r in cibles]
        self.assertEqual(codes[0], (1, False, False))
        self.assertEqual(codes[1], (0, True, False))
        noms = [p.name for p in (self.dir / UNKNOWN_TESTER_DIRNAME).iterdir()]
        self.assertEqual(len(noms), 1)
        self.assertIn("bbbbbbbb", noms[0])

    def test_appareil_vide_hors_ciblage_ignore_en_silence(self):
        # device_snapshots contient des dizaines d'appareils fantomes sans payload :
        # hors --device-id, ils ne doivent produire ni erreur ni exit 1.
        for payload in (None, {}, {"tasks": [], "manual_test_results": []}):
            r = {"device_id": "aaaaaaaa", "synced_at": "2026-09-02T10:00:00+00:00", "payload": payload}
            self.assertEqual(archive_one(self.dir, r), (0, False, True))
        self.assertEqual(list(self.dir.iterdir()), [])

    def test_appareil_vide_cible_explicitement_reste_une_erreur(self):
        r = {"device_id": "aaaaaaaa", "synced_at": "2026-09-02T10:00:00+00:00", "payload": None}
        self.assertEqual(archive_one(self.dir, r, targeted=True), (1, False, False))

    def test_device_id_cible_un_seul_appareil(self):
        # build_query restreint la requete ; select_targets sur les lignes d'un seul
        # appareil ne produit qu'une cible, donc une archive.
        self.assertIn("device_id=eq.aaaaaaaa", build_query("aaaaaaaa"))
        self.assertNotIn("device_id=eq", build_query(None))
        cibles = select_targets([
            row("aaaaaaaa", 3, synced_at="2026-09-02T10:00:00+00:00"),
            row("aaaaaaaa", 3, synced_at="2026-09-01T10:00:00+00:00"),
        ])
        self.assertEqual(len(cibles), 1)
        self.assertEqual(archive_one(self.dir, cibles[0]), (0, True, False))
        self.assertEqual(len(list((self.dir / UNKNOWN_TESTER_DIRNAME).iterdir())), 1)

    def test_deux_testeurs_jamais_melanges(self):
        # Demande explicite : chaque testeur a ses donnees cloisonnees, dans son propre dossier.
        cibles = [
            row("aaaaaaaa", 3, synced_at="2026-09-02T10:00:00+00:00", tester_code="marie"),
            row("bbbbbbbb", 5, synced_at="2026-09-02T11:00:00+00:00", tester_code="morpheus"),
        ]
        for r in cibles:
            self.assertEqual(archive_one(self.dir, r), (0, True, False))
        self.assertEqual({p.name for p in self.dir.iterdir()}, {"marie", "morpheus"})
        marie_noms = [p.name for p in (self.dir / "marie").iterdir()]
        morpheus_noms = [p.name for p in (self.dir / "morpheus").iterdir()]
        self.assertEqual(len(marie_noms), 1)
        self.assertEqual(len(morpheus_noms), 1)
        self.assertIn("aaaaaaaa", marie_noms[0])
        self.assertIn("bbbbbbbb", morpheus_noms[0])

    def test_tester_code_normalise_dans_le_nom_de_dossier(self):
        r = row("aaaaaaaa", 1, tester_code=" Morpheus ")
        self.assertEqual(archive_one(self.dir, r), (0, True, False))
        self.assertTrue((self.dir / "morpheus").exists())


class ResolveTesterDirname(unittest.TestCase):
    def test_code_present(self):
        self.assertEqual(resolve_tester_dirname({"settings": {"tester_code": "satine"}}), "satine")

    def test_code_normalise_minuscule_et_trim(self):
        self.assertEqual(resolve_tester_dirname({"settings": {"tester_code": " Marie "}}), "marie")

    def test_caracteres_speciaux_remplaces(self):
        self.assertEqual(resolve_tester_dirname({"settings": {"tester_code": "Marie B."}}), "marie-b")

    def test_code_arbitraire_fonctionne(self):
        # Gate de sortie de la roadmap : le depouillement fonctionne pour un testeur au nom
        # arbitraire, pas seulement les identites deja connues du projet.
        self.assertEqual(resolve_tester_dirname({"settings": {"tester_code": "alpha-01"}}), "alpha-01")

    def test_code_absent(self):
        self.assertEqual(resolve_tester_dirname({"settings": {}}), UNKNOWN_TESTER_DIRNAME)
        self.assertEqual(resolve_tester_dirname({}), UNKNOWN_TESTER_DIRNAME)

    def test_code_vide_apres_normalisation(self):
        self.assertEqual(resolve_tester_dirname({"settings": {"tester_code": "   "}}), UNKNOWN_TESTER_DIRNAME)
        self.assertEqual(resolve_tester_dirname({"settings": {"tester_code": "!!!"}}), UNKNOWN_TESTER_DIRNAME)

    def test_settings_absent_ou_mal_type(self):
        self.assertEqual(resolve_tester_dirname({"settings": None}), UNKNOWN_TESTER_DIRNAME)
        self.assertEqual(resolve_tester_dirname({"settings": "corrompu"}), UNKNOWN_TESTER_DIRNAME)


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


class PayloadIsEmpty(unittest.TestCase):
    def test_absent_ou_sans_donnees(self):
        for vide in (None, {}, {"tasks": [], "manual_test_results": []}, {"autre": 1}):
            self.assertTrue(payload_is_empty(vide))

    def test_malforme_nest_pas_vide(self):
        # Un payload du mauvais type est une anomalie a signaler, pas un appareil fantome.
        self.assertFalse(payload_is_empty("corrompu"))
        self.assertFalse(payload_is_empty([]))

    def test_avec_donnees(self):
        self.assertFalse(payload_is_empty({"tasks": [{"id": "t"}]}))
        self.assertFalse(payload_is_empty({"manual_test_results": [{"id": "r"}]}))


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

    def test_retention_tient_pour_trois_appareils(self):
        # Gate ONBOARD Phase 4 : la retention by_device s'applique inchangee pour N appareils.
        noms = []
        for device in ("aaaaaaaa", "bbbbbbbb", "cccccccc"):
            noms += self.noms(device, [f"202609{j:02d}-1200z" for j in range(1, 6)])
        keep, purge = plan_retention(noms, keep_last=2)
        for device in ("aaaaaaaa", "bbbbbbbb", "cccccccc"):
            self.assertEqual(len([n for n in purge if device in n]), 2)
            self.assertIn(f"snapshot-supabase-{device}-20260901-1200z.json",
                          [n for n in keep if device in n])

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
