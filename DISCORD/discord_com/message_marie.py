"""
Transport bas niveau : envoie un message Discord à Marie (Rayonne Toi), en la taguant.

DEPUIS 2026-09-02 : appelé uniquement par la gateway DISCORD (`gateway.py`) et l'agent DISCORD.
Les autres agents (orchestrateur, design) NE l'appellent plus directement — ils déposent leur
demande dans `DISCORD/discord_com/gateway/outbox/`. Voir `gateway/README.md`.

La gateway importe ce module et appelle `_read_token` / `_read_channel_id` / `_send`. La CLI, elle,
refuse tout envoi réel sans `--force` (réservé à l'agent DISCORD) ; `--dry-run` reste libre.

Indépendant de `bot.py` : poste directement via l'API REST Discord avec le token du bot
(`DISCORD_BOT_TOKEN` dans `DISCORD/discord_com/.env`, jamais affiché). Respecte le modèle des
messages pour Marie : tag en tête, encadrement `💻🤖`, contenu fourni tel quel par l'appelant
(ton court, concret, sans jargon, avec la forme de réponse attendue — à la charge du rédacteur).

Usage :
  python DISCORD/discord_com/message_marie.py "Texte du message"
  python DISCORD/discord_com/message_marie.py --file chemin/vers/message.txt
  echo "Texte" | python DISCORD/discord_com/message_marie.py --stdin
  python DISCORD/discord_com/message_marie.py --file msg.txt --dry-run   # n'envoie rien

Options :
  --file PATH   lit le corps du message depuis un fichier UTF-8 (recommandé pour le multi-ligne)
  --stdin       lit le corps du message sur l'entrée standard
  --no-frame    n'ajoute pas l'encadrement 💻🤖
  --no-tag      n'ajoute pas le tag de Marie en tête
  --dry-run     affiche le contenu final et sort sans rien envoyer
  --force       autorise un envoi réel via la CLI (agent DISCORD / débogage uniquement ;
                le chemin normal est gateway.py)

Sortie : identifiant du message posté, ou une ligne d'erreur explicite + code 1.
"""
import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# Console Windows souvent en cp1252 : forcer UTF-8 pour l'affichage (emoji, guillemets français).
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

DIR = Path(__file__).parent
ENV_FILE = DIR / ".env"
CONFIG_FILE = DIR / "config_bot_discord.json"
CONV_LOG = DIR / "logs" / "conversation.jsonl"

# Marie sur Discord : rayonnetoi_59304 / « Rayonne Toi ».
# id relevé dans DISCORD/discord_com/commands.json et logs/conversation.jsonl.
MARIE_USER_ID = 1368654289584656394

FRAME = "💻🤖"
API = "https://discord.com/api/v10"


def _read_token() -> str:
    if not ENV_FILE.is_file():
        raise SystemExit(f"Erreur : {ENV_FILE} introuvable. Créer le fichier depuis .env.example.")
    for raw in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        if key.strip() == "DISCORD_BOT_TOKEN":
            token = value.strip().strip('"').strip("'")
            if not token or token == "colle_ton_token_ici":
                raise SystemExit("Erreur : DISCORD_BOT_TOKEN vide dans .env.")
            return token
    raise SystemExit("Erreur : DISCORD_BOT_TOKEN absent de .env.")


def _read_channel_id() -> int:
    if not CONFIG_FILE.is_file():
        raise SystemExit(f"Erreur : {CONFIG_FILE} introuvable.")
    cfg = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    if not cfg.get("enabled", False):
        raise SystemExit("Erreur : Discord désactivée (enabled: false dans config_bot_discord.json).")
    channel_id = cfg.get("channel_id")
    if not channel_id:
        raise SystemExit("Erreur : channel_id absent de config_bot_discord.json.")
    return int(channel_id)


def _compose(body: str, *, tag: bool, frame: bool) -> str:
    body = body.strip()
    if not body:
        raise SystemExit("Erreur : message vide.")
    parts = []
    if frame:
        parts.append(FRAME)
    if tag:
        parts.append(f"<@{MARIE_USER_ID}>")
    parts.append(body)
    if frame:
        parts.append(FRAME)
    text = "\n".join(parts)
    if len(text) > 2000:
        raise SystemExit(f"Erreur : message de {len(text)} caractères, limite Discord = 2000.")
    return text


def _log(content: str) -> None:
    try:
        CONV_LOG.parent.mkdir(exist_ok=True)
        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "sens": "bot",
            "author": "message_marie.py",
            "author_id": None,
            "role": "SCRIPT",
            "content": content,
        }
        with CONV_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:  # journalisation non bloquante
        print(f"(log conversation ignoré : {e})", file=sys.stderr)


def _send(token: str, channel_id: int, content: str, allowed_user_ids=None) -> str:
    if allowed_user_ids is None:
        allowed_user_ids = [str(MARIE_USER_ID)]
    payload = json.dumps(
        {"content": content, "allowed_mentions": {"users": [str(u) for u in allowed_user_ids]}}
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{API}/channels/{channel_id}/messages",
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json",
            "User-Agent": "appli-tsa-message-marie/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return str(data.get("id", "?"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        raise SystemExit(f"Erreur HTTP {e.code} à l'envoi Discord : {detail}")
    except urllib.error.URLError as e:
        raise SystemExit(f"Erreur réseau à l'envoi Discord : {e.reason}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Envoie un message Discord à Marie.")
    parser.add_argument("text", nargs="?", help="corps du message (sinon --file ou --stdin)")
    parser.add_argument("--file", help="lire le corps depuis un fichier UTF-8")
    parser.add_argument("--stdin", action="store_true", help="lire le corps sur stdin")
    parser.add_argument("--no-frame", action="store_true", help="sans encadrement 💻🤖")
    parser.add_argument("--no-tag", action="store_true", help="sans tag de Marie")
    parser.add_argument("--dry-run", action="store_true", help="afficher sans envoyer")
    parser.add_argument("--force", action="store_true",
                        help="autoriser un envoi réel via la CLI (agent DISCORD uniquement)")
    args = parser.parse_args()

    if not args.dry_run and not args.force:
        raise SystemExit(
            "Erreur : envoi CLI direct bloqué. Le chemin normal est la gateway "
            "(gateway.py enqueue). Pour un envoi manuel par l'agent DISCORD : --force. "
            "Contrôle du rendu sans envoi : --dry-run."
        )

    sources = [bool(args.text), bool(args.file), args.stdin]
    if sum(sources) != 1:
        raise SystemExit("Erreur : fournir exactement une source (texte, --file ou --stdin).")

    if args.file:
        body = Path(args.file).read_text(encoding="utf-8")
    elif args.stdin:
        body = sys.stdin.read()
    else:
        body = args.text

    content = _compose(body, tag=not args.no_tag, frame=not args.no_frame)

    if args.dry_run:
        print("--- message (dry-run, non envoyé) ---")
        print(content)
        print("-------------------------------------")
        return

    token = _read_token()
    channel_id = _read_channel_id()
    message_id = _send(token, channel_id, content)
    _log(content)
    print(f"Message envoyé à Marie (id {message_id}).")


if __name__ == "__main__":
    main()
