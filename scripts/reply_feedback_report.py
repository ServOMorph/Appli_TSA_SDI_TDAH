"""Liste les retours ouverts necessitant une reponse d'agent, affiche le fil complet d'un retour,
ou depose la reponse de l'agent sur un retour. Un retour necessite une reponse s'il n'a encore
aucun message, ou si son dernier message vient du testeur (premiere reponse, ou relance apres une
reponse d'agent). Un retour dont la reponse est en attente de deploiement est exclu, sauf si le
testeur a relance apres la mise en attente (il est alors marque `reponse_en_attente`).

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement.
La cle service_role n'est jamais affichee ni ecrite par ce script.

Regle de redaction (voir .claude/CLAUDE.md, section Specificites projet) : reponse synthetique,
sans jargon, sans nom de fichier ni de commit, une idee par phrase. Ce script ne clot jamais un
retour a la place du testeur : deposer une reponse n'appelle pas close_feedback_report.

Un retour dont le correctif n'est pas encore deploye ne doit pas passer par ce script directement
(cf. queue_pending_feedback_reply.py) : la reponse resterait visible pour le testeur avant que le
code ne soit reellement en production.

Un retour porteur d'un etat (feedback_state.py : en roadmap, decision ou reponse du testeur
attendue) est masque du listing, sauf si le testeur a ecrit apres la pose de cet etat ; --tous
l'affiche quand meme. Deposer une reponse retire l'etat du retour.
"""

import argparse
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

from _supabase import SupabaseError, fetch_rows, insert_row, read_credentials
from feedback_state import FeedbackStateError, clear_state, read_state, write_json_atomic

QUEUE_FILE = Path(__file__).resolve().parent.parent / "_contexte" / "reponses_retours_en_attente_deploiement.json"


class ReportResolvedError(SupabaseError):
    """Le retour a deja ete valide par le testeur : plus aucune reponse ne doit y etre deposee."""


def read_queue() -> list[dict]:
    if not QUEUE_FILE.exists():
        return []
    return json.loads(QUEUE_FILE.read_text(encoding="utf-8"))


def write_queue(entries: list[dict]) -> None:
    write_json_atomic(QUEUE_FILE, entries)


def read_body(body: str | None, body_file: str | None) -> str | None:
    if body is not None and body_file is not None:
        raise SupabaseError("--body et --body-file sont exclusifs")
    if body_file is not None:
        return Path(body_file).read_text(encoding="utf-8")
    return body


def queued_at_by_report() -> dict[str, str | None]:
    return {e["report_id"]: e.get("queued_at") for e in read_queue()}


def parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def build_open_reports_query(device_ids: list[str] | None = None) -> str:
    query = "select=id,device_id,screen_code,comment,created_at&resolved_at=is.null&order=created_at.asc"
    if device_ids:
        ids = ",".join(quote(device_id, safe="-") for device_id in device_ids)
        query += f"&device_id=in.({ids})"
    return query


def build_report_messages_query(report_ids: list[str]) -> str:
    ids = ",".join(quote(report_id, safe="-") for report_id in report_ids)
    return f"select=report_id,author,body,created_at&report_id=in.({ids})&order=created_at.asc"


def build_tester_devices_query(tester_code: str) -> str:
    code = quote(tester_code.strip(), safe="")
    return f"select=device_id&payload->settings->>tester_code=ilike.{code}"


def resolve_tester_devices(url: str, service_key: str, tester_code: str) -> list[str]:
    rows = fetch_rows(url, service_key, "device_snapshots", build_tester_devices_query(tester_code))
    return sorted({row["device_id"] for row in rows})


def needs_reply(last_message: dict | None, queued_at: str | None, is_queued: bool) -> bool:
    if last_message is not None and last_message["author"] == "agent":
        return False
    if not is_queued:
        return True
    # Relance du testeur posterieure a la mise en attente : a relire, la reponse en file est peut-etre obsolete.
    if last_message is None:
        return False
    # Entree sans horodatage : impossible de dater la relance, on la remonte plutot que de la perdre.
    if queued_at is None:
        return True
    return parse_timestamp(last_message["created_at"]) > parse_timestamp(queued_at)


def is_hidden_by_state(entry: dict) -> bool:
    return "etat" in entry and not entry.get("relance_depuis_etat")


def list_reports_needing_reply(url: str, service_key: str, device_ids: list[str] | None = None) -> list[dict]:
    reports = fetch_rows(url, service_key, "feedback_reports", build_open_reports_query(device_ids))
    if not reports:
        return []
    messages = fetch_rows(
        url, service_key, "feedback_messages", build_report_messages_query([r["id"] for r in reports])
    )
    # Messages tries par date croissante : la derniere ecriture par retour est bien son dernier message.
    last_message: dict[str, dict] = {}
    for message in messages:
        last_message[message["report_id"]] = message
    queued = queued_at_by_report()
    try:
        state = read_state()
    except FeedbackStateError as e:
        print(f"AVERTISSEMENT: {e} ; etats ignores.", file=sys.stderr)
        state = {}
    result = []
    for report in reports:
        last = last_message.get(report["id"])
        is_queued = report["id"] in queued
        if not needs_reply(last, queued.get(report["id"]), is_queued):
            continue
        entry = dict(report)
        entry["last_message"] = last
        if is_queued:
            entry["reponse_en_attente"] = True
        report_state = state.get(report["id"])
        if report_state:
            entry["etat"] = report_state
            updated_at = report_state.get("updated_at")
            entry["relance_depuis_etat"] = bool(
                last
                and last["author"] != "agent"
                and (not updated_at or parse_timestamp(last["created_at"]) > parse_timestamp(updated_at))
            )
        result.append(entry)
    return result


def find_report(url: str, service_key: str, report_id: str) -> dict:
    query = f"select=id,device_id,screen_code,comment,created_at,resolved_at&id=eq.{quote(report_id, safe='-')}"
    rows = fetch_rows(url, service_key, "feedback_reports", query)
    if not rows:
        raise SupabaseError(f"retour introuvable : {report_id}")
    return rows[0]


def read_thread(url: str, service_key: str, report_id: str) -> dict:
    report = find_report(url, service_key, report_id)
    messages = fetch_rows(url, service_key, "feedback_messages", build_report_messages_query([report_id]))
    return {"report": report, "messages": messages}


def deposit_reply(url: str, service_key: str, report_id: str, body: str) -> dict:
    body = body.strip()
    if not body:
        raise SupabaseError("la reponse ne peut pas etre vide")
    report = find_report(url, service_key, report_id)
    if report.get("resolved_at"):
        raise ReportResolvedError(f"retour deja valide par le testeur : {report_id}")
    message = {
        "id": str(uuid.uuid4()),
        "report_id": report_id,
        "device_id": report["device_id"],
        "author": "agent",
        "body": body,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    inserted = insert_row(url, service_key, "feedback_messages", message)
    try:
        clear_state(report_id)
    except FeedbackStateError as e:
        print(f"AVERTISSEMENT: reponse deposee, mais l'etat n'a pas ete retire : {e}", file=sys.stderr)
    return inserted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-id", help="Identifiant du retour a traiter")
    parser.add_argument("--body", help="Texte de la reponse (utilise avec --report-id)")
    parser.add_argument("--body-file", help="Fichier UTF-8 contenant le texte de la reponse (a la place de --body)")
    parser.add_argument("--thread", metavar="REPORT_ID", help="Afficher le retour et tout son fil de messages")
    parser.add_argument("--device-id", help="Limiter la liste aux retours d'un appareil")
    parser.add_argument("--tester", help="Limiter la liste aux retours des appareils d'un code testeur")
    parser.add_argument("--tous", action="store_true", help="Inclure les retours masques par leur etat")
    return parser.parse_args()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    try:
        body = read_body(args.body, args.body_file)
        if bool(args.report_id) != (body is not None):
            print("ERREUR: --report-id et --body (ou --body-file) doivent etre fournis ensemble.", file=sys.stderr)
            return 1
        if args.report_id and not body.strip():
            print("ERREUR: la reponse ne peut pas etre vide.", file=sys.stderr)
            return 1
        url, service_key = read_credentials()
        if args.report_id:
            message = deposit_reply(url, service_key, args.report_id, body)
            print(json.dumps(message, ensure_ascii=False, indent=2))
            return 0
        if args.thread:
            print(json.dumps(read_thread(url, service_key, args.thread), ensure_ascii=False, indent=2))
            return 0
        device_ids = [args.device_id] if args.device_id else None
        if args.tester:
            device_ids = resolve_tester_devices(url, service_key, args.tester)
            if not device_ids:
                print(f"Aucun appareil trouve pour le code testeur : {args.tester}.")
                return 0
        reports = list_reports_needing_reply(url, service_key, device_ids)
        hidden = [r for r in reports if is_hidden_by_state(r)]
        if not args.tous:
            reports = [r for r in reports if not is_hidden_by_state(r)]
            if hidden:
                print(f"{len(hidden)} retour(s) masque(s) par leur etat (--tous pour les afficher).", file=sys.stderr)
        if not reports:
            print("Aucun retour necessitant une reponse.")
            return 0
        print(json.dumps(reports, ensure_ascii=False, indent=2))
        return 0
    except (SupabaseError, OSError) as e:
        print(f"ERREUR: {e}.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
