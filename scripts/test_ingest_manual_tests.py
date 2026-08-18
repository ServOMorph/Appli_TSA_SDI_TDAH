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
        json.dumps({"entries": []}),
        encoding="utf-8",
    )

    export_path = tmp_path / "export.json"
    duplicate_id = "duplicate-id"

    export_path.write_text(
        json.dumps(
            {
                "manual_test_results": [
                    valid_entry(entry_id=duplicate_id),
                    valid_entry(entry_id=duplicate_id, status="nok"),
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

    assert len(journal["entries"]) == 1
    assert journal["entries"][0]["id"] == duplicate_id
    assert journal["entries"][0]["status"] == "ok"


def test_main_imports_valid_export_and_writes_journal(tmp_path, monkeypatch):
    journal_path = tmp_path / "marie_tests_journal.json"
    journal_path.write_text(
        json.dumps({"entries": []}),
        encoding="utf-8",
    )

    export_path = tmp_path / "export.json"
    entries = [
        valid_entry(
            entry_id="id-2",
            status="nok",
        ),
        {
            "id": "id-1",
            "test_id": "test-2",
            "status": "ok",
            "comment": "Test réussi",
            "created_at": "2026-08-18T11:00:00.000Z",
        },
    ]

    export_path.write_text(
        json.dumps({"manual_test_results": entries}),
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

    assert journal == {
        "entries": [
            {
                "id": "id-1",
                "test_id": "test-2",
                "status": "ok",
                "comment": "Test réussi",
                "created_at": "2026-08-18T11:00:00.000Z",
            },
            {
                "id": "id-2",
                "test_id": "test-1",
                "status": "nok",
                "comment": None,
                "created_at": "2026-08-18T12:00:00.000Z",
            },
        ]
    }
