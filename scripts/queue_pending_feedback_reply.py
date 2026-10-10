"""Met en attente la reponse d'agent a un retour testeur dont le correctif n'est pas encore
deploye, au lieu de la deposer directement sur Supabase (visible immediatement dans le fil du
testeur, meme si le code corrige n'est pas encore en production). Utilise par /traiter_retours.md
a la place d'un appel direct a reply_feedback_report.py --report-id --body (voir CLAUDE.md,
section Reponses aux retours testeurs).

/deploy republie ensuite les entrees de ce fichier (scripts/republish_pending_feedback_replies.py)
juste apres le smoke test post-deploiement, une fois le correctif reellement en production.

Modes : ajout (--report-id --body), remplacement d'une reponse deja en attente (--replace),
retrait (--remove --report-id), affichage de la file (--list). Seuls l'ajout et le remplacement
interrogent Supabase (verification que le retour existe et n'est pas deja valide par le testeur) :
ils necessitent SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement. La cle
service_role n'est jamais affichee ni ecrite par ce script.
"""

import argparse
import json
import sys
from datetime import datetime, timezone

from _supabase import SupabaseError, read_credentials
from reply_feedback_report import QUEUE_FILE, find_report, read_queue


def write_queue(entries: list[dict]) -> None:
    QUEUE_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def queue_reply(report_id: str, screen_code: str, body: str, replace: bool = False) -> None:
    body = body.strip()
    if not body:
        raise SupabaseError("la reponse ne peut pas etre vide")
    entries = read_queue()
    already = any(e["report_id"] == report_id for e in entries)
    if already and not replace:
        raise SupabaseError(f"une reponse est deja en attente pour ce retour (utiliser --replace) : {report_id}")
    if replace and not already:
        raise SupabaseError(f"aucune reponse en attente a remplacer pour ce retour : {report_id}")
    entries = [e for e in entries if e["report_id"] != report_id]
    entries.append({
        "report_id": report_id,
        "screen_code": screen_code,
        "body": body,
        "queued_at": datetime.now(timezone.utc).isoformat(),
    })
    write_queue(entries)


def remove_reply(report_id: str) -> None:
    entries = read_queue()
    remaining = [e for e in entries if e["report_id"] != report_id]
    if len(remaining) == len(entries):
        raise SupabaseError(f"aucune reponse en attente pour ce retour : {report_id}")
    write_queue(remaining)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-id", help="Identifiant du retour a traiter")
    parser.add_argument("--body", help="Texte de la reponse")
    parser.add_argument("--replace", action="store_true", help="Remplacer la reponse deja en attente")
    parser.add_argument("--remove", action="store_true", help="Retirer la reponse en attente du retour")
    parser.add_argument("--list", action="store_true", help="Afficher les reponses en attente")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.list:
            entries = read_queue()
            print(json.dumps(entries, ensure_ascii=False, indent=2) if entries else "Aucune reponse en attente.")
            return 0
        if not args.report_id:
            print("ERREUR: --report-id est requis (sauf avec --list).", file=sys.stderr)
            return 1
        if args.remove:
            remove_reply(args.report_id)
            print(f"Reponse en attente retiree pour {args.report_id}.")
            return 0
        if not args.body:
            print("ERREUR: --body est requis pour mettre une reponse en attente.", file=sys.stderr)
            return 1
        url, service_key = read_credentials()
        report = find_report(url, service_key, args.report_id)
        if report.get("resolved_at"):
            print(f"ERREUR: retour deja valide par le testeur : {args.report_id}.", file=sys.stderr)
            return 1
        queue_reply(args.report_id, report.get("screen_code", ""), args.body, replace=args.replace)
        action = "remplacee" if args.replace else "mise en attente"
        print(f"Reponse {action} pour {args.report_id} (publiee au prochain /deploy).")
        return 0
    except SupabaseError as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
