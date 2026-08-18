import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ROBERTO.workflow import traiter_entree  # noqa: E402


JOURNAL_PATH = PROJECT_ROOT / "_contexte" / "marie_tests_journal.json"

ETATS_VALIDES = {"RECU", "ANALYSE", "CORRECTIONS", "INTEGRE"}


def load_json(path: Path) -> dict:
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON invalide dans {path}: {exc}") from exc

    if not isinstance(data, dict):
        raise ValueError(f"Le fichier {path} doit contenir un objet JSON.")

    return data


def load_journal(path: Path) -> dict:
    if not path.exists():
        raise ValueError(f"Journal introuvable : {path}")

    journal = load_json(path)
    entries = journal.get("entries")

    if not isinstance(entries, list):
        raise ValueError("Le journal doit contenir une liste 'entries'.")

    return journal


def traiter_entree_du_journal(
    entry_id: str,
    action: str,
    journal_path: Path | None = None,
) -> dict:
    path = journal_path if journal_path is not None else JOURNAL_PATH
    journal = load_journal(path)

    entry_index = next(
        (
            index
            for index, entry in enumerate(journal["entries"])
            if entry.get("id") == entry_id
        ),
        None,
    )

    if entry_index is None:
        raise ValueError(f"Entrée introuvable dans le journal : {entry_id}")

    entree = journal["entries"][entry_index]

    if entree.get("etat") not in ETATS_VALIDES:
        raise ValueError(
            f"État invalide pour l'entrée {entry_id!r} : "
            f"{entree.get('etat')!r}. États acceptés : "
            f"{sorted(ETATS_VALIDES)}."
        )

    entree_modifiee = traiter_entree(entree, action)

    journal["entries"][entry_index] = entree_modifiee

    path.parent.mkdir(parents=True, exist_ok=True)

    temp_path = path.with_suffix(".json.tmp")

    try:
        with temp_path.open("w", encoding="utf-8") as f:
            json.dump(journal, f, ensure_ascii=False, indent=2)
            f.write("\n")

        temp_path.replace(path)
    except OSError:
        if temp_path.exists():
            temp_path.unlink()
        raise

    return entree_modifiee
