"""
Gateway DISCORD — passerelle unique entrée/sortie Discord pour tous les agents du projet.

SORTIE : les autres agents (orchestrateur, design) appellent `enqueue(...)` ou la CLI
`enqueue`. Ils n'appellent jamais `message_marie.py`, l'API Discord ni `claude_bridge`.
Chaque demande naît en `pending`. L'agent DISCORD est le gardien de sortie : il ajuste
ton/format/timing SANS toucher au fond, puis `approve` / `hold` / `bounce` / `merge`.
Seules les demandes `approved` sortent ; `bot.py` les draine automatiquement.

ENTRÉE : `route_inbound(...)` classe les messages Discord entrants et les dépose dans
`gateway/inbox/<agent>/`. Priorité : tag explicite `@agent:` en tête, sinon réponse
attendue de cet auteur (`state.pending_replies`), sinon heuristique par mots-clés,
sinon `inbox/unrouted/`. `bot.py` route ainsi tout message du canal qui n'est pas une
commande @bot. Les agents lisent via `poll(agent)` et acquittent via `ack(agent, id)`.

REGISTRE : un agent = une zone (`gateway/agents.json`). Le nom d'agent est le nom de
zone, ou son `alias` (`Appli_TSA_SDI_TDAH` -> `orchestrateur`). Les mots-clés de
l'heuristique et les cibles de tag viennent de ce fichier.

CLI :
  python gateway.py enqueue --source orchestrateur --to marie --kind question \
                            --expect-reply --file corps.txt
  python gateway.py list
  python gateway.py approve --id <id>
  python gateway.py hold    --id <id> [--reason "..."]
  python gateway.py bounce  --id <id> --reason "<motif>"
  python gateway.py merge   --ids <id,id,...>
  python gateway.py drain [--dry-run]
  python gateway.py poll --agent orchestrateur
  python gateway.py poll --zone design --format hook   # relevé compact (RIEN si vide, exit 0)
  python gateway.py ack --agent orchestrateur --id <id>
  python gateway.py route --author-id <id> --text "..."
  python gateway.py agents

Cibles (`--to`)   : marie | morpheus | channel
Types (`--kind`)  : info | question | delivery
Statuts outbox    : pending | approved | held | bounced | failed
"""
import argparse
import json
import os
import re
import sys
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import message_marie

DIR = Path(__file__).parent
GATEWAY = DIR / "gateway"
OUTBOX = GATEWAY / "outbox"
SENT = OUTBOX / "sent"
INBOX = GATEWAY / "inbox"
STATE = GATEWAY / "state.json"
AGENTS_FILE = GATEWAY / "agents.json"
LOCK = GATEWAY / "state.lock"
DRAIN_LOCK = GATEWAY / "drain.lock"
CONV_LOG = DIR / "logs" / "conversation.jsonl"

TARGETS = ("marie", "morpheus", "channel")
KINDS = ("info", "question", "delivery")
STATUSES = ("pending", "approved", "held", "bounced", "failed")
APPROUVABLES = ("pending", "held", "failed")

LOCK_TIMEOUT_S = 5.0
LOCK_STALE_S = 30.0

_TAG_RE = re.compile(r"^\s*@(?P<agent>[\w-]+)\s*:\s*(?P<reste>.*)$", re.DOTALL)

FRAME = message_marie.FRAME
MARIE_USER_ID = message_marie.MARIE_USER_ID
MORPHEUS_USER_ID = 651446274939420672  # morpheus5208, relevé dans logs/conversation.jsonl

_AUTHOR_TARGET = {MARIE_USER_ID: "marie", MORPHEUS_USER_ID: "morpheus"}


class GatewayError(Exception):
    pass


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_dirs() -> None:
    for d in (OUTBOX, SENT, INBOX):
        d.mkdir(parents=True, exist_ok=True)


def _new_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%f")


def _atomic_write(path: Path, text: str) -> None:
    """Écrit `text` dans `path` sans état intermédiaire visible (tmp + os.replace)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f"{path.name}.{os.getpid()}.{time.monotonic_ns()}.tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


# ------------------------------------------------------------------
# Registre d'agents (gateway/agents.json) — un agent = une zone
# ------------------------------------------------------------------

def load_registry() -> dict:
    """Registre zone -> {alias?, path, keywords}. Vide si le fichier manque ou est illisible."""
    if not AGENTS_FILE.is_file():
        return {}
    try:
        data = json.loads(AGENTS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def agent_names() -> list[str]:
    """Noms d'agent canoniques (alias si défini, sinon nom de zone), ordre du registre."""
    return [(cfg.get("alias") or zone) for zone, cfg in load_registry().items()]


def resolve_agent(name: str) -> str | None:
    """Résout un nom de zone ou d'alias vers le nom d'agent canonique. None si inconnu."""
    key = (name or "").strip().lower()
    if not key:
        return None
    for zone, cfg in load_registry().items():
        alias = cfg.get("alias")
        if key in {zone.lower(), (alias or "").lower()} - {""}:
            return alias or zone
    return None


def _heuristique_registre() -> dict[str, tuple[str, ...]]:
    """{nom d'agent canonique: mots-clés}, dans l'ordre du registre."""
    out = {}
    for zone, cfg in load_registry().items():
        mots = tuple(str(m).lower() for m in cfg.get("keywords") or ())
        if mots:
            out[cfg.get("alias") or zone] = mots
    return out


# ------------------------------------------------------------------
# État (gateway/state.json) — verrou + écriture atomique
# ------------------------------------------------------------------

@contextmanager
def _file_lock(path: Path):
    """Verrou d'exclusion inter-process matérialisé par un fichier créé en O_EXCL."""
    path.parent.mkdir(parents=True, exist_ok=True)
    deadline = time.monotonic() + LOCK_TIMEOUT_S
    fd = None
    while True:
        try:
            fd = os.open(str(path), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            break
        except FileExistsError:
            try:  # verrou périmé (process tué avant libération)
                if time.time() - path.stat().st_mtime > LOCK_STALE_S:
                    path.unlink(missing_ok=True)
                    continue
            except OSError:
                pass
            if time.monotonic() >= deadline:
                raise GatewayError(f"verrou non obtenu en {LOCK_TIMEOUT_S}s ({path})")
            time.sleep(0.01)
    try:
        os.write(fd, str(os.getpid()).encode("ascii"))
        os.close(fd)
        fd = None
        yield
    finally:
        if fd is not None:
            os.close(fd)
        path.unlink(missing_ok=True)


def _state_lock():
    """Verrou autour d'un read-modify-write de state.json."""
    return _file_lock(LOCK)


def _migrer_state(state: dict) -> dict:
    """Convertit l'ancien `pending_reply` (objet unique) en `pending_replies` (liste)."""
    if "pending_reply" in state:
        ancien = state.pop("pending_reply")
        if ancien and not state.get("pending_replies"):
            state["pending_replies"] = [ancien]
    state.setdefault("pending_replies", [])
    if not isinstance(state["pending_replies"], list):
        state["pending_replies"] = []
    return state


def load_state() -> dict:
    if STATE.is_file():
        try:
            data = json.loads(STATE.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return _migrer_state(data)
        except json.JSONDecodeError:
            pass
    return {"pending_replies": []}


def save_state(state: dict) -> None:
    _ensure_dirs()
    _atomic_write(STATE, json.dumps(state, ensure_ascii=False, indent=2))


def update_state(fn):
    """Read-modify-write de state.json sous verrou. `fn(state)` modifie l'état en place."""
    with _state_lock():
        state = load_state()
        resultat = fn(state)
        save_state(state)
    return resultat


def add_pending_reply(source: str, to: str, request_id: str) -> None:
    """Enregistre une réponse attendue. Plusieurs peuvent coexister, y compris pour la même cible."""
    def _ajouter(state):
        state["pending_replies"].append({
            "request_id": request_id, "source": source, "to": to, "since": _now(),
        })
    update_state(_ajouter)


def _match_pending(state: dict, to: str | None) -> dict | None:
    """Entrée `pending_replies` la plus récente pour cette cible. None si aucune."""
    if not to:
        return None
    candidats = [p for p in state.get("pending_replies", []) if p.get("to") == to]
    if not candidats:
        return None
    return max(candidats, key=lambda p: p.get("since") or "")


# ------------------------------------------------------------------
# Sortie
# ------------------------------------------------------------------

def enqueue(source: str, to: str, body: str, *, kind: str = "info",
            expect_reply: bool = False, meta: dict | None = None) -> str:
    """
    Dépose une demande d'envoi dans l'outbox, en `pending`. Retourne l'id de la demande.
    Rien ne part sur Discord tant que le gardien (agent DISCORD) ne l'a pas `approve`.
    """
    source = (source or "").strip()
    if not source:
        raise GatewayError("source vide")
    if to not in TARGETS:
        raise GatewayError(f"cible inconnue : {to!r} (attendu : {', '.join(TARGETS)})")
    if kind not in KINDS:
        raise GatewayError(f"type inconnu : {kind!r} (attendu : {', '.join(KINDS)})")
    if not (body or "").strip():
        raise GatewayError("corps vide")

    _ensure_dirs()
    req_id = _new_id()
    _atomic_write(OUTBOX / f"{req_id}.json", json.dumps({
        "id": req_id,
        "source": source,
        "to": to,
        "kind": kind,
        "body": body.strip(),
        "expect_reply": bool(expect_reply),
        "status": "pending",
        "meta": meta or {},
        "created_at": _now(),
    }, ensure_ascii=False, indent=2))
    return req_id


def list_outbox() -> list[dict]:
    _ensure_dirs()
    out = []
    for path in sorted(OUTBOX.glob("*.json")):
        try:
            req = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            out.append({"id": path.stem, "error": "json invalide"})
            continue
        req["status"] = _statut(req)
        out.append(req)
    return out


# ------------------------------------------------------------------
# Gardien de sortie : statuts et verbes de décision
# ------------------------------------------------------------------

def _statut(req: dict) -> str:
    """Statut d'une demande outbox. Compat : ancien booléen `hold` -> `held`."""
    statut = req.get("status")
    if statut in STATUSES:
        return statut
    return "held" if req.get("hold") else "pending"


def _lire_demande(req_id: str) -> tuple[Path, dict]:
    path = OUTBOX / f"{req_id}.json"
    if not path.is_file():
        raise GatewayError(f"demande inconnue dans l'outbox : {req_id}")
    try:
        return path, json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise GatewayError(f"demande illisible : {req_id} ({e})")


def _marquer(path: Path, req: dict, statut: str, reason: str | None = None) -> dict:
    req["status"] = statut
    req["status_reason"] = reason
    req["status_at"] = _now()
    req.pop("hold", None)
    _atomic_write(path, json.dumps(req, ensure_ascii=False, indent=2))
    return req


def approve(req_id: str) -> dict:
    """`pending` / `held` / `failed` -> `approved`. Seul statut que `drain` envoie."""
    path, req = _lire_demande(req_id)
    actuel = _statut(req)
    if actuel not in APPROUVABLES:
        raise GatewayError(f"{req_id} est en {actuel!r} : approuvables = "
                           f"{', '.join(APPROUVABLES)}")
    return _marquer(path, req, "approved")


def hold(req_id: str, reason: str | None = None) -> dict:
    """Reporte une demande au cycle suivant, sans la renvoyer à son auteur."""
    path, req = _lire_demande(req_id)
    return _marquer(path, req, "held", reason)


def bounce(req_id: str, reason: str) -> dict:
    """
    Renvoie une demande à son agent auteur (`inbox/<source>/`, `kind: "bounce"`) avec le
    motif, et la retire de l'outbox. Le renvoi ne part jamais sur Discord.
    """
    reason = (reason or "").strip()
    if not reason:
        raise GatewayError("motif de renvoi vide")
    path, req = _lire_demande(req_id)
    source = req.get("source") or "unrouted"
    dest = INBOX / (resolve_agent(source) or source)
    dest.mkdir(parents=True, exist_ok=True)
    corps = (req.get("body") or "").strip()
    msg_id = _new_id()
    _atomic_write(dest / f"{msg_id}.json", json.dumps({
        "id": msg_id,
        "kind": "bounce",
        "from_discord": {"author_id": None, "author_name": "gateway:gardien"},
        "content": f"Message non envoyé — {reason}\n\n{corps}",
        "raw_content": corps,
        "reason": reason,
        "original_id": req.get("id"),
        "original_body": corps,
        "original_to": req.get("to"),
        "original_kind": req.get("kind"),
        "attachments": [],
        "routing": "bounce",
        "reply_to": None,
        "received_at": _now(),
    }, ensure_ascii=False, indent=2))
    path.unlink()
    return {"id": req_id, "status": "bounced", "routed_to": dest.name, "inbox_id": msg_id}


def merge(req_ids: list[str]) -> dict:
    """
    Fusionne plusieurs demandes vers le même destinataire dans la plus ancienne
    (les `body` concaténés dans l'ordre chronologique), et supprime les autres.
    """
    ids = sorted({i for i in (req_ids or []) if i})  # id = horodatage : tri = chronologie
    if len(ids) < 2:
        raise GatewayError("merge demande au moins deux identifiants distincts")
    lus = [_lire_demande(i) for i in ids]
    cibles = {r.get("to") for _, r in lus}
    if len(cibles) > 1:
        raise GatewayError(f"destinataires différents : {', '.join(sorted(map(str, cibles)))}")
    base_path, base = lus[0]
    corps = [(r.get("body") or "").strip() for _, r in lus]
    base["body"] = "\n\n".join(c for c in corps if c)
    base["expect_reply"] = any(r.get("expect_reply") for _, r in lus)
    base["merged_from"] = ids[1:]
    _marquer(base_path, base, _statut(base), base.get("status_reason"))
    for p, _ in lus[1:]:
        p.unlink()
    return {"id": base["id"], "to": base["to"], "merged": ids[1:]}


def curate(to: str, kind: str, body: str) -> str:
    """Formatage mécanique par destinataire. Ne modifie pas le fond du message."""
    body = (body or "").strip()
    if not body:
        raise GatewayError("corps vide")
    if to == "marie":
        text = f"{FRAME}\n<@{MARIE_USER_ID}>\n{body}\n{FRAME}"
    else:
        text = body
    if len(text) > 2000:
        raise GatewayError(f"message de {len(text)} caractères, limite Discord = 2000")
    return text


def _mention_ids(to: str) -> list[int]:
    if to == "marie":
        return [MARIE_USER_ID]
    if to == "morpheus":
        return [MORPHEUS_USER_ID]
    return []


def _discord_post(content: str, mention_user_ids: list[int]) -> str:
    token = message_marie._read_token()
    channel_id = message_marie._read_channel_id()
    return message_marie._send(token, channel_id, content, allowed_user_ids=mention_user_ids)


def _log(source: str, to: str, content: str) -> None:
    try:
        CONV_LOG.parent.mkdir(exist_ok=True)
        entry = {
            "ts": _now(),
            "sens": "bot",
            "author": f"gateway:{source}",
            "author_id": None,
            "role": "GATEWAY",
            "to": to,
            "content": content,
        }
        with CONV_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:  # journalisation non bloquante
        print(f"(log conversation ignoré : {e})", file=sys.stderr)


def _dead_letter(req: dict, erreur: str) -> str:
    """Dépose l'échec d'envoi dans `inbox/discord/` pour qu'il soit vu, pas seulement logué."""
    dest = INBOX / (resolve_agent("discord") or "discord")
    dest.mkdir(parents=True, exist_ok=True)
    msg_id = _new_id()
    _atomic_write(dest / f"{msg_id}.json", json.dumps({
        "id": msg_id,
        "kind": "dead-letter",
        "from_discord": {"author_id": None, "author_name": "gateway:drain"},
        "content": f"Échec d'envoi de {req.get('id')} vers {req.get('to')} — {erreur}",
        "reason": erreur,
        "original_id": req.get("id"),
        "original_body": (req.get("body") or "").strip(),
        "original_to": req.get("to"),
        "original_source": req.get("source"),
        "attachments": [],
        "routing": "dead-letter",
        "reply_to": None,
        "received_at": _now(),
    }, ensure_ascii=False, indent=2))
    return msg_id


def drain(send_fn=None, *, dry_run: bool = False) -> list[dict]:
    """
    Envoie les demandes outbox **approuvées** (`status: approved`), de la plus ancienne à la
    plus récente. Les autres statuts sont laissés en place (`ignoré`). Un échec d'envoi ne
    coupe pas la boucle : la demande passe en `failed` et une alerte est déposée dans
    `inbox/discord/`. En `--dry-run`, tous les statuts sont rendus, rien n'est envoyé.
    `send_fn(content, mention_user_ids) -> message_id`. Par défaut : POST Discord réel.
    """
    if send_fn is None:
        send_fn = _discord_post
    _ensure_dirs()
    results: list[dict] = []

    with _file_lock(DRAIN_LOCK):
        for path in sorted(OUTBOX.glob("*.json")):
            try:
                req = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                results.append({"id": path.stem, "status": "erreur", "detail": "json invalide"})
                continue

            statut = _statut(req)
            if statut != "approved" and not dry_run:
                results.append({"id": req.get("id", path.stem), "status": "ignoré",
                                "outbox_status": statut})
                continue

            try:
                content = curate(req["to"], req["kind"], req["body"])
            except GatewayError as e:
                results.append({"id": req["id"], "status": "erreur", "detail": str(e)})
                continue

            if dry_run:
                results.append({"id": req["id"], "status": "dry-run", "to": req["to"],
                                "outbox_status": statut, "content": content})
                continue

            try:
                msg_id = send_fn(content, _mention_ids(req["to"]))
            except Exception as e:  # un envoi raté ne doit pas bloquer les suivants
                _marquer(path, req, "failed", str(e))
                results.append({"id": req["id"], "status": "failed", "detail": str(e),
                                "dead_letter": _dead_letter(req, str(e))})
                continue

            _log(req["source"], req["to"], content)

            if req.get("expect_reply"):
                add_pending_reply(req["source"], req["to"], req["id"])

            req["sent_at"] = _now()
            req["discord_message_id"] = str(msg_id)
            _atomic_write(SENT / path.name, json.dumps(req, ensure_ascii=False, indent=2))
            path.unlink()
            results.append({"id": req["id"], "status": "sent",
                            "discord_message_id": str(msg_id)})

    return results


# ------------------------------------------------------------------
# Entrée
# ------------------------------------------------------------------

def _classer_heuristique(content: str) -> str | None:
    """Agent au plus grand nombre de mots-clés distincts trouvés. Égalité : ordre du registre."""
    low = (content or "").lower()
    meilleur, score_max = None, 0
    for agent, mots in _heuristique_registre().items():
        score = sum(1 for m in mots if re.search(rf"\b{re.escape(m)}\b", low))
        if score > score_max:
            meilleur, score_max = agent, score
    return meilleur


def _target_from_author(author_id) -> str | None:
    """Cible gateway (`marie`/`morpheus`) correspondant à un auteur Discord connu."""
    try:
        return _AUTHOR_TARGET.get(int(author_id))
    except (TypeError, ValueError):
        return None


def route_inbound(author_id, author_name: str, content: str,
                  attachments: list[dict] | None = None) -> dict:
    """
    Route un message Discord entrant vers `inbox/<agent>/`, par ordre de priorité :
      1. tag explicite `@agent:` en tête (zone ou alias connu du registre) ;
      2. réponse attendue de cet auteur (`state.pending_replies`) -> `inbox/<source>/` ;
      3. heuristique par mots-clés du registre ;
      4. `inbox/unrouted/`.
    L'appariement 2 retire la seule entrée la plus récente pour la cible de l'auteur ;
    les autres réponses attendues restent en place.

    `attachments` : pièces jointes Discord (`{filename, url, content_type}`). Une réponse
    peut n'être qu'une image — sans elles le message arriverait vide.
    """
    _ensure_dirs()
    routed_content = content
    reply_to = None
    purge = False

    m = _TAG_RE.match(content or "")
    tag = resolve_agent(m.group("agent")) if m else None

    if tag:
        target = tag
        routed_content = m.group("reste").strip()
        routing = "tag"
    else:
        to = _target_from_author(author_id)
        pending = _match_pending(load_state(), to)
        if pending:
            target = pending["source"]
            reply_to = pending
            purge = True
            routing = "pending"
        else:
            h = _classer_heuristique(content)
            target = h or "unrouted"
            routing = "heuristique" if h else "aucune"

    dest = INBOX / target
    dest.mkdir(parents=True, exist_ok=True)
    msg_id = _new_id()
    _atomic_write(dest / f"{msg_id}.json", json.dumps({
        "id": msg_id,
        "from_discord": {"author_id": author_id, "author_name": author_name},
        "content": routed_content,
        "raw_content": content,
        "attachments": attachments or [],
        "routing": routing,
        "reply_to": reply_to,
        "received_at": _now(),
    }, ensure_ascii=False, indent=2))

    if purge:
        def _retirer(state):
            state["pending_replies"] = [
                p for p in state.get("pending_replies", [])
                if p.get("request_id") != reply_to.get("request_id")
            ]
        update_state(_retirer)

    return {"routed_to": target, "id": msg_id, "routing": routing, "purged_pending": purge}


def poll(agent: str) -> list[dict]:
    """Retourne les messages en attente dans `inbox/<agent>/`, du plus ancien au plus récent."""
    _ensure_dirs()
    box = INBOX / (resolve_agent(agent) or agent)
    if not box.is_dir():
        return []
    out = []
    for path in sorted(box.glob("*.json")):
        try:
            out.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            out.append({"id": path.stem, "error": "json invalide"})
    return out


def rendu_hook(items: list[dict]) -> str:
    """
    Rendu compact d'une liste de messages inbox (`poll --format hook`), pour un relevé
    rapide par `/start` / `/close`. `RIEN` si la liste est vide. Sinon une ligne par message :
    `id — auteur — 1re ligne`, puis le décompte des pièces jointes s'il y en a.
    """
    if not items:
        return "RIEN"
    lignes = []
    for it in items:
        auteur = it.get("from_discord", {}).get("author_name") or "?"
        premiere = ""
        contenu = (it.get("content") or "").strip()
        if contenu:
            premiere = contenu.splitlines()[0][:200]
        pieces = it.get("attachments") or []
        if pieces and not premiere:
            premiere = f"[{len(pieces)} pièce(s) jointe(s)] {pieces[0].get('filename') or '?'}"
        elif pieces:
            premiere = f"{premiere}  [+{len(pieces)} pièce(s) jointe(s)]"
        lignes.append(f"{it.get('id')} — {auteur} — {premiere}".rstrip(" —"))
    return "\n".join(lignes)


def ack(agent: str, msg_id: str) -> bool:
    """Supprime un message inbox traité. Retourne False si le fichier n'existe pas."""
    path = INBOX / (resolve_agent(agent) or agent) / f"{msg_id}.json"
    if path.is_file():
        path.unlink()
        return True
    return False


# ------------------------------------------------------------------
# CLI
# ------------------------------------------------------------------

def _main() -> None:
    parser = argparse.ArgumentParser(description="Gateway DISCORD.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_enq = sub.add_parser("enqueue", help="déposer une demande d'envoi")
    p_enq.add_argument("--source", required=True,
                       help=f"agent demandeur ({', '.join(agent_names()) or 'registre vide'})")
    p_enq.add_argument("--to", required=True, choices=TARGETS)
    p_enq.add_argument("--kind", default="info", choices=KINDS)
    p_enq.add_argument("--expect-reply", action="store_true")
    g = p_enq.add_mutually_exclusive_group(required=True)
    g.add_argument("--text", help="corps du message")
    g.add_argument("--file", help="corps depuis un fichier UTF-8")
    g.add_argument("--stdin", action="store_true", help="corps sur stdin")

    sub.add_parser("list", help="lister l'outbox en attente")

    p_app = sub.add_parser("approve", help="autoriser l'envoi d'une demande (gardien)")
    p_app.add_argument("--id", required=True)

    p_hld = sub.add_parser("hold", help="reporter une demande au cycle suivant (gardien)")
    p_hld.add_argument("--id", required=True)
    p_hld.add_argument("--reason", default=None)

    p_bnc = sub.add_parser("bounce", help="renvoyer une demande à son auteur (gardien)")
    p_bnc.add_argument("--id", required=True)
    p_bnc.add_argument("--reason", required=True)

    p_mrg = sub.add_parser("merge", help="fusionner des demandes vers le même destinataire")
    p_mrg.add_argument("--ids", required=True, help="identifiants séparés par des virgules")

    p_drn = sub.add_parser("drain", help="envoyer l'outbox approuvée (bot.py / agent DISCORD)")
    p_drn.add_argument("--dry-run", action="store_true")

    p_poll = sub.add_parser("poll", help="lire l'inbox d'un agent")
    g_poll = p_poll.add_mutually_exclusive_group(required=True)
    g_poll.add_argument("--agent", help="nom d'agent ou de zone")
    g_poll.add_argument("--zone", help="nom de zone (synonyme de --agent, lisible en hook)")
    p_poll.add_argument("--format", choices=("texte", "hook"), default="texte",
                        help="hook : sortie compacte, 'RIEN' si vide, toujours exit 0")

    p_ack = sub.add_parser("ack", help="marquer un message inbox comme traité")
    p_ack.add_argument("--agent", required=True)
    p_ack.add_argument("--id", required=True)

    p_rte = sub.add_parser("route", help="router un message entrant (agent DISCORD / tests)")
    p_rte.add_argument("--author-id", required=True)
    p_rte.add_argument("--author-name", default="?")
    gr = p_rte.add_mutually_exclusive_group(required=True)
    gr.add_argument("--text")
    gr.add_argument("--stdin", action="store_true")

    sub.add_parser("agents", help="lister le registre d'agents et les réponses attendues")

    args = parser.parse_args()

    if args.cmd == "enqueue":
        if args.file:
            body = Path(args.file).read_text(encoding="utf-8")
        elif args.stdin:
            body = sys.stdin.read()
        else:
            body = args.text
        try:
            req_id = enqueue(args.source, args.to, body, kind=args.kind,
                             expect_reply=args.expect_reply)
        except GatewayError as e:
            raise SystemExit(f"Erreur : {e}")
        print(f"Demande déposée : {req_id} (outbox/{req_id}.json)")

    elif args.cmd == "list":
        items = list_outbox()
        if not items:
            print("Outbox vide.")
            return
        for it in items:
            reply = " [réponse attendue]" if it.get("expect_reply") else ""
            motif = f" — {it['status_reason']}" if it.get("status_reason") else ""
            print(f"- {it.get('id')} [{it.get('status')}] {it.get('source')} -> "
                  f"{it.get('to')} ({it.get('kind')}){reply}{motif}")
            print(f"    {(it.get('body') or '')[:120].splitlines()[0] if it.get('body') else ''}")

    elif args.cmd == "approve":
        try:
            approve(args.id)
        except GatewayError as e:
            raise SystemExit(f"Erreur : {e}")
        print(f"{args.id} : approved (sera envoyé au prochain drain de bot.py)")

    elif args.cmd == "hold":
        try:
            hold(args.id, args.reason)
        except GatewayError as e:
            raise SystemExit(f"Erreur : {e}")
        print(f"{args.id} : held{f' — {args.reason}' if args.reason else ''}")

    elif args.cmd == "bounce":
        try:
            res = bounce(args.id, args.reason)
        except GatewayError as e:
            raise SystemExit(f"Erreur : {e}")
        print(f"{args.id} : bounced -> inbox/{res['routed_to']}/{res['inbox_id']}")

    elif args.cmd == "merge":
        try:
            res = merge([i.strip() for i in args.ids.split(",")])
        except GatewayError as e:
            raise SystemExit(f"Erreur : {e}")
        print(f"fusionné dans {res['id']} (-> {res['to']}) : {', '.join(res['merged'])}")

    elif args.cmd == "drain":
        for r in drain(dry_run=args.dry_run):
            if r["status"] == "dry-run":
                print(f"--- {r['id']} -> {r['to']} [{r['outbox_status']}] (dry-run) ---\n"
                      f"{r['content']}\n")
            elif r["status"] == "ignoré":
                print(f"- {r['id']} : ignoré (statut {r['outbox_status']})")
            else:
                print(f"- {r['id']} : {r['status']} "
                      f"{r.get('discord_message_id') or r.get('detail') or ''}")

    elif args.cmd == "poll":
        cible = args.agent or args.zone
        try:
            items = poll(cible)
        except Exception:  # un hook ne doit jamais échouer sur la gateway
            items = []
        if args.format == "hook":
            print(rendu_hook(items))
            return
        if not items:
            print(f"inbox/{cible} vide.")
            return
        for it in items:
            auteur = it.get("from_discord", {}).get("author_name", "?")
            print(f"- {it.get('id')} de {auteur} [{it.get('routing')}]")
            if it.get("content"):
                print(f"    {it['content'].splitlines()[0][:200]}")
            for piece in it.get("attachments") or []:
                print(f"    [piece jointe] {piece.get('filename')} — {piece.get('url')}")

    elif args.cmd == "ack":
        print("supprimé" if ack(args.agent, args.id) else "introuvable")

    elif args.cmd == "route":
        txt = sys.stdin.read() if args.stdin else args.text
        res = route_inbound(args.author_id, args.author_name, txt)
        print(f"routé vers {res['routed_to']} ({res['routing']}) : {res['id']} "
              f"— pending purgé : {res['purged_pending']}")

    elif args.cmd == "agents":
        registre = load_registry()
        if not registre:
            print(f"Registre vide ou illisible ({AGENTS_FILE}).")
        for zone, cfg in registre.items():
            alias = cfg.get("alias")
            print(f"- {zone}{f' (alias {alias})' if alias else ''} -> {cfg.get('path')}")
            print(f"    inbox/{alias or zone}, {len(cfg.get('keywords') or [])} mots-clés")
        attentes = load_state().get("pending_replies", [])
        print(f"\nRéponses attendues : {len(attentes)}")
        for p in attentes:
            print(f"- {p.get('request_id')} : {p.get('source')} attend {p.get('to')} "
                  f"(depuis {p.get('since')})")


if __name__ == "__main__":
    _main()
