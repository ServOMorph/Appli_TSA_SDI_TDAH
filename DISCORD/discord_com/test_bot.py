"""Tests de bot.py — on_message multi-canal (ONBOARD Phase 5 passe 3), events Discord mockés.

Aucune connexion réseau : bot.py protège `client.run(TOKEN)` sous `if __name__ == "__main__":`,
l'import du module se limite à la création de l'objet `discord.Client` et l'enregistrement des
handlers.
"""
import asyncio
import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

os.environ.setdefault("DISCORD_BOT_TOKEN", "test-token")

import bot  # noqa: E402
import gateway  # noqa: E402

CANAL_PRINCIPAL = 111
CANAL_TESTEUR = 222
TESTEUR_ID = 900000000000000001
MARIE_ID = 800000000000000001


class FakeAuthor:
    def __init__(self, author_id, name="Auteur"):
        self.id = author_id
        self._name = name

    def __str__(self):
        return self._name


class FakeChannel:
    def __init__(self, channel_id):
        self.id = channel_id


class FakeMessage:
    def __init__(self, author_id, content, channel_id, mentions=None, author_name="Auteur"):
        self.author = FakeAuthor(author_id, author_name)
        self.channel = FakeChannel(channel_id)
        self.content = content
        self.mentions = mentions or []
        self.attachments = []


class OnMessageMultiCanalTest(unittest.TestCase):
    def setUp(self):
        self._tmp = TemporaryDirectory()
        root = Path(self._tmp.name)
        self._patches = [
            mock.patch.object(bot, "CHANNEL_ID", CANAL_PRINCIPAL),
            mock.patch.object(bot, "CONFIG", {
                "enabled": True,
                "channel_id": CANAL_PRINCIPAL,
                "channels": {
                    "testeurs": {"satine": {"channel_id": CANAL_TESTEUR,
                                            "discord_member_id": None}},
                    "supervision": CANAL_PRINCIPAL,
                },
            }),
            mock.patch.object(bot, "QUEUE", root / "queue.json"),
            mock.patch.object(bot, "COMMANDS", root / "commands.json"),
            mock.patch.object(bot, "LOGS_DIR", root / "logs"),
            mock.patch.object(bot, "CONV_LOG", root / "logs" / "conversation.jsonl"),
            mock.patch.object(gateway, "MARIE_USER_ID", MARIE_ID),
            mock.patch.object(gateway, "has_pending_reply", return_value=False),
        ]
        for p in self._patches:
            p.start()
        bot.ecrire(bot.QUEUE, {"status": "idle", "message": "", "expect_reply": False,
                               "timestamp": 0, "response": ""})
        bot.ecrire(bot.COMMANDS, {"status": "idle", "queue": []})

    def tearDown(self):
        for p in self._patches:
            p.stop()
        self._tmp.cleanup()

    def _on_message(self, message):
        asyncio.run(bot.on_message(message))

    def test_message_testeur_dans_son_canal_route_vers_inbox_testeur(self):
        message = FakeMessage(TESTEUR_ID, "l'écran énergie plante", CANAL_TESTEUR,
                              author_name="Satine")
        with mock.patch.object(gateway, "route_inbound", return_value={
                "routed_to": "testeurs/satine", "id": "1", "routing": "testeur"}) as m:
            self._on_message(message)
        m.assert_called_once_with(TESTEUR_ID, "Satine", "l'écran énergie plante", [],
                                  channel_id=CANAL_TESTEUR)

    def test_message_de_marie_dans_canal_testeur_n_est_pas_route(self):
        message = FakeMessage(MARIE_ID, "je regarde ça avec toi", CANAL_TESTEUR,
                              author_name="Marie")
        with mock.patch.object(gateway, "route_inbound") as m:
            self._on_message(message)
        m.assert_not_called()

    def test_canal_non_declare_est_ignore(self):
        message = FakeMessage(TESTEUR_ID, "message hors périmètre", 999999)
        with mock.patch.object(gateway, "route_inbound") as m:
            self._on_message(message)
        m.assert_not_called()

    def test_canal_testeur_inconnu_lorsque_channels_absent(self):
        with mock.patch.object(bot, "CONFIG", {"enabled": True, "channel_id": CANAL_PRINCIPAL}):
            message = FakeMessage(TESTEUR_ID, "message", CANAL_TESTEUR)
            with mock.patch.object(gateway, "route_inbound") as m:
                self._on_message(message)
        m.assert_not_called()

    def test_deux_testeurs_canaux_distincts(self):
        with mock.patch.object(bot, "CONFIG", {
            "enabled": True,
            "channel_id": CANAL_PRINCIPAL,
            "channels": {
                "testeurs": {
                    "satine": {"channel_id": CANAL_TESTEUR, "discord_member_id": None},
                    "leo": {"channel_id": 444, "discord_member_id": None},
                },
                "supervision": CANAL_PRINCIPAL,
            },
        }):
            message = FakeMessage(TESTEUR_ID + 1, "retour de Léo", 444, author_name="Leo")
            with mock.patch.object(gateway, "route_inbound", return_value={
                    "routed_to": "testeurs/leo", "id": "1", "routing": "testeur"}) as m:
                self._on_message(message)
        m.assert_called_once_with(TESTEUR_ID + 1, "Leo", "retour de Léo", [],
                                  channel_id=444)

    def test_canal_principal_route_inchange_sans_channel_id(self):
        message = FakeMessage(TESTEUR_ID, "@design: revoir le bouton", CANAL_PRINCIPAL,
                              author_name="Quelqu'un")
        with mock.patch.object(gateway, "route_inbound", return_value={
                "routed_to": "design", "id": "1", "routing": "tag"}) as m:
            self._on_message(message)
        m.assert_called_once_with(TESTEUR_ID, "Quelqu'un", "@design: revoir le bouton", [])

    def test_canal_principal_message_testeur_non_configure_ici_est_ignore(self):
        """Le canal testeur n'existe que pour son propre channel_id : un message du même
        auteur dans le canal principal suit toujours la logique existante (non couvert par
        _canal_testeur puisque channel.id == CHANNEL_ID)."""
        message = FakeMessage(TESTEUR_ID, "salut", CANAL_PRINCIPAL, author_name="Satine")
        with mock.patch.object(gateway, "route_inbound", return_value={
                "routed_to": "unrouted", "id": "1", "routing": "aucune"}) as m:
            self._on_message(message)
        m.assert_called_once()


if __name__ == "__main__":
    unittest.main()
