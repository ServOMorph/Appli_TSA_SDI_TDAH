"""Bot Discord - relai bidirectionnel Claude Code ↔ Discord."""
import discord
import asyncio
import json
import os
import time
from datetime import datetime, timedelta, timezone
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
CATCHUP_LOG = LOGS_DIR / "catchup.jsonl"
COMMANDES_NON_REJOUEES_LOG = LOGS_DIR / "commandes_non_rejouees.jsonl"
POLL_INTERVAL = 0.5
ORPHAN_PROCESSING_MINUTES = 15
GATEWAY_DRAIN_INTERVAL = 5.0
CATCHUP_MARGE_S = 300   # on remonte un peu avant le dernier entrant loggé (arrêt brutal du bot)
CATCHUP_DEDUP_S = 180   # |ts réception loggé - created_at Discord| sous ce seuil = même message

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


def _canal_testeur(channel_id: int) -> str | None:
    """Code du testeur dont `channels.testeurs.<code>.channel_id` == `channel_id`
    (config_bot_discord.json). None si le canal n'est pas un canal testeur déclaré."""
    for code, entree in (CONFIG.get("channels") or {}).get("testeurs", {}).items():
        if not isinstance(entree, dict):
            continue
        cid = entree.get("channel_id")
        try:
            if cid is not None and int(cid) == int(channel_id):
                return code
        except (TypeError, ValueError):
            continue
    return None


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


def _entrants_connus() -> tuple[dict, "datetime | None"]:
    """Lit conversation.jsonl : {(author_id, content): [ts réception]} des messages entrants
    déjà journalisés, et le ts de réception le plus récent. Sert de filtre anti-doublon et de
    borne au rattrapage post-arrêt. ({}, None) si le journal est absent ou sans entrant."""
    if not CONV_LOG.exists():
        return {}, None
    connus: dict = {}
    dernier = None
    try:
        with CONV_LOG.open(encoding="utf-8") as f:
            for ligne in f:
                ligne = ligne.strip()
                if not ligne:
                    continue
                try:
                    e = json.loads(ligne)
                except json.JSONDecodeError:
                    continue
                if e.get("sens") != "user":
                    continue
                try:
                    ts = datetime.fromisoformat(e.get("ts"))
                except (TypeError, ValueError):
                    continue
                connus.setdefault((e.get("author_id"), e.get("content") or ""), []).append(ts)
                if dernier is None or ts > dernier:
                    dernier = ts
    except OSError as ex:
        print(f"Erreur lecture conversation.jsonl (rattrapage) : {ex}")
        return {}, None
    return connus, dernier


def _deja_traite(connus: dict, author_id, content: str, created_at) -> bool:
    for ts in connus.get((author_id, content or ""), ()):
        if abs((ts - created_at).total_seconds()) <= CATCHUP_DEDUP_S:
            return True
    return False


async def rattraper_messages_manques():
    """Rejoue les messages du canal reçus pendant que bot.py était arrêté (session
    /discord_loop fermée -> on_close stoppe bot.py) : journalisation + routage gateway
    identiques au temps réel de on_message (hors commandes @bot). Sans ça, toute réponse
    postée hors ligne n'existe que dans l'historique Discord et échappe à la gateway."""
    connus, dernier = _entrants_connus()
    if dernier is None:
        return  # démarrage à froid : backfill_historique() couvre déjà l'historique complet
    depuis = dernier - timedelta(seconds=CATCHUP_MARGE_S)
    bot_id = client.user.id if client.user else None
    n_log = n_route = n_cmd = n_skip = 0
    try:
        async for m in _channel.history(limit=None, after=depuis, oldest_first=True):
            if m.author.id == bot_id:
                continue
            contenu = m.content or ""
            if _deja_traite(connus, m.author.id, contenu, m.created_at):
                n_skip += 1
                continue
            log_conv("user", str(m.author), m.author.id, contenu, ts=m.created_at.isoformat())
            n_log += 1
            if contenu.strip().lower() in ("!ping", "!help"):
                continue
            mentionne = bool(bot_id) and any(u.id == bot_id for u in m.mentions)
            if (not mentionne or gateway.has_pending_reply(m.author.id)
                    or m.author.id == gateway.MARIE_USER_ID):
                try:
                    pieces = [{"filename": a.filename, "url": a.url,
                               "content_type": a.content_type} for a in m.attachments]
                    res = gateway.route_inbound(m.author.id, str(m.author), contenu, pieces)
                    n_route += 1
                    print(f"Rattrapage -> inbox/{res['routed_to']} ({res['routing']}) : "
                          f"{res['id']} — {len(pieces)} piece(s) jointe(s)")
                except Exception as e:  # un routage raté ne coupe pas le rattrapage
                    print(f"Erreur rattrapage route_inbound : {e}")
            else:
                n_cmd += 1
                print(f"Rattrapage : commande @bot non rejouee de {m.author} "
                      f"({m.created_at.isoformat()}) : {contenu[:80]!r}")
                with COMMANDES_NON_REJOUEES_LOG.open("a", encoding="utf-8") as f:
                    f.write(json.dumps({
                        "ts": m.created_at.isoformat(),
                        "author": str(m.author),
                        "author_id": m.author.id,
                        "content": contenu,
                    }, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"Erreur rattraper_messages_manques : {e}")
        return
    if n_log or n_cmd:
        try:
            LOGS_DIR.mkdir(exist_ok=True)
            with CATCHUP_LOG.open("a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "depuis": depuis.isoformat(),
                    "logges": n_log, "routes": n_route,
                    "commandes_non_rejouees": n_cmd, "deja_connus": n_skip,
                }, ensure_ascii=False) + "\n")
        except OSError as e:
            print(f"Erreur ecriture catchup.jsonl : {e}")
    if n_log or n_cmd:
        print(f"Rattrapage post-arret : {n_log} journalise(s), {n_route} route(s), "
              f"{n_cmd} commande(s) @bot non rejouee(s), {n_skip} deja connu(s) "
              f"— depuis {depuis.isoformat()}")


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
    await rattraper_messages_manques()
    asyncio.ensure_future(boucle_polling())


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    code_testeur = None
    if message.channel.id != CHANNEL_ID:
        code_testeur = _canal_testeur(message.channel.id)
        if code_testeur is None:
            return

    log_conv("user", str(message.author), message.author.id, message.content)

    if code_testeur:
        # Canal #test-<code> : Marie y répond en clair au testeur (visible d'elle et de lui
        # seuls) — ce n'est pas un retour à router, elle n'attend rien de la gateway ici.
        if message.author.id == gateway.MARIE_USER_ID:
            return
        try:
            pieces = [{"filename": a.filename, "url": a.url, "content_type": a.content_type}
                      for a in message.attachments]
            res = gateway.route_inbound(message.author.id, str(message.author),
                                        message.content, pieces,
                                        channel_id=message.channel.id)
            print(f"Route vers inbox/{res['routed_to']} ({res['routing']}) : {res['id']} "
                  f"— {len(pieces)} piece(s) jointe(s)")
        except Exception as e:  # le routage ne doit jamais tuer le bot
            print(f"Erreur route_inbound : {e}")
        return

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

    # Sans @-mention du bot, réponse attendue de cet auteur (même en @-mentionnant le bot par
    # réflexe en répondant), ou message de Marie (jamais d'usage légitime du mode commande) :
    # ce n'est pas une commande /discord_loop, c'est du trafic de canal. Il part vers la
    # gateway, qui le route dans l'inbox de l'agent concerné, pièces jointes incluses.
    if (client.user not in message.mentions
            or gateway.has_pending_reply(message.author.id)
            or message.author.id == gateway.MARIE_USER_ID):
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
        await envoyer(f"📥 En file d'attente ({len(file)}). j'envoie la sauce dès que j'ai fini mon café")


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


if __name__ == "__main__":
    client.run(TOKEN)
