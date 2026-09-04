"""Tests de gateway.py — unittest stdlib, aucun réseau."""
import json
import threading
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

import gateway

REGISTRE_TEST = {
    "Appli_TSA_SDI_TDAH": {
        "alias": "orchestrateur",
        "path": ".",
        "keywords": ["deploy", "version", "roadmap", "commit", "changelog", "netlify", "bundle"],
    },
    "design": {
        "path": "DESIGN",
        "keywords": ["design", "maquette", "ui", "interface", "couleur", "bouton", "layout"],
    },
    "discord": {
        "path": "DISCORD",
        "keywords": ["discord", "gateway", "bot", "outbox", "inbox"],
    },
}


class GatewayTest(unittest.TestCase):
    def setUp(self):
        self._tmp = TemporaryDirectory()
        root = Path(self._tmp.name)
        gw = root / "gateway"
        self._patches = [
            mock.patch.object(gateway, "GATEWAY", gw),
            mock.patch.object(gateway, "OUTBOX", gw / "outbox"),
            mock.patch.object(gateway, "SENT", gw / "outbox" / "sent"),
            mock.patch.object(gateway, "INBOX", gw / "inbox"),
            mock.patch.object(gateway, "STATE", gw / "state.json"),
            mock.patch.object(gateway, "AGENTS_FILE", gw / "agents.json"),
            mock.patch.object(gateway, "LOCK", gw / "state.lock"),
            mock.patch.object(gateway, "DRAIN_LOCK", gw / "drain.lock"),
            mock.patch.object(gateway, "CONV_LOG", root / "logs" / "conversation.jsonl"),
        ]
        for p in self._patches:
            p.start()
        gw.mkdir(parents=True, exist_ok=True)
        (gw / "agents.json").write_text(json.dumps(REGISTRE_TEST), encoding="utf-8")

    def tearDown(self):
        for p in self._patches:
            p.stop()
        self._tmp.cleanup()

    def _envoyer_question(self, source="orchestrateur", to="marie"):
        """enqueue + approve + drain d'une question avec réponse attendue. Retourne l'id."""
        rid = gateway.enqueue(source, to, "q ?", kind="question", expect_reply=True)
        gateway.approve(rid)
        gateway.drain(send_fn=lambda c, i: "mid")
        return rid

    def _approuver_tout(self):
        for it in gateway.list_outbox():
            gateway.approve(it["id"])

    def _demande(self, req_id: str) -> dict:
        return json.loads((gateway.OUTBOX / f"{req_id}.json").read_text(encoding="utf-8"))

    # -- registre d'agents ---------------------------------------------

    def test_agent_names_depuis_le_registre(self):
        self.assertEqual(gateway.agent_names(), ["orchestrateur", "design", "discord"])

    def test_resolve_agent_par_zone_alias_et_casse(self):
        self.assertEqual(gateway.resolve_agent("Appli_TSA_SDI_TDAH"), "orchestrateur")
        self.assertEqual(gateway.resolve_agent("appli_tsa_sdi_tdah"), "orchestrateur")
        self.assertEqual(gateway.resolve_agent("orchestrateur"), "orchestrateur")
        self.assertEqual(gateway.resolve_agent("DESIGN"), "design")
        self.assertIsNone(gateway.resolve_agent("bidule"))
        self.assertIsNone(gateway.resolve_agent(""))

    def test_registre_absent_ne_casse_pas(self):
        gateway.AGENTS_FILE.unlink()
        self.assertEqual(gateway.load_registry(), {})
        self.assertIsNone(gateway.resolve_agent("design"))
        self.assertEqual(gateway.route_inbound(1, "X", "maquette")["routed_to"], "unrouted")

    def test_poll_et_ack_acceptent_le_nom_de_zone(self):
        self._envoyer_question()
        rid = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "ma reponse")["id"]
        self.assertEqual(len(gateway.poll("Appli_TSA_SDI_TDAH")), 1)
        self.assertTrue(gateway.ack("Appli_TSA_SDI_TDAH", rid))
        self.assertEqual(gateway.poll("orchestrateur"), [])

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
        self.assertEqual(data["status"], "pending")

    def test_enqueue_refuse_cible_inconnue(self):
        with self.assertRaises(gateway.GatewayError):
            gateway.enqueue("orchestrateur", "toto", "x")

    def test_enqueue_refuse_corps_vide(self):
        with self.assertRaises(gateway.GatewayError):
            gateway.enqueue("orchestrateur", "channel", "   ")

    def test_enqueue_ne_laisse_pas_de_fichier_temporaire(self):
        gateway.enqueue("orchestrateur", "channel", "x")
        self.assertEqual(list(gateway.OUTBOX.glob("*.tmp")), [])

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
        self._approuver_tout()
        envoyes = []
        res = gateway.drain(send_fn=lambda content, ids: envoyes.append(content) or "id123")
        self.assertEqual([r["status"] for r in res], ["sent", "sent"])
        self.assertEqual(envoyes, ["premier", "second"])
        self.assertEqual(list(gateway.OUTBOX.glob("*.json")), [])
        self.assertEqual(len(list(gateway.SENT.glob("*.json"))), 2)

    def test_drain_dry_run_n_envoie_pas(self):
        rid = gateway.enqueue("orchestrateur", "marie", "coucou")
        gateway.approve(rid)
        appels = []
        res = gateway.drain(send_fn=lambda c, i: appels.append(c) or "x", dry_run=True)
        self.assertEqual(appels, [])
        self.assertEqual(res[0]["status"], "dry-run")
        self.assertIn(gateway.FRAME, res[0]["content"])
        self.assertEqual(len(list(gateway.OUTBOX.glob("*.json"))), 1)

    def test_drain_dry_run_rend_aussi_les_non_approuvees(self):
        gateway.enqueue("orchestrateur", "marie", "pas encore approuvé")
        res = gateway.drain(send_fn=lambda c, i: "x", dry_run=True)
        self.assertEqual(res[0]["status"], "dry-run")
        self.assertEqual(res[0]["outbox_status"], "pending")

    def test_drain_journalise(self):
        rid = gateway.enqueue("design", "channel", "trace-moi")
        gateway.approve(rid)
        gateway.drain(send_fn=lambda c, i: "mid")
        lignes = gateway.CONV_LOG.read_text(encoding="utf-8").strip().splitlines()
        entry = json.loads(lignes[-1])
        self.assertEqual(entry["role"], "GATEWAY")
        self.assertEqual(entry["author"], "gateway:design")
        self.assertEqual(entry["to"], "channel")

    # -- gardien de sortie : statuts ------------------------------------

    def test_drain_n_envoie_que_les_approuvees(self):
        rid = gateway.enqueue("design", "channel", "en attente de jugement")
        appels = []
        res = gateway.drain(send_fn=lambda c, i: appels.append(c) or "x")
        self.assertEqual(appels, [])
        self.assertEqual(res, [{"id": rid, "status": "ignoré", "outbox_status": "pending"}])
        self.assertTrue((gateway.OUTBOX / f"{rid}.json").is_file())

    def test_drain_ignore_les_held(self):
        rid = gateway.enqueue("design", "channel", "à retenir")
        gateway.hold(rid, "question déjà en attente")
        res = gateway.drain(send_fn=lambda c, i: "x")
        self.assertEqual(res, [{"id": rid, "status": "ignoré", "outbox_status": "held"}])
        self.assertEqual(self._demande(rid)["status_reason"], "question déjà en attente")

    def test_drain_compat_ancien_hold_booleen(self):
        rid = gateway.enqueue("design", "channel", "ancien format")
        path = gateway.OUTBOX / f"{rid}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        del data["status"]
        data["hold"] = True
        path.write_text(json.dumps(data), encoding="utf-8")
        res = gateway.drain(send_fn=lambda c, i: "x")
        self.assertEqual(res[0]["outbox_status"], "held")

    def test_approve_puis_drain_envoie(self):
        rid = gateway.enqueue("design", "channel", "prêt")
        self.assertEqual(gateway.approve(rid)["status"], "approved")
        res = gateway.drain(send_fn=lambda c, i: "mid")
        self.assertEqual(res[0]["status"], "sent")

    def test_approve_depuis_held(self):
        rid = gateway.enqueue("design", "channel", "reporté puis relâché")
        gateway.hold(rid)
        gateway.approve(rid)
        self.assertEqual(gateway.drain(send_fn=lambda c, i: "mid")[0]["status"], "sent")

    def test_approve_refuse_une_demande_inconnue(self):
        with self.assertRaises(gateway.GatewayError):
            gateway.approve("20260101T000000_000000")

    def test_list_outbox_expose_le_statut(self):
        rid = gateway.enqueue("design", "channel", "x")
        self.assertEqual(gateway.list_outbox()[0]["status"], "pending")
        gateway.approve(rid)
        self.assertEqual(gateway.list_outbox()[0]["status"], "approved")

    # -- gardien de sortie : bounce -------------------------------------

    def test_bounce_ecrit_dans_inbox_source_avec_motif(self):
        rid = gateway.enqueue("orchestrateur", "marie", "Version <X.Y> en ligne.")
        res = gateway.bounce(rid, "fond non figé")
        self.assertEqual(res["routed_to"], "orchestrateur")
        msg = gateway.poll("orchestrateur")[0]
        self.assertEqual(msg["kind"], "bounce")
        self.assertEqual(msg["reason"], "fond non figé")
        self.assertEqual(msg["original_id"], rid)
        self.assertEqual(msg["original_body"], "Version <X.Y> en ligne.")
        self.assertIn("fond non figé", msg["content"])

    def test_bounce_retire_de_l_outbox_et_n_envoie_rien(self):
        rid = gateway.enqueue("orchestrateur", "marie", "à revoir")
        gateway.bounce(rid, "doublon")
        self.assertFalse((gateway.OUTBOX / f"{rid}.json").is_file())
        appels = []
        gateway.drain(send_fn=lambda c, i: appels.append(c) or "x")
        self.assertEqual(appels, [])
        self.assertEqual(list(gateway.SENT.glob("*.json")), [])

    def test_bounce_refuse_un_motif_vide(self):
        rid = gateway.enqueue("orchestrateur", "marie", "x")
        with self.assertRaises(gateway.GatewayError):
            gateway.bounce(rid, "   ")
        self.assertTrue((gateway.OUTBOX / f"{rid}.json").is_file())

    def test_bounce_resout_le_nom_de_zone_de_la_source(self):
        rid = gateway.enqueue("Appli_TSA_SDI_TDAH", "marie", "x")
        self.assertEqual(gateway.bounce(rid, "hors périmètre")["routed_to"], "orchestrateur")

    # -- gardien de sortie : merge --------------------------------------

    def test_merge_fusionne_dans_la_plus_ancienne(self):
        r1 = gateway.enqueue("orchestrateur", "channel", "premier point")
        r2 = gateway.enqueue("design", "channel", "second point")
        res = gateway.merge([r2, r1])
        self.assertEqual(res["id"], r1)
        self.assertEqual(res["merged"], [r2])
        self.assertEqual(self._demande(r1)["body"], "premier point\n\nsecond point")
        self.assertFalse((gateway.OUTBOX / f"{r2}.json").is_file())

    def test_merge_conserve_expect_reply(self):
        r1 = gateway.enqueue("orchestrateur", "marie", "info")
        r2 = gateway.enqueue("orchestrateur", "marie", "question ?", kind="question",
                             expect_reply=True)
        gateway.merge([r1, r2])
        self.assertTrue(self._demande(r1)["expect_reply"])

    def test_merge_refuse_des_destinataires_differents(self):
        r1 = gateway.enqueue("orchestrateur", "marie", "a")
        r2 = gateway.enqueue("orchestrateur", "channel", "b")
        with self.assertRaises(gateway.GatewayError):
            gateway.merge([r1, r2])
        self.assertTrue((gateway.OUTBOX / f"{r2}.json").is_file())

    def test_merge_refuse_moins_de_deux_ids(self):
        r1 = gateway.enqueue("orchestrateur", "marie", "a")
        with self.assertRaises(gateway.GatewayError):
            gateway.merge([r1, r1])

    # -- gardien de sortie : échec d'envoi ------------------------------

    def _envoi_qui_echoue(self, sur: str):
        def send(content, ids):
            if sur in content:
                raise RuntimeError("503 Discord indisponible")
            return "mid"
        return send

    def test_echec_envoi_passe_en_failed_et_continue_la_boucle(self):
        r1 = gateway.enqueue("design", "channel", "casse")
        r2 = gateway.enqueue("design", "channel", "passe")
        self._approuver_tout()

        res = gateway.drain(send_fn=self._envoi_qui_echoue("casse"))

        self.assertEqual([r["status"] for r in res], ["failed", "sent"])
        self.assertEqual(self._demande(r1)["status"], "failed")
        self.assertIn("503", self._demande(r1)["status_reason"])
        self.assertFalse((gateway.OUTBOX / f"{r2}.json").is_file())

    def test_echec_envoi_depose_une_dead_letter(self):
        gateway.enqueue("orchestrateur", "channel", "casse")
        self._approuver_tout()
        gateway.drain(send_fn=self._envoi_qui_echoue("casse"))
        alertes = gateway.poll("discord")
        self.assertEqual(len(alertes), 1)
        self.assertEqual(alertes[0]["kind"], "dead-letter")
        self.assertEqual(alertes[0]["original_source"], "orchestrateur")
        self.assertIn("503", alertes[0]["reason"])

    def test_failed_peut_etre_re_approuve_et_reparti(self):
        rid = gateway.enqueue("design", "channel", "casse")
        self._approuver_tout()
        gateway.drain(send_fn=self._envoi_qui_echoue("casse"))

        gateway.approve(rid)
        res = gateway.drain(send_fn=lambda c, i: "mid")

        self.assertEqual(res[0]["status"], "sent")
        self.assertFalse((gateway.OUTBOX / f"{rid}.json").is_file())

    def test_echec_envoi_n_enregistre_pas_de_pending_reply(self):
        gateway.enqueue("orchestrateur", "marie", "casse ?", kind="question", expect_reply=True)
        self._approuver_tout()
        gateway.drain(send_fn=self._envoi_qui_echoue("casse"))
        self.assertEqual(gateway.load_state()["pending_replies"], [])

    def test_drain_libere_son_verrou(self):
        rid = gateway.enqueue("design", "channel", "x")
        gateway.approve(rid)
        gateway.drain(send_fn=lambda c, i: "mid")
        self.assertFalse(gateway.DRAIN_LOCK.exists())

    # -- pending_replies ------------------------------------------------

    def test_drain_expect_reply_enregistre_le_pending(self):
        rid = self._envoyer_question()
        attentes = gateway.load_state()["pending_replies"]
        self.assertEqual(len(attentes), 1)
        self.assertEqual(attentes[0]["source"], "orchestrateur")
        self.assertEqual(attentes[0]["to"], "marie")
        self.assertEqual(attentes[0]["request_id"], rid)

    def test_deux_questions_concurrentes_ne_s_ecrasent_pas(self):
        r1 = self._envoyer_question(source="orchestrateur", to="marie")
        r2 = self._envoyer_question(source="design", to="morpheus")
        ids = [p["request_id"] for p in gateway.load_state()["pending_replies"]]
        self.assertEqual(sorted(ids), sorted([r1, r2]))

    def test_reponse_apparie_la_plus_recente_pour_la_cible_et_laisse_les_autres(self):
        vieux = self._envoyer_question(source="design", to="marie")
        recent = self._envoyer_question(source="orchestrateur", to="marie")
        autre = self._envoyer_question(source="design", to="morpheus")

        r = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "voila ma reponse")

        self.assertEqual(r["routed_to"], "orchestrateur")
        self.assertEqual(r["routing"], "pending")
        restants = [p["request_id"] for p in gateway.load_state()["pending_replies"]]
        self.assertNotIn(recent, restants)
        self.assertIn(vieux, restants)
        self.assertIn(autre, restants)

    def test_reponse_suivante_apparie_le_pending_restant(self):
        vieux = self._envoyer_question(source="design", to="marie")
        self._envoyer_question(source="orchestrateur", to="marie")

        premiere = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "premiere")
        self.assertEqual(premiere["routed_to"], "orchestrateur")
        self.assertEqual([p["request_id"] for p in gateway.load_state()["pending_replies"]],
                         [vieux])

        seconde = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "seconde")

        self.assertEqual(seconde["routed_to"], "design")
        self.assertEqual(gateway.load_state()["pending_replies"], [])
        self.assertEqual(len(gateway.poll("design")), 1)

    def test_auteur_inconnu_ne_consomme_pas_le_pending_de_marie(self):
        self._envoyer_question(to="marie")
        r = gateway.route_inbound(999999, "Quelqu'un", "un mot au hasard")
        self.assertNotEqual(r["routing"], "pending")
        self.assertEqual(len(gateway.load_state()["pending_replies"]), 1)

    def test_migration_ancien_pending_reply_objet(self):
        gateway.STATE.parent.mkdir(parents=True, exist_ok=True)
        gateway.STATE.write_text(json.dumps({"pending_reply": {
            "source": "orchestrateur", "to": "marie",
            "since": "2026-09-03T15:26:09+00:00", "request_id": "20260903T042325_687674",
        }}), encoding="utf-8")

        state = gateway.load_state()

        self.assertNotIn("pending_reply", state)
        self.assertEqual(len(state["pending_replies"]), 1)
        self.assertEqual(state["pending_replies"][0]["request_id"], "20260903T042325_687674")
        r = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "la capture")
        self.assertEqual(r["routed_to"], "orchestrateur")
        self.assertEqual(gateway.load_state()["pending_replies"], [])

    def test_migration_ancien_pending_reply_null(self):
        gateway.STATE.parent.mkdir(parents=True, exist_ok=True)
        gateway.STATE.write_text(json.dumps({"pending_reply": None}), encoding="utf-8")
        self.assertEqual(gateway.load_state(), {"pending_replies": []})

    # -- concurrence ----------------------------------------------------

    def test_writers_concurrents_ne_corrompent_pas_state(self):
        n = 12
        erreurs = []

        def writer(i):
            try:
                gateway.add_pending_reply(f"agent{i}", "marie", f"req{i}")
            except Exception as e:  # noqa: BLE001 — remonté dans l'assertion
                erreurs.append(e)

        threads = [threading.Thread(target=writer, args=(i,)) for i in range(n)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(erreurs, [])
        state = json.loads(gateway.STATE.read_text(encoding="utf-8"))
        self.assertEqual(len(state["pending_replies"]), n)
        self.assertEqual(sorted(p["request_id"] for p in state["pending_replies"]),
                         sorted(f"req{i}" for i in range(n)))

    def test_verrou_libere_apres_usage(self):
        gateway.add_pending_reply("orchestrateur", "marie", "req")
        self.assertFalse(gateway.LOCK.exists())

    # -- route_inbound ----------------------------------------------

    def test_route_inbound_vers_source_en_attente_et_purge(self):
        self._envoyer_question()
        r = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "toujours")
        self.assertEqual(r["routed_to"], "orchestrateur")
        self.assertTrue(r["purged_pending"])
        fichiers = list((gateway.INBOX / "orchestrateur").glob("*.json"))
        self.assertEqual(len(fichiers), 1)
        self.assertEqual(json.loads(fichiers[0].read_text(encoding="utf-8"))["content"],
                         "toujours")
        self.assertEqual(gateway.load_state()["pending_replies"], [])

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

    def test_route_inbound_tag_par_nom_de_zone(self):
        r = gateway.route_inbound(7, "Morpheus", "@Appli_TSA_SDI_TDAH: relance le deploy")
        self.assertEqual(r["routed_to"], "orchestrateur")
        self.assertEqual(r["routing"], "tag")

    def test_route_inbound_tag_prioritaire_sur_pending(self):
        self._envoyer_question()
        r = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "@design: autre sujet")
        self.assertEqual(r["routed_to"], "design")
        self.assertFalse(r["purged_pending"])
        self.assertEqual(len(gateway.load_state()["pending_replies"]), 1)

    def test_route_inbound_tag_inconnu_retombe_sur_unrouted(self):
        r = gateway.route_inbound(7, "X", "@bidule: coucou")
        self.assertEqual(r["routed_to"], "unrouted")

    def test_route_inbound_heuristique(self):
        r = gateway.route_inbound(7, "X", "il faut revoir la maquette de l'accueil")
        self.assertEqual(r["routed_to"], "design")
        self.assertEqual(r["routing"], "heuristique")

    def test_heuristique_respecte_les_frontieres_de_mot(self):
        r = gateway.route_inbound(7, "X", "le bouton est trop petit")
        self.assertEqual(r["routed_to"], "design")

    def test_heuristique_departage_par_nombre_de_mots_cles(self):
        r = gateway.route_inbound(7, "X", "la gateway du bot discord ne route plus l'inbox")
        self.assertEqual(r["routed_to"], "discord")

    def test_route_inbound_conserve_les_pieces_jointes(self):
        pieces = [{"filename": "parametres.png", "url": "https://cdn/1.png",
                   "content_type": "image/png"}]
        gateway.route_inbound(7, "X", "@design: voici", pieces)
        data = json.loads(next((gateway.INBOX / "design").glob("*.json"))
                          .read_text(encoding="utf-8"))
        self.assertEqual(data["attachments"], pieces)

    def test_reponse_image_seule_est_appariee_au_pending(self):
        self._envoyer_question(to="marie")
        pieces = [{"filename": "capture.png", "url": "https://cdn/c.png",
                   "content_type": "image/png"}]

        r = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "", pieces)

        self.assertEqual(r["routed_to"], "orchestrateur")
        self.assertEqual(r["routing"], "pending")
        data = gateway.poll("orchestrateur")[0]
        self.assertEqual(data["content"], "")
        self.assertEqual(data["attachments"], pieces)

    def test_attachments_absents_donnent_une_liste_vide(self):
        gateway.route_inbound(7, "X", "@design: rien joint")
        data = json.loads(next((gateway.INBOX / "design").glob("*.json"))
                          .read_text(encoding="utf-8"))
        self.assertEqual(data["attachments"], [])

    def test_poll_et_ack(self):
        self._envoyer_question()
        rid = gateway.route_inbound(gateway.MARIE_USER_ID, "Marie", "ma reponse")["id"]
        en_attente = gateway.poll("orchestrateur")
        self.assertEqual(len(en_attente), 1)
        self.assertEqual(en_attente[0]["id"], rid)
        self.assertTrue(gateway.ack("orchestrateur", rid))
        self.assertEqual(gateway.poll("orchestrateur"), [])

    def test_ack_introuvable(self):
        self.assertFalse(gateway.ack("design", "inexistant"))

    # -- poll --zone / --format hook (livraison en direct, Phase 3) -----

    def test_rendu_hook_inbox_vide_donne_RIEN(self):
        self.assertEqual(gateway.rendu_hook([]), "RIEN")

    def test_rendu_hook_liste_compacte(self):
        gateway.route_inbound(7, "Morpheus", "@design: revoir le bouton\nligne 2 ignorée")
        rendu = gateway.rendu_hook(gateway.poll("design"))
        lignes = rendu.splitlines()
        self.assertEqual(len(lignes), 1)
        self.assertIn(" — Morpheus — revoir le bouton", lignes[0])
        self.assertNotIn("ligne 2", rendu)

    def test_rendu_hook_piece_jointe_sans_texte(self):
        pieces = [{"filename": "capture.png", "url": "https://cdn/c.png",
                   "content_type": "image/png"}]
        gateway.route_inbound(7, "X", "@design:", pieces)
        rendu = gateway.rendu_hook(gateway.poll("design"))
        self.assertIn("[1 pièce(s) jointe(s)] capture.png", rendu)

    def test_poll_resout_le_nom_de_zone(self):
        gateway.route_inbound(7, "X", "@Appli_TSA_SDI_TDAH: relance")
        self.assertEqual(len(gateway.poll("Appli_TSA_SDI_TDAH")), 1)
        self.assertEqual(len(gateway.poll("orchestrateur")), 1)

    def test_poll_zone_hors_registre_donne_liste_vide(self):
        self.assertEqual(gateway.poll("zone_inexistante"), [])
        self.assertEqual(gateway.rendu_hook(gateway.poll("zone_inexistante")), "RIEN")

    def _run_cli(self, *argv):
        import contextlib
        import io
        buf = io.StringIO()
        code = 0
        with mock.patch.object(gateway.sys, "argv", ["gateway.py", *argv]):
            with contextlib.redirect_stdout(buf):
                try:
                    gateway._main()
                except SystemExit as e:
                    code = e.code or 0
        return code, buf.getvalue()

    def test_cli_poll_zone_format_hook_inbox_vide(self):
        code, out = self._run_cli("poll", "--zone", "Appli_TSA_SDI_TDAH", "--format", "hook")
        self.assertEqual(code, 0)
        self.assertEqual(out.strip(), "RIEN")

    def test_cli_poll_zone_format_hook_avec_messages(self):
        gateway.route_inbound(7, "Morpheus", "@design: un point à revoir")
        code, out = self._run_cli("poll", "--zone", "design", "--format", "hook")
        self.assertEqual(code, 0)
        self.assertIn(" — Morpheus — un point à revoir", out)

    def test_cli_poll_exige_agent_ou_zone(self):
        code, _ = self._run_cli("poll", "--format", "hook")
        self.assertNotEqual(code, 0)


if __name__ == "__main__":
    unittest.main()
