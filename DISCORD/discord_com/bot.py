"""Bot Discord - relai bidirectionnel Claude Code ↔ Discord."""
import discord
import asyncio
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

DIR = Path(__file__).parent
load_dotenv(DIR / ".env")
CONFIG = json.loads((DIR / "config_bot_discord.json").read_text(encoding="utf-8"))

if not CONFIG.get("enabled", True):
    print("Discord com désactivée.")
    exit(0)

TOKEN = os.environ["DISCORD_BOT_TOKEN"]
CHANNEL_ID = int(CONFIG["channel_id"])
ADMINS = set(CONFIG.get("admins", []))
QUEUE = DIR / "queue.json"
COMMANDS = DIR / "commands.json"
LOGS_DIR = DIR / "logs"
CONV_LOG = LOGS_DIR / "conversation.jsonl"
BACKFILL_LOG = LOGS_DIR / "backfill.jsonl"
BACKFILL_MARKER = LOGS_DIR / ".backfill_done"
POLL_INTERVAL = 0.5

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

_channel = None


def lire(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def ecrire(path: Path, data: dict):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ------------------------------------------------------------------
# Journalisation conversation (analyse IA ultérieure)
# ------------------------------------------------------------------

def _role_for(author_id) -> str:
    return "ADMIN" if author_id in ADMINS else "RESTREINT"


def log_conv(sens: str, author: str, author_id, content: str, ts: str | None = None):
    """Append une ligne JSON dans logs/conversation.jsonl. Jamais bloquant."""
    try:
        LOGS_DIR.mkdir(exist_ok=True)
        entry = {
            "ts": ts or datetime.now(timezone.utc).isoformat(),
            "sens": sens,
            "author": author,
            "author_id": author_id,
            "role": _role_for(author_id),
            "content": content,
        }
        with CONV_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"Erreur log_conv : {e}")


async def envoyer(text: str):
    """Envoie un message Discord et le journalise côté bot."""
    await _channel.send(text)
    uid = client.user.id if client.user else None
    log_conv("bot", "bot", uid, text)


async def backfill_historique():
    """Rapatrie une seule fois l'historique du channel antérieur au logging."""
    if BACKFILL_MARKER.exists():
        return
    try:
        LOGS_DIR.mkdir(exist_ok=True)
        n = 0
        with BACKFILL_LOG.open("a", encoding="utf-8") as f:
            async for m in _channel.history(limit=None, oldest_first=True):
                sens = "bot" if (client.user and m.author.id == client.user.id) else "user"
                entry = {
                    "ts": m.created_at.isoformat(),
                    "sens": sens,
                    "author": str(m.author),
                    "author_id": m.author.id,
                    "role": _role_for(m.author.id),
                    "content": m.content,
                }
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                n += 1
        BACKFILL_MARKER.write_text(
            datetime.now(timezone.utc).isoformat() + f" — {n} messages\n", encoding="utf-8"
        )
        print(f"Backfill historique : {n} messages -> {BACKFILL_LOG.name}")
    except Exception as e:
        print(f"Erreur backfill_historique : {e}")


# ------------------------------------------------------------------
# Commandes autonomes (sans Claude actif)
# ------------------------------------------------------------------

def _cmd_help() -> str:
    return (
        "📋 **Commandes disponibles**\n"
        "`!ping` — test connexion bot\n"
        "`!help` — cette aide\n"
        "_(tout autre message → transmis à Claude si actif)_"
    )


def _cmd_ping() -> str:
    cmd = lire(COMMANDS)
    claude = "✅ actif" if cmd["status"] in ("idle", "processing") else "⚠️ inconnu"
    return f"🏓 Pong ! Bot OK — Claude : {claude}"


async def traiter_autonome(message_content: str) -> str | None:
    """Retourne une réponse si c'est une commande autonome, None sinon."""
    stripped = message_content.strip()
    cmd = stripped.lower()

    if cmd == "!help":
        return _cmd_help()
    if cmd == "!ping":
        return _cmd_ping()
    return None


# ------------------------------------------------------------------
# Events Discord
# ------------------------------------------------------------------

@client.event
async def on_ready():
    global _channel
    _channel = await client.fetch_channel(CHANNEL_ID)
    print(f"Bot pret -> #{_channel.name}")
    await backfill_historique()
    asyncio.ensure_future(boucle_polling())


@client.event
async def on_message(message):
    if message.author == client.user:
        return
    if message.channel.id != CHANNEL_ID:
        return

    log_conv("user", str(message.author), message.author.id, message.content)

    # Commandes autonomes (priorité absolue)
    reponse = await traiter_autonome(message.content)
    if reponse:
        await envoyer(reponse)
        return

    # Mode réponse interactive (claude_bridge.envoyer) : priorité si une attente est en cours
    q = lire(QUEUE)
    if q["status"] == "waiting":
        q["response"] = message.content
        q["status"] = "responded"
        q["timestamp"] = int(time.time())
        ecrire(QUEUE, q)
        return

    # Filtre mention : le bot ne traite que les messages où il est explicitement tagué.
    # Message taguant d'autres membres (ou personne) -> journalisé seulement, pas transmis à Claude.
    if client.user not in message.mentions:
        return

    # Mode commande Claude : si Claude attend, transmettre
    cmd = lire(COMMANDS)
    if cmd["status"] == "idle":
        # Retrait de la mention du bot avant transmission
        contenu = message.content
        for token in (f"<@{client.user.id}>", f"<@!{client.user.id}>"):
            contenu = contenu.replace(token, "")
        contenu = contenu.strip()
        # Préfixe novice si message commence par "? "
        if contenu.strip().startswith("? "):
            sujet = contenu.strip()[2:].strip()
            contenu = f"Explique à un novice complet, en termes simples et concrets (pas de jargon) : {sujet}"
        await envoyer("Bien reçu")
        ecrire(COMMANDS, {
            "status": "pending",
            "command": contenu,
            "author": str(message.author),
            "author_display": message.author.display_name,
            "author_id": message.author.id,
            "timestamp": int(time.time())
        })
    else:
        await envoyer("⏳ Claude traite déjà une commande. Renvoie ce message quand il a répondu.")


async def boucle_polling():
    """Envoie les messages en attente dans queue.json vers Discord."""
    _dernier_ts_envoye = 0
    while True:
        try:
            q = lire(QUEUE)
            ts = q.get("timestamp", 0)
            if q["status"] == "pending" and q["message"] and ts != _dernier_ts_envoye:
                _dernier_ts_envoye = ts
                q["status"] = "waiting" if q.get("expect_reply") else "idle"
                q["response"] = ""
                ecrire(QUEUE, q)
                await envoyer(q["message"])
        except Exception as e:
            print(f"Erreur polling : {e}")
        await asyncio.sleep(POLL_INTERVAL)


client.run(TOKEN)
