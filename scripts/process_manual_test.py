"""Point d'entrée CLI pour traiter une entrée du journal ROBERTO."""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ROBERTO.process_journal import traiter_entree_du_journal  # noqa: E402


def main() -> int:
    if len(sys.argv) != 3:
        print(
            "ERREUR: arguments manquants ou invalides. "
            "Usage : python process_manual_test.py <entry_id> <action>",
            file=sys.stderr,
        )
        return 1

    entry_id = sys.argv[1]
    action = sys.argv[2]

    try:
        entree = traiter_entree_du_journal(entry_id, action)
    except ValueError as exc:
        print(f"ERREUR: {exc}", file=sys.stderr)
        return 1
    except OSError as exc:
        print(f"ERREUR d'accès fichier: {exc}", file=sys.stderr)
        return 1

    print(
        f"Entrée {entry_id} traitée avec succès : "
        f"état final = {entree['etat']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
