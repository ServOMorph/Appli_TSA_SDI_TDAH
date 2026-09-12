"""Fusionne les résultats de tests manuels d'un export JSON dans le journal d'un testeur.

Un journal par testeur (roadmap_integration_onboard.md, Phase 6) : le testeur cible est résolu
depuis --tester, sinon depuis `export_data.settings.tester_code`, jamais deviné par défaut.
"""

import argparse
import json
import re
import sys
from pathlib import Path

JOURNALS_DIR = Path(__file__).resolve().parent.parent / "_contexte" / "tests_journaux"

_TESTER_DIRNAME_RE = re.compile(r"[^a-z0-9_-]+")


def normalize_tester_code(code: str) -> str:
    return _TESTER_DIRNAME_RE.sub("-", code.strip().lower()).strip("-")


def resolve_tester(explicit: str | None, export_data: dict) -> str | None:
    if explicit:
        normalized = normalize_tester_code(explicit)
        return normalized or None
    settings = export_data.get("settings")
    code = settings.get("tester_code") if isinstance(settings, dict) else None
    if not isinstance(code, str):
        return None
    normalized = normalize_tester_code(code)
    return normalized or None


def journal_path(tester: str) -> Path:
    return JOURNALS_DIR / f"{tester}.json"


def load_journal(path: Path) -> dict:
    if not path.exists():
        return {"entries": []}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export_path", type=Path, help="Chemin de l'export JSON à ingérer")
    parser.add_argument(
        "--tester",
        help="Code testeur cible (prioritaire sur settings.tester_code de l'export)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.export_path.exists():
        print(f"ERREUR: fichier introuvable : {args.export_path}", file=sys.stderr)
        return 1

    with args.export_path.open("r", encoding="utf-8") as f:
        export_data = json.load(f)

    results = export_data.get("manual_test_results")
    if not isinstance(results, list):
        print("ERREUR: 'manual_test_results' absent ou invalide dans l'export", file=sys.stderr)
        return 1

    tester = resolve_tester(args.tester, export_data)
    if tester is None:
        print(
            "ERREUR: aucun testeur résoluble (ni --tester, ni settings.tester_code exploitable "
            "dans l'export) - utiliser --tester <code>.",
            file=sys.stderr,
        )
        return 1

    path = journal_path(tester)
    journal = load_journal(path)
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

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(journal, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Journal de {tester} mis à jour : {added} ajoutée(s), {skipped} déjà présente(s) (ignorée(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
