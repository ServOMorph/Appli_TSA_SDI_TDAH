"""Bot Discord - relai bidirectionnel Claude Code ↔ Discord."""
import discord
import asyncio
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

import gateway

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
ORPHAN_PROCESSING_MINUTES = 15
GATEWAY_DRAIN_INTERVAL = 5.0

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

def recuperer_processing_orphelin():
    """Une session /discord_loop tombée laisse commands.json en `processing` : la file ne
    serait plus jamais promue. Au démarrage du bot, on remet `idle` au-delà du délai."""
    try:
        cmd = lire(COMMANDS)
    except (OSError, json.JSONDecodeError) as e:
        print(f"Erreur lecture commands.json : {e}")
        return
    if cmd.get("status") != "processing":
        return
    age = time.time() - cmd.get("timestamp", 0)
    if age < ORPHAN_PROCESSING_MINUTES * 60:
        print(f"commands.json en processing depuis {int(age)}s — session probablement active.")
        return
    cmd["status"] = "idle"
    ecrire(COMMANDS, cmd)
    print(f"commands.json bloque en processing depuis {int(age / 60)} min -> remis a idle "
          f"(file : {len(cmd.get('queue') or [])} en attente).")


@client.event
async def on_ready():
    global _channel
    _channel = await client.fetch_channel(CHANNEL_ID)
    print(f"Bot pret -> #{_channel.name}")
    recuperer_processing_orphelin()
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

    # Sans @-mention du bot : ce n'est pas une commande /discord_loop, c'est du trafic de canal.
    # Il part vers la gateway, qui le route dans l'inbox de l'agent concerné.
    if client.user not in message.mentions:
        try:
            pieces = [{"filename": a.filename, "url": a.url, "content_type": a.content_type}
                      for a in message.attachments]
            res = gateway.route_inbound(message.author.id, str(message.author),
                                        message.content, pieces)
            print(f"Route vers inbox/{res['routed_to']} ({res['routing']}) : {res['id']} "
                  f"— {len(pieces)} piece(s) jointe(s)")
        except Exception as e:  # le routage ne doit jamais tuer le bot
            print(f"Erreur route_inbound : {e}")
        return

    # Mode commande Claude : préparation du contenu (retrait mention + préfixe novice)
    contenu = message.content
    for token in (f"<@{client.user.id}>", f"<@!{client.user.id}>"):
        contenu = contenu.replace(token, "")
    contenu = contenu.strip()
    if contenu.startswith("? "):
        sujet = contenu[2:].strip()
        contenu = f"Explique à un novice complet, en termes simples et concrets (pas de jargon) : {sujet}"

    entree = {
        "command": contenu,
        "author": str(message.author),
        "author_display": message.author.display_name,
        "author_id": message.author.id,
        "timestamp": int(time.time()),
    }

    cmd = lire(COMMANDS)
    if cmd["status"] == "idle" and not cmd.get("queue"):
        await envoyer("Bien reçu")
        ecrire(COMMANDS, {"status": "pending", "queue": [], **entree})
    else:
        file = cmd.get("queue", [])
        file.append(entree)
        cmd["queue"] = file
        ecrire(COMMANDS, cmd)
        await envoyer(f"📥 En file d'attente ({len(file)}). Traité dès que Claude se libère.")


async def drainer_gateway():
    """Envoie les demandes gateway approuvées par le gardien. Hors event loop (POST bloquant)."""
    try:
        resultats = await asyncio.to_thread(gateway.drain)
    except Exception as e:
        print(f"Erreur drain gateway : {e}")
        return
    for r in resultats:
        if r.get("status") in ("sent", "failed", "erreur"):
            print(f"Gateway {r.get('id')} : {r['status']} "
                  f"{r.get('discord_message_id') or r.get('detail') or ''}")


async def boucle_polling():
    """Envoie les messages en attente dans queue.json vers Discord et promeut la file commands.json."""
    _dernier_ts_envoye = 0
    _dernier_drain = 0.0
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

            # Promotion de la file d'attente des commandes Claude
            c = lire(COMMANDS)
            if c.get("status") == "idle" and c.get("queue"):
                suivante = c["queue"].pop(0)
                c.update({
                    "status": "pending",
                    "command": suivante["command"],
                    "author": suivante["author"],
                    "author_display": suivante["author_display"],
                    "author_id": suivante["author_id"],
                    "timestamp": suivante["timestamp"],
                })
                ecrire(COMMANDS, c)
                await envoyer(
                    f"▶️ Reprise de la demande de {suivante['author_display']} "
                    f"(file : {len(c['queue'])} restante(s))."
                )

            # Gardien de sortie : seules les demandes `approved` partent, et seulement d'ici.
            if time.monotonic() - _dernier_drain >= GATEWAY_DRAIN_INTERVAL:
                _dernier_drain = time.monotonic()
                await drainer_gateway()
        except Exception as e:
            print(f"Erreur polling : {e}")
        await asyncio.sleep(POLL_INTERVAL)


client.run(TOKEN)
