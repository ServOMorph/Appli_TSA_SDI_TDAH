import json
import sys

import pytest

from scripts.ingest_manual_tests import load_json, main, validate_entry


def valid_entry(entry_id="id-1", status="ok"):
    return {
        "id": entry_id,
        "test_id": "test-1",
        "status": status,
        "comment": None,
        "created_at": "2026-08-18T12:00:00.000Z",
    }


def test_load_json_invalid_json(tmp_path):
    path = tmp_path / "invalid.json"
    path.write_text("{invalid json", encoding="utf-8")

    with pytest.raises(ValueError, match="JSON invalide"):
        load_json(path)


def test_validate_entry_missing_required_field():
    entry = valid_entry()
    del entry["id"]

    with pytest.raises(ValueError, match="champs manquants"):
        validate_entry(entry, 0)


def test_validate_entry_invalid_status():
    entry = valid_entry(status="pending")

    with pytest.raises(ValueError, match="status"):
        validate_entry(entry, 0)


def test_main_deduplicates_duplicate_ids(tmp_path, monkeypatch):
    journal_path = tmp_path / "marie_tests_journal.json"
    journal_path.write_text(
        json.dumps(
            {
                "entries": [
                    {
                        **valid_entry(entry_id="duplicate-id"),
                        "etat": "RECU",
                    }
                ]
            }
        ),
        encoding="utf-8",
    )

    export_path = tmp_path / "export.json"
    export_path.write_text(
        json.dumps(
            {
                "manual_test_results": [
                    valid_entry(entry_id="duplicate-id", status="nok"),
                    valid_entry(entry_id="new-id", status="ok"),
                ]
            }
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "scripts.ingest_manual_tests.JOURNAL_PATH",
        journal_path,
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["ingest_manual_tests.py", str(export_path)],
    )

    assert main() == 0

    journal = json.loads(journal_path.read_text(encoding="utf-8"))

    assert len(journal["entries"]) == 2

    existing = next(
        entry for entry in journal["entries"] if entry["id"] == "duplicate-id"
    )
    new_entry = next(
        entry for entry in journal["entries"] if entry["id"] == "new-id"
    )

    assert existing["status"] == "ok"
    assert existing["etat"] == "RECU"

    assert new_entry["status"] == "ok"
    assert new_entry["etat"] == "RECU"


def test_main_marks_new_entry_as_recu_and_preserves_existing_state(
    tmp_path,
    monkeypatch,
):
    journal_path = tmp_path / "marie_tests_journal.json"

    existing_entry = {
        **valid_entry(
            entry_id="existing-id",
            status="nok",
        ),
        "comment": "Etat initial conservé",
        "etat": "ANALYSE",
    }

    journal_path.write_text(
        json.dumps({"entries": [existing_entry]}),
        encoding="utf-8",
    )

    new_entry = {
        "id": "new-id",
        "test_id": "test-nouveau",
        "status": "ok",
        "comment": "Nouveau résultat",
        "created_at": "2026-08-18T13:00:00.000Z",
    }

    duplicate_entry = {
        "id": "existing-id",
        "test_id": "test-existant-modifie",
        "status": "ok",
        "comment": "Ne doit pas remplacer l'existant",
        "created_at": "2026-08-18T14:00:00.000Z",
    }

    export_path = tmp_path / "export.json"
    export_path.write_text(
        json.dumps(
            {
                "manual_test_results": [
                    new_entry,
                    duplicate_entry,
                ]
            }
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "scripts.ingest_manual_tests.JOURNAL_PATH",
        journal_path,
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["ingest_manual_tests.py", str(export_path)],
    )

    assert main() == 0

    journal = json.loads(journal_path.read_text(encoding="utf-8"))

    assert len(journal["entries"]) == 2

    written_new_entry = next(
        entry for entry in journal["entries"] if entry["id"] == "new-id"
    )
    written_existing_entry = next(
        entry
        for entry in journal["entries"]
        if entry["id"] == "existing-id"
    )

    assert written_new_entry == {
        **new_entry,
        "etat": "RECU",
    }

    assert written_existing_entry == existing_entry
