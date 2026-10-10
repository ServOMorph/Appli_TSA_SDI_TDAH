"""Republie sur Supabase les reponses d'agent aux retours testeur mises en attente le temps
qu'une livraison corrigeante soit reellement deployee (voir CLAUDE.md, section Specificites
projet, et _contexte/reponses_retours_en_attente_deploiement.json).

Appele par /deploy juste apres la verification de fumee post-deploiement (etape 8) : a ce
moment le code corrige est confirme accessible en production, les reponses peuvent devenir
visibles pour le testeur sans le tromper sur l'etat de son application.

Une reponse dont le retour a ete valide par le testeur entre-temps est retiree de la file avec un
avertissement (plus rien a publier) ; les autres echecs restent en attente.

Necessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement. La cle service_role
n'est jamais affichee ni ecrite par ce script.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _supabase import SupabaseError, read_credentials  # noqa: E402
from reply_feedback_report import QUEUE_FILE, ReportResolvedError, deposit_reply, read_queue  # noqa: E402


def publish_entries(url: str, service_key: str, entries: list[dict]) -> tuple[int, int, list[dict]]:
    remaining = []
    published = 0
    dropped = 0
    for entry in entries:
        try:
            deposit_reply(url, service_key, entry["report_id"], entry["body"])
            published += 1
        except ReportResolvedError:
            print(
                f"AVERTISSEMENT: {entry['report_id']} deja valide par le testeur, reponse retiree de la file.",
                file=sys.stderr,
            )
            dropped += 1
        except SupabaseError as e:
            print(f"ERREUR sur {entry['report_id']} : {e}.", file=sys.stderr)
            remaining.append(entry)
    return published, dropped, remaining


def main() -> int:
    if not QUEUE_FILE.exists():
        print("Aucune reponse en attente (fichier absent).")
        return 0
    entries = read_queue()
    if not entries:
        print("Aucune reponse en attente (fichier vide).")
        return 0

    url, service_key = read_credentials()
    published, dropped, remaining = publish_entries(url, service_key, entries)
    QUEUE_FILE.write_text(json.dumps(remaining, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        f"{published} reponse(s) republiee(s), {dropped} retiree(s) (retour deja valide), "
        f"{len(remaining)} en echec (restee(s) en attente)."
    )
    return 1 if remaining else 0


if __name__ == "__main__":
    raise SystemExit(main())
