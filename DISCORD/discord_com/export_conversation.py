"""
Exporte la conversation du channel Discord en transcript texte lisible,
prêt à être analysé par un agent IA.

Source : logs/backfill.jsonl (historique rapatrié une fois) + logs/conversation.jsonl
         (flux temps réel). Les deux sont fusionnés et triés par timestamp.

Usage :
  python export_conversation.py                  → écrit logs/transcript.txt
  python export_conversation.py chemin/sortie.txt
"""
import json
import sys
from pathlib import Path

DIR = Path(__file__).parent
LOGS_DIR = DIR / "logs"
SOURCES = [LOGS_DIR / "backfill.jsonl", LOGS_DIR / "conversation.jsonl"]


def charger() -> list[dict]:
    entries: list[dict] = []
    seen: set[tuple] = set()
    for src in SOURCES:
        if not src.exists():
            continue
        for line in src.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
            except json.JSONDecodeError:
                continue
            cle = (e.get("ts"), e.get("author"), e.get("content"))
            if cle in seen:
                continue
            seen.add(cle)
            entries.append(e)
    entries.sort(key=lambda e: e.get("ts", ""))
    return entries


def formater(entries: list[dict]) -> str:
    lignes = []
    for e in entries:
        ts = e.get("ts", "")
        if e.get("sens") == "bot":
            qui = "Claude"
        else:
            qui = e.get("author", "?")
            role = e.get("role")
            if role:
                qui += f" ({role})"
        contenu = (e.get("content") or "").rstrip()
        lignes.append(f"[{ts}] {qui}:\n{contenu}\n")
    return "\n".join(lignes)


def main():
    sortie = Path(sys.argv[1]) if len(sys.argv) > 1 else LOGS_DIR / "transcript.txt"
    entries = charger()
    sortie.parent.mkdir(exist_ok=True)
    sortie.write_text(formater(entries), encoding="utf-8")
    print(f"{len(entries)} messages -> {sortie}")


if __name__ == "__main__":
    main()
