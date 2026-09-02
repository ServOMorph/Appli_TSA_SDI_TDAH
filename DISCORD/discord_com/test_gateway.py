"""Tests de gateway.py — unittest stdlib, aucun réseau."""
import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

import gateway


class GatewayTest(unittest.TestCase):
    def setUp(self):
        self._tmp = TemporaryDirectory()
        root = Path(self._tmp.name)
        self._patches = [
            mock.patch.object(gateway, "GATEWAY", root / "gateway"),
            mock.patch.object(gateway, "OUTBOX", root / "gateway" / "outbox"),
            mock.patch.object(gateway, "SENT", root / "gateway" / "outbox" / "sent"),
            mock.patch.object(gateway, "INBOX", root / "gateway" / "inbox"),
            mock.patch.object(gateway, "STATE", root / "gateway" / "state.json"),
            mock.patch.object(gateway, "CONV_LOG", root / "logs" / "conversation.jsonl"),
        ]
        for p in self._patches:
            p.start()

    def tearDown(self):
        for p in self._patches:
            p.stop()
        self._tmp.cleanup()

    # -- enqueue --------------------------------------------------------

    def test_enqueue_ecrit_un_fichier_valide(self):
        rid = gateway.enqueue("orchestrateur", "marie", "  bonjour  ", kind="question",
                              expect_reply=True)
        path = gateway.OUTBOX / f"{rid}.json"
        self.assertTrue(path.is_file())
        data = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(data["source"], "orchestrateur")
        self.assertEqual(data["to"], "marie")
        self.assertEqual(data["kind"], "question")
        self.assertEqual(data["body"], "bonjour")
        self.assertTrue(data["expect_reply"])
        self.assertFalse(data["hold"])

    def test_enqueue_refuse_cible_inconnue(self):
        with self.assertRaises(gateway.GatewayError):
            gateway.enqueue("orchestrateur", "toto", "x")

    def test_enqueue_refuse_corps_vide(self):
        with self.assertRaises(gateway.GatewayError):
            gateway.enqueue("orchestrateur", "channel", "   ")

    # -- curate --------------------------------------------------------

    def test_curate_marie_encadre_et_tague(self):
        out = gateway.curate("marie", "info", "Version 6.0 en ligne.")
        self.assertTrue(out.startswith(gateway.FRAME))
        self.assertTrue(out.endswith(gateway.FRAME))
        self.assertIn(f"<@{gateway.MARIE_USER_ID}>", out)
        self.assertIn("Version 6.0 en ligne.", out)

    def test_curate_channel_inchange(self):
        self.assertEqual(gateway.curate("channel", "info", "brut"), "brut")

    def test_curate_refuse_trop_long(self):
        with self.assertRaises(gateway.GatewayError):
            gateway.curate("channel", "info", "x" * 2001)

    # -- drain --------------------------------------------------------

    def test_drain_ordre_ancien_vers_recent_et_archive(self):
        gateway.enqueue("design", "channel", "premier")
        gateway.enqueue("orchestrateur", "channel", "second")
        envoyes = []
        res = gateway.drain(send_fn=lambda content, ids: envoyes.append(content) or "id123")
        self.assertEqual([r["status"] for r in res], ["sent", "sent"])
        self.assertEqual(envoyes, ["premier", "second"])
        self.assertEqual(list(gateway.OUTBOX.glob("*.json")), [])
        self.assertEqual(len(list(gateway.SENT.glob("*.json"))), 2)

    def test_drain_respecte_hold(self):
        rid = gateway.enqueue("design", "channel", "à retenir")
        path = gateway.OUTBOX / f"{rid}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["hold"] = True
        path.write_text(json.dumps(data), encoding="utf-8")
        res = gateway.drain(send_fn=lambda c, i: "x")
        self.assertEqual(res, [{"id": rid, "status": "held"}])
        self.assertTrue(path.is_file())

    def test_drain_dry_run_n_envoie_pas(self):
        gateway.enqueue("orchestrateur", "marie", "coucou")
        appels = []
        res = gateway.drain(send_fn=lambda c, i: appels.append(c) or "x", dry_run=True)
        self.assertEqual(appels, [])
        self.assertEqual(res[0]["status"], "dry-run")
        self.assertIn(gateway.FRAME, res[0]["content"])
        self.assertEqual(len(list(gateway.OUTBOX.glob("*.json"))), 1)

    def test_drain_expect_reply_enregistre_le_pending(self):
        gateway.enqueue("orchestrateur", "marie", "une question ?", kind="question",
                        expect_reply=True)
        gateway.drain(send_fn=lambda c, i: "mid")
        state = gateway.load_state()
        self.assertIsNotNone(state["pending_reply"])
        self.assertEqual(state["pending_reply"]["source"], "orchestrateur")

    def test_drain_journalise(self):
        gateway.enqueue("design", "channel", "trace-moi")
        gateway.drain(send_fn=lambda c, i: "mid")
        lignes = gateway.CONV_LOG.read_text(encoding="utf-8").strip().splitlines()
        entry = json.loads(lignes[-1])
        self.assertEqual(entry["role"], "GATEWAY")
        self.assertEqual(entry["author"], "gateway:design")
        self.assertEqual(entry["to"], "channel")

    # -- route_inbound ----------------------------------------------

    def test_route_inbound_vers_source_en_attente_et_purge(self):
        gateway.enqueue("orchestrateur", "marie", "q ?", kind="question", expect_reply=True)
        gateway.drain(send_fn=lambda c, i: "mid")
        r = gateway.route_inbound(42, "Marie", "toujours")
        self.assertEqual(r["routed_to"], "orchestrateur")
        dest = gateway.INBOX / "orchestrateur"
        fichiers = list(dest.glob("*.json"))
        self.assertEqual(len(fichiers), 1)
        self.assertEqual(json.loads(fichiers[0].read_text(encoding="utf-8"))["content"],
                         "toujours")
        self.assertIsNone(gateway.load_state()["pending_reply"])

    def test_route_inbound_sans_pending_va_dans_unrouted(self):
        r = gateway.route_inbound(1, "X", "au hasard")
        self.assertEqual(r["routed_to"], "unrouted")
        self.assertEqual(r["routing"], "aucune")
        self.assertEqual(len(list((gateway.INBOX / "unrouted").glob("*.json"))), 1)

    def test_route_inbound_tag_explicite(self):
        r = gateway.route_inbound(7, "Morpheus", "@design: revoir le bouton valider")
        self.assertEqual(r["routed_to"], "design")
        self.assertEqual(r["routing"], "tag")
        fichier = next((gateway.INBOX / "design").glob("*.json"))
        data = json.loads(fichier.read_text(encoding="utf-8"))
        self.assertEqual(data["content"], "revoir le bouton valider")
        self.assertEqual(data["raw_content"], "@design: revoir le bouton valider")

    def test_route_inbound_tag_prioritaire_sur_pending(self):
        gateway.enqueue("orchestrateur", "marie", "q ?", kind="question", expect_reply=True)
        gateway.drain(send_fn=lambda c, i: "mid")
        r = gateway.route_inbound(7, "Marie", "@design: autre sujet")
        self.assertEqual(r["routed_to"], "design")
        self.assertFalse(r["purged_pending"])
        self.assertIsNotNone(gateway.load_state()["pending_reply"])

    def test_route_inbound_tag_inconnu_retombe_sur_unrouted(self):
        r = gateway.route_inbound(7, "X", "@bidule: coucou")
        self.assertEqual(r["routed_to"], "unrouted")

    def test_route_inbound_heuristique(self):
        r = gateway.route_inbound(7, "X", "il faut revoir la maquette de l'accueil")
        self.assertEqual(r["routed_to"], "design")
        self.assertEqual(r["routing"], "heuristique")

    def test_poll_et_ack(self):
        gateway.enqueue("orchestrateur", "marie", "q ?", kind="question", expect_reply=True)
        gateway.drain(send_fn=lambda c, i: "mid")
        rid = gateway.route_inbound(42, "Marie", "ma reponse")["id"]
        en_attente = gateway.poll("orchestrateur")
        self.assertEqual(len(en_attente), 1)
        self.assertEqual(en_attente[0]["id"], rid)
        self.assertTrue(gateway.ack("orchestrateur", rid))
        self.assertEqual(gateway.poll("orchestrateur"), [])

    def test_ack_introuvable(self):
        self.assertFalse(gateway.ack("design", "inexistant"))


if __name__ == "__main__":
    unittest.main()
