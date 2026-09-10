"""
Détecte les messages de Marie tombés dans l'angle mort du rattrapage `bot.py`
(`rattraper_messages_manques()`) : @-mentionnés pendant que le bot était hors service,
journalisés dans `conversation.jsonl` mais jamais routés vers une inbox (aucune commande
n'est rejouée après coup — cf. `bot.py` § Rattrapage).

Source : `logs/commandes_non_rejouees.jsonl`, écrit par `bot.py` pour chaque commande
non rejouée (tout auteur). Un marqueur local (`logs/commandes_non_rejouees_signalees.json`)
retient le `ts` de la dernière entrée déjà signalée, pour ne présenter que le nouveau à
chaque appel.

Usage :
  python DISCORD/discord_com/marie_non_traites.py            # signale et marque comme vu
  python DISCORD/discord_com/marie_non_traites.py --dry-run   # signale sans marquer

Sortie : JSON {"messages": [...]} sur stdout.
"""
import argparse
import json
import sys
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

DIR = Path(__file__).parent
sys.path.insert(0, str(DIR))
import gateway  # noqa: E402  (MARIE_USER_ID)

LOG = DIR / "logs" / "commandes_non_rejouees.jsonl"
MARKER = DIR / "logs" / "commandes_non_rejouees_signalees.json"


def _lire_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    lignes = []
    for ligne in path.read_text(encoding="utf-8").splitlines():
        ligne = ligne.strip()
        if ligne:
            lignes.append(json.loads(ligne))
    return lignes


def messages_non_traites() -> list[dict]:
    marker = json.loads(MARKER.read_text(encoding="utf-8")) if MARKER.exists() else {}
    dernier_signale = marker.get("dernier_ts_signale")

    entrees = _lire_jsonl(LOG)
    return [e for e in entrees
            if e.get("author_id") == gateway.MARIE_USER_ID
            and (dernier_signale is None or e["ts"] > dernier_signale)]


def marquer_signale(entrees: list[dict]) -> None:
    dernier_ts = max(e["ts"] for e in entrees)
    MARKER.write_text(json.dumps({"dernier_ts_signale": dernier_ts}, ensure_ascii=False, indent=2),
                       encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    resultats = messages_non_traites()
    print(json.dumps({"messages": resultats}, ensure_ascii=False, indent=2))

    if resultats and not args.dry_run:
        marquer_signale(resultats)


if __name__ == "__main__":
    main()
