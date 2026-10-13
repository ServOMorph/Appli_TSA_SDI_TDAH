"""Surveille les retours testeur : sort des qu'un retour est a traiter, pour reveiller l'agent.

Toutes les 30 minutes (--interval), interroge la meme liste que `reply_feedback_report.py` : retours
ouverts sans reponse d'agent, ou dont le dernier message vient du testeur. Les retours masques par
un etat (feedback_state.py : en_roadmap, attend_decision, attend_testeur) n'en font pas partie,
sauf si le testeur a ecrit depuis la pose de l'etat.

Des qu'un retour a traiter apparait, le script affiche la liste en JSON sur stdout et sort avec le
code 10. Lance en tache de fond, sa fin reveille l'agent, qui lance alors /traiter_retours.
Le script ne depose, ne met en file et ne modifie jamais rien : lecture seule.

--ignorer-existants : le premier controle sert de reference ; seuls les retours ou messages
apparus ensuite declenchent la sortie (a utiliser quand des retours attendent une decision).

Codes de sortie : 10 = retour(s) a traiter, 1 = erreur persistante (reseau ou identifiants),
0 = --une-fois sans rien de nouveau.

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY ; la cle n'est jamais affichee.
"""

import argparse
import json
import sys
import time
from datetime import datetime

from _supabase import SupabaseError, read_credentials
from reply_feedback_report import is_hidden_by_state, list_reports_needing_reply

EXIT_TO_PROCESS = 10
MAX_CONSECUTIVE_ERRORS = 6


def entry_key(entry: dict) -> str:
    last = entry.get("last_message")
    return f"{entry['id']}|{last['created_at'] if last else ''}"


def actionable(reports: list[dict]) -> list[dict]:
    return [r for r in reports if not is_hidden_by_state(r)]


def new_entries(reports: list[dict], baseline: set[str]) -> list[dict]:
    return [r for r in actionable(reports) if entry_key(r) not in baseline]


def log(message: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}", file=sys.stderr, flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--interval", type=int, default=1800, help="Secondes entre deux controles (defaut : 1800)")
    parser.add_argument("--une-fois", action="store_true", help="Un seul controle, puis sortie")
    parser.add_argument("--ignorer-existants", action="store_true", help="Ne reagir qu'a ce qui apparait apres le premier controle")
    return parser.parse_args()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    baseline: set[str] = set()
    first = True
    errors = 0
    while True:
        try:
            url, service_key = read_credentials()
            reports = list_reports_needing_reply(url, service_key)
            errors = 0
        except (SupabaseError, OSError) as e:
            errors += 1
            log(f"ERREUR ({errors}/{MAX_CONSECUTIVE_ERRORS}) : {e}")
            if errors >= MAX_CONSECUTIVE_ERRORS:
                print(f"ERREUR: {MAX_CONSECUTIVE_ERRORS} controles consecutifs en echec.", file=sys.stderr)
                return 1
        else:
            if first and args.ignorer_existants:
                baseline = {entry_key(r) for r in actionable(reports)}
                log(f"{len(baseline)} retour(s) existant(s) ignore(s).")
            else:
                found = new_entries(reports, baseline)
                if found:
                    print(json.dumps(found, ensure_ascii=False, indent=2))
                    log(f"{len(found)} retour(s) a traiter.")
                    return EXIT_TO_PROCESS
                log("Rien de nouveau.")
            first = False
        if args.une_fois:
            return 0
        time.sleep(args.interval)


if __name__ == "__main__":
    raise SystemExit(main())
