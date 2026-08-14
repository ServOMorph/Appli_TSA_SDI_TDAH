"""Fusionne les résultats de tests manuels d'un export JSON de Marie dans le journal projet."""

import json
import sys
from pathlib import Path

JOURNAL_PATH = Path(__file__).resolve().parent.parent / "_contexte" / "marie_tests_journal.json"


def load_journal(path: Path) -> dict:
    if not path.exists():
        return {"entries": []}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def main() -> int:
    if len(sys.argv) != 2:
        print("ERREUR: chemin de l'export JSON manquant. Usage : python ingest_manual_tests.py <export.json>", file=sys.stderr)
        return 1

    export_path = Path(sys.argv[1])
    if not export_path.exists():
        print(f"ERREUR: fichier introuvable : {export_path}", file=sys.stderr)
        return 1

    with export_path.open("r", encoding="utf-8") as f:
        export_data = json.load(f)

    results = export_data.get("manual_test_results")
    if not isinstance(results, list):
        print("ERREUR: 'manual_test_results' absent ou invalide dans l'export", file=sys.stderr)
        return 1

    journal = load_journal(JOURNAL_PATH)
    known_ids = {entry["id"] for entry in journal["entries"]}

    added = 0
    skipped = 0
    for result in results:
        if result.get("id") in known_ids:
            skipped += 1
            continue
        journal["entries"].append(result)
        known_ids.add(result["id"])
        added += 1

    journal["entries"].sort(key=lambda e: (e.get("created_at", ""), e.get("id", "")))

    JOURNAL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with JOURNAL_PATH.open("w", encoding="utf-8") as f:
        json.dump(journal, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Journal mis à jour : {added} ajoutée(s), {skipped} déjà présente(s) (ignorée(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
