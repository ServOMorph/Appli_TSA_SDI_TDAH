"""
DÉPRÉCIÉ depuis 2026-09-02 — ne plus importer.

Toute communication Discord passe par la gateway DISCORD :
  import sys; sys.path.insert(0, "DISCORD/discord_com")
  import gateway
  gateway.enqueue(source, to, body, kind=..., expect_reply=...)

Voir DISCORD/discord_com/gateway/README.md. `envoyer` et `notifier` lèvent maintenant
une erreur : elles écrivaient en direct dans queue.json, hors curation et hors routage
des réponses.
"""
import json
from pathlib import Path

DIR = Path(__file__).parent
CONFIG = json.loads((DIR / "config_bot_discord.json").read_text(encoding="utf-8"))

_MSG = (
    "claude_bridge est déprécié. Passer par gateway.enqueue(...) "
    "(DISCORD/discord_com/gateway/README.md)."
)


def est_active() -> bool:
    return CONFIG.get("enabled", False)


def envoyer(message: str, timeout: int = 300) -> str:
    raise RuntimeError(_MSG)


def notifier(message: str) -> None:
    raise RuntimeError(_MSG)
