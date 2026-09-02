"""
Gateway DISCORD — passerelle unique entrée/sortie Discord pour tous les agents du projet.

SORTIE : les autres agents (orchestrateur, design) appellent `enqueue(...)` ou la CLI
`enqueue`. Ils n'appellent jamais `message_marie.py`, l'API Discord ni `claude_bridge`.
L'agent DISCORD relit l'outbox, ajuste ton/format/timing SANS toucher au fond, puis `drain()`.

ENTRÉE : `route_inbound(...)` classe les messages Discord entrants et les dépose dans
`gateway/inbox/<agent>/`. Priorité : tag explicite `@agent:` en tête, sinon réponse
attendue (`state.json`), sinon heuristique par mots-clés, sinon `inbox/unrouted/`.
Les autres agents lisent via `poll(agent)` et acquittent via `ack(agent, id)`.

CLI :
  python gateway.py enqueue --source orchestrateur --to marie --kind question \
                            --expect-reply --file corps.txt
  python gateway.py list
  python gateway.py drain [--dry-run]
  python gateway.py poll --agent orchestrateur
  python gateway.py ack --agent orchestrateur --id <id>
  python gateway.py route --author-id <id> --text "..."

Cibles (`--to`)  : marie | morpheus | channel
Types (`--kind`) : info | question | delivery
"""
import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import message_marie

DIR = Path(__file__).parent
GATEWAY = DIR / "gateway"
OUTBOX = GATEWAY / "outbox"
SENT = OUTBOX / "sent"
INBOX = GATEWAY / "inbox"
STATE = GATEWAY / "state.json"
CONV_LOG = DIR / "logs" / "conversation.jsonl"

TARGETS = ("marie", "morpheus", "channel")
KINDS = ("info", "question", "delivery")

AGENTS = ("orchestrateur", "design")

_TAG_RE = re.compile(r"^\s*@(?P<agent>[\w-]+)\s*:\s*(?P<reste>.*)$", re.DOTALL)

_HEURISTIQUE = {
    "design": ("design", "maquette", "ui", "interface", "couleur", "ecran", "écran",
               "bouton", "visuel", "typo", "police", "layout"),
    "orchestrateur": ("deploy", "déploie", "deploie", "version", "roadmap", "release",
                      "commit", "changelog", "netlify", "bundle"),
}

FRAME = message_marie.FRAME
MARIE_USER_ID = message_marie.MARIE_USER_ID
MORPHEUS_USER_ID = 651446274939420672  # morpheus5208, relevé dans logs/conversation.jsonl


class GatewayError(Exception):
    pass


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_dirs() -> None:
    for d in (OUTBOX, SENT, INBOX):
        d.mkdir(parents=True, exist_ok=True)


def _new_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%f")


def load_state() -> dict:
    if STATE.is_file():
        try:
            return json.loads(STATE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {"pending_reply": None}


def save_state(state: dict) -> None:
    _ensure_dirs()
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


# ------------------------------------------------------------------
# Sortie
# ------------------------------------------------------------------

def enqueue(source: str, to: str, body: str, *, kind: str = "info",
            expect_reply: bool = False, meta: dict | None = None) -> str:
    """Dépose une demande d'envoi dans l'outbox. Retourne l'id de la demande."""
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
    (OUTBOX / f"{req_id}.json").write_text(json.dumps({
        "id": req_id,
        "source": source,
        "to": to,
        "kind": kind,
        "body": body.strip(),
        "expect_reply": bool(expect_reply),
        "hold": False,
        "meta": meta or {},
        "created_at": _now(),
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    return req_id


def list_outbox() -> list[dict]:
    _ensure_dirs()
    out = []
    for path in sorted(OUTBOX.glob("*.json")):
        try:
            out.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            out.append({"id": path.stem, "error": "json invalide"})
    return out


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


def drain(send_fn=None, *, dry_run: bool = False) -> list[dict]:
    """
    Traite l'outbox du plus ancien au plus récent. Ignore les demandes `hold: true`.
    `send_fn(content, mention_user_ids) -> message_id`. Par défaut : POST Discord réel.
    """
    if send_fn is None:
        send_fn = _discord_post
    _ensure_dirs()
    state = load_state()
    results: list[dict] = []

    for path in sorted(OUTBOX.glob("*.json")):
        try:
            req = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            results.append({"id": path.stem, "status": "erreur", "detail": "json invalide"})
            continue

        if req.get("hold"):
            results.append({"id": req["id"], "status": "held"})
            continue

        try:
            content = curate(req["to"], req["kind"], req["body"])
        except GatewayError as e:
            results.append({"id": req["id"], "status": "erreur", "detail": str(e)})
            continue

        if dry_run:
            results.append({"id": req["id"], "status": "dry-run",
                            "to": req["to"], "content": content})
            continue

        msg_id = send_fn(content, _mention_ids(req["to"]))
        _log(req["source"], req["to"], content)

        if req.get("expect_reply"):
            state["pending_reply"] = {
                "source": req["source"], "to": req["to"], "since": _now(),
                "request_id": req["id"],
            }
            save_state(state)

        req["sent_at"] = _now()
        req["discord_message_id"] = str(msg_id)
        (SENT / path.name).write_text(json.dumps(req, ensure_ascii=False, indent=2),
                                     encoding="utf-8")
        path.unlink()
        results.append({"id": req["id"], "status": "sent", "discord_message_id": str(msg_id)})

    return results


# ------------------------------------------------------------------
# Entrée
# ------------------------------------------------------------------

def _classer_heuristique(content: str) -> str | None:
    low = (content or "").lower()
    for agent, mots in _HEURISTIQUE.items():
        if any(m in low for m in mots):
            return agent
    return None


def route_inbound(author_id, author_name: str, content: str) -> dict:
    """
    Route un message Discord entrant vers `inbox/<agent>/`, par ordre de priorité :
      1. tag explicite `@agent:` en tête (agent connu) ;
      2. réponse attendue (`state.pending_reply`) -> `inbox/<source>/`, purge du pending ;
      3. heuristique par mots-clés ;
      4. `inbox/unrouted/`.
    """
    _ensure_dirs()
    state = load_state()
    pending = state.get("pending_reply")

    routed_content = content
    reply_to = None
    purge = False

    m = _TAG_RE.match(content or "")
    if m and m.group("agent").lower() in AGENTS:
        target = m.group("agent").lower()
        routed_content = m.group("reste").strip()
        routing = "tag"
    elif pending:
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
    (dest / f"{msg_id}.json").write_text(json.dumps({
        "id": msg_id,
        "from_discord": {"author_id": author_id, "author_name": author_name},
        "content": routed_content,
        "raw_content": content,
        "routing": routing,
        "reply_to": reply_to,
        "received_at": _now(),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    if purge:
        state["pending_reply"] = None
        save_state(state)

    return {"routed_to": target, "id": msg_id, "routing": routing, "purged_pending": purge}


def poll(agent: str) -> list[dict]:
    """Retourne les messages en attente dans `inbox/<agent>/`, du plus ancien au plus récent."""
    _ensure_dirs()
    box = INBOX / agent
    if not box.is_dir():
        return []
    out = []
    for path in sorted(box.glob("*.json")):
        try:
            out.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            out.append({"id": path.stem, "error": "json invalide"})
    return out


def ack(agent: str, msg_id: str) -> bool:
    """Supprime un message inbox traité. Retourne False si le fichier n'existe pas."""
    path = INBOX / agent / f"{msg_id}.json"
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
    p_enq.add_argument("--source", required=True, help="agent demandeur (orchestrateur, design)")
    p_enq.add_argument("--to", required=True, choices=TARGETS)
    p_enq.add_argument("--kind", default="info", choices=KINDS)
    p_enq.add_argument("--expect-reply", action="store_true")
    g = p_enq.add_mutually_exclusive_group(required=True)
    g.add_argument("--text", help="corps du message")
    g.add_argument("--file", help="corps depuis un fichier UTF-8")
    g.add_argument("--stdin", action="store_true", help="corps sur stdin")

    sub.add_parser("list", help="lister l'outbox en attente")

    p_drn = sub.add_parser("drain", help="envoyer l'outbox (agent DISCORD uniquement)")
    p_drn.add_argument("--dry-run", action="store_true")

    p_poll = sub.add_parser("poll", help="lire l'inbox d'un agent")
    p_poll.add_argument("--agent", required=True)

    p_ack = sub.add_parser("ack", help="marquer un message inbox comme traité")
    p_ack.add_argument("--agent", required=True)
    p_ack.add_argument("--id", required=True)

    p_rte = sub.add_parser("route", help="router un message entrant (agent DISCORD / tests)")
    p_rte.add_argument("--author-id", required=True)
    p_rte.add_argument("--author-name", default="?")
    gr = p_rte.add_mutually_exclusive_group(required=True)
    gr.add_argument("--text")
    gr.add_argument("--stdin", action="store_true")

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
            flag = " [HOLD]" if it.get("hold") else ""
            reply = " [réponse attendue]" if it.get("expect_reply") else ""
            print(f"- {it.get('id')} {it.get('source')} -> {it.get('to')} "
                  f"({it.get('kind')}){flag}{reply}")
            print(f"    {(it.get('body') or '')[:120].splitlines()[0] if it.get('body') else ''}")

    elif args.cmd == "drain":
        for r in drain(dry_run=args.dry_run):
            if r["status"] == "dry-run":
                print(f"--- {r['id']} -> {r['to']} (dry-run) ---\n{r['content']}\n")
            else:
                print(f"- {r['id']} : {r['status']} "
                      f"{r.get('discord_message_id') or r.get('detail') or ''}")

    elif args.cmd == "poll":
        items = poll(args.agent)
        if not items:
            print(f"inbox/{args.agent} vide.")
            return
        for it in items:
            auteur = it.get("from_discord", {}).get("author_name", "?")
            print(f"- {it.get('id')} de {auteur} [{it.get('routing')}]")
            print(f"    {(it.get('content') or '').splitlines()[0][:200] if it.get('content') else ''}")

    elif args.cmd == "ack":
        print("supprimé" if ack(args.agent, args.id) else "introuvable")

    elif args.cmd == "route":
        txt = sys.stdin.read() if args.stdin else args.text
        res = route_inbound(args.author_id, args.author_name, txt)
        print(f"routé vers {res['routed_to']} ({res['routing']}) : {res['id']} "
              f"— pending purgé : {res['purged_pending']}")


if __name__ == "__main__":
    _main()
