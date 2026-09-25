"""Met en attente la reponse d'agent a un retour testeur dont le correctif n'est pas encore
deploye, au lieu de la deposer directement sur Supabase (visible immediatement dans le fil du
testeur, meme si le code corrige n'est pas encore en production). Utilise par /traiter_retours.md
a la place d'un appel direct a reply_feedback_report.py --report-id --body (voir CLAUDE.md,
section Reponses aux retours testeurs).

/deploy republie ensuite les entrees de ce fichier (scripts/republish_pending_feedback_replies.py)
juste apres le smoke test post-deploiement, une fois le correctif reellement en production.

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement (verification que le
retour existe et n'est pas deja valide par le testeur). La cle service_role n'est jamais affichee
ni ecrite par ce script.
"""

import argparse
import json
import sys

from _supabase import SupabaseError, read_credentials
from reply_feedback_report import QUEUE_FILE, find_report


def queue_reply(report_id: str, screen_code: str, body: str) -> None:
    body = body.strip()
    if not body:
        raise SupabaseError("la reponse ne peut pas etre vide")
    entries = json.loads(QUEUE_FILE.read_text(encoding="utf-8")) if QUEUE_FILE.exists() else []
    if any(e["report_id"] == report_id for e in entries):
        raise SupabaseError(f"une reponse est deja en attente pour ce retour : {report_id}")
    entries.append({"report_id": report_id, "screen_code": screen_code, "body": body})
    QUEUE_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-id", required=True, help="Identifiant du retour a traiter")
    parser.add_argument("--body", required=True, help="Texte de la reponse")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        url, service_key = read_credentials()
        report = find_report(url, service_key, args.report_id)
        if report.get("resolved_at"):
            print(f"ERREUR: retour deja valide par le testeur : {args.report_id}.", file=sys.stderr)
            return 1
        queue_reply(args.report_id, report.get("screen_code", ""), args.body)
        print(f"Reponse mise en attente pour {args.report_id} (publiee au prochain /deploy).")
        return 0
    except SupabaseError as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
