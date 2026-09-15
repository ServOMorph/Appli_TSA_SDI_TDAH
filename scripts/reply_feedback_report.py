"""Liste les retours ouverts necessitant une reponse d'agent, ou depose la reponse de l'agent sur
un retour. Un retour necessite une reponse s'il n'a encore aucun message, ou si son dernier message
vient du testeur (premiere reponse, ou relance apres une reponse d'agent).

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement.
La cle service_role n'est jamais affichee ni ecrite par ce script.

Regle de redaction (voir .claude/CLAUDE.md, section Specificites projet) : reponse synthetique,
sans jargon, sans nom de fichier ni de commit, une idee par phrase. Ce script ne clot jamais un
retour a la place du testeur : deposer une reponse n'appelle pas close_feedback_report.
"""

import argparse
import json
import sys
import uuid
from datetime import datetime, timezone
from urllib.parse import quote

from _supabase import SupabaseError, fetch_rows, insert_row, read_credentials


def build_open_reports_query() -> str:
    return (
        "select=id,device_id,screen_code,comment,created_at"
        "&resolved_at=is.null&order=created_at.asc"
    )


def build_report_messages_query(report_ids: list[str]) -> str:
    ids = ",".join(quote(report_id, safe="-") for report_id in report_ids)
    return f"select=report_id,author,created_at&report_id=in.({ids})&order=created_at.asc"


def list_reports_needing_reply(url: str, service_key: str) -> list[dict]:
    reports = fetch_rows(url, service_key, "feedback_reports", build_open_reports_query())
    if not reports:
        return []
    messages = fetch_rows(
        url, service_key, "feedback_messages", build_report_messages_query([r["id"] for r in reports])
    )
    # Messages tries par date croissante : la derniere ecriture par retour est bien son dernier message.
    last_author: dict[str, str] = {}
    for message in messages:
        last_author[message["report_id"]] = message["author"]
    return [r for r in reports if last_author.get(r["id"]) != "agent"]


def find_report(url: str, service_key: str, report_id: str) -> dict:
    query = f"select=id,device_id,resolved_at&id=eq.{quote(report_id, safe='-')}"
    rows = fetch_rows(url, service_key, "feedback_reports", query)
    if not rows:
        raise SupabaseError(f"retour introuvable : {report_id}")
    return rows[0]


def deposit_reply(url: str, service_key: str, report_id: str, body: str) -> dict:
    body = body.strip()
    if not body:
        raise SupabaseError("la reponse ne peut pas etre vide")
    report = find_report(url, service_key, report_id)
    if report.get("resolved_at"):
        raise SupabaseError(f"retour deja valide par le testeur : {report_id}")
    message = {
        "id": str(uuid.uuid4()),
        "report_id": report_id,
        "device_id": report["device_id"],
        "author": "agent",
        "body": body,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return insert_row(url, service_key, "feedback_messages", message)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-id", help="Identifiant du retour a traiter")
    parser.add_argument("--body", help="Texte de la reponse (utilise avec --report-id)")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if bool(args.report_id) != bool(args.body):
        print("ERREUR: --report-id et --body doivent etre fournis ensemble.", file=sys.stderr)
        return 1
    try:
        url, service_key = read_credentials()
        if args.report_id:
            message = deposit_reply(url, service_key, args.report_id, args.body)
            print(json.dumps(message, ensure_ascii=False, indent=2))
            return 0
        reports = list_reports_needing_reply(url, service_key)
        if not reports:
            print("Aucun retour necessitant une reponse.")
            return 0
        print(json.dumps(reports, ensure_ascii=False, indent=2))
        return 0
    except SupabaseError as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
