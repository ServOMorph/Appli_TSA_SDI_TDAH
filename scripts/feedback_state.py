"""Etat de traitement des retours testeur deja analyses par /traiter_retours, pour ne pas les
reproposer a chaque passage : retour planifie dans une roadmap, en attente d'une decision produit,
ou en attente d'une reponse du testeur a une question posee dans son fil.

reply_feedback_report.py masque un retour porteur d'un etat, sauf si le testeur a ecrit apres la
pose de cet etat (relance a relire). L'etat est retire automatiquement quand une reponse est mise
en file ou deposee pour ce retour. Fichier local, aucun appel reseau.
"""

import argparse
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

STATE_FILE = Path(__file__).resolve().parent.parent / "_contexte" / "etat_retours.json"
STATUSES = ("en_roadmap", "attend_decision", "attend_testeur")


class FeedbackStateError(Exception):
    pass


def write_json_atomic(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise


def read_state() -> dict[str, dict]:
    if not STATE_FILE.exists():
        return {}
    try:
        state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except ValueError as e:
        raise FeedbackStateError(f"{STATE_FILE.name} illisible ({e}) : le reparer ou le supprimer") from e
    if not isinstance(state, dict):
        raise FeedbackStateError(f"{STATE_FILE.name} invalide : un objet JSON est attendu")
    return state


def set_state(report_id: str, status: str, ref: str, note: str = "") -> dict:
    if status not in STATUSES:
        raise FeedbackStateError(f"statut inconnu : {status} (attendus : {', '.join(STATUSES)})")
    if not ref.strip():
        raise FeedbackStateError("--ref est requis (roadmap et phase, ou question posee)")
    state = read_state()
    entry = {
        "statut": status,
        "ref": ref.strip(),
        "note": note.strip(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    state[report_id] = entry
    write_json_atomic(STATE_FILE, state)
    return entry


def clear_state(report_id: str) -> bool:
    state = read_state()
    if report_id not in state:
        return False
    del state[report_id]
    write_json_atomic(STATE_FILE, state)
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-id", help="Identifiant du retour")
    parser.add_argument("--set", choices=STATUSES, metavar="STATUT", help=f"Poser un etat : {', '.join(STATUSES)}")
    parser.add_argument("--ref", default="", help="Reference : roadmap et phase, ou question posee")
    parser.add_argument("--note", default="", help="Precision libre")
    parser.add_argument("--clear", action="store_true", help="Retirer l'etat du retour")
    parser.add_argument("--list", action="store_true", help="Afficher les etats")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.list:
            state = read_state()
            print(json.dumps(state, ensure_ascii=False, indent=2) if state else "Aucun etat de retour.")
            return 0
        if not args.report_id or bool(args.set) == args.clear:
            print("ERREUR: --report-id avec --set STATUT --ref ... ou --clear (ou --list seul).", file=sys.stderr)
            return 1
        if args.clear:
            if not clear_state(args.report_id):
                print(f"ERREUR: aucun etat pour ce retour : {args.report_id}.", file=sys.stderr)
                return 1
            print(f"Etat retire pour {args.report_id}.")
            return 0
        set_state(args.report_id, args.set, args.ref, args.note)
        print(f"Etat {args.set} pose pour {args.report_id}.")
        return 0
    except FeedbackStateError as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
