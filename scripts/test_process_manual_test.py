import json
import sys

from scripts.process_manual_test import main


def valid_entry(entry_id="id-cible", etat="RECU"):
    return {
        "id": entry_id,
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-18T12:00:00.000Z",
        "etat": etat,
    }


def test_main_integrer_recu_vers_integre(tmp_path, monkeypatch, capsys):
    journal_path = tmp_path / "marie_tests_journal.json"

    journal_path.write_text(
        json.dumps(
            {
                "entries": [
                    valid_entry(),
                ]
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "ROBERTO.process_journal.JOURNAL_PATH",
        journal_path,
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["process_manual_test.py", "id-cible", "integrer"],
    )

    assert main() == 0

    captured = capsys.readouterr()

    assert "traitée avec succès" in captured.out
    assert "état final = INTEGRE" in captured.out
    assert captured.err == ""

    journal = json.loads(
        journal_path.read_text(encoding="utf-8")
    )

    assert journal["entries"][0]["etat"] == "INTEGRE"


def test_main_corriger_recu_vers_corrections(tmp_path, monkeypatch, capsys):
    journal_path = tmp_path / "marie_tests_journal.json"

    journal_path.write_text(
        json.dumps(
            {
                "entries": [
                    valid_entry(),
                ]
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "ROBERTO.process_journal.JOURNAL_PATH",
        journal_path,
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["process_manual_test.py", "id-cible", "corriger"],
    )

    assert main() == 0

    captured = capsys.readouterr()

    assert "traitée avec succès" in captured.out
    assert "état final = CORRECTIONS" in captured.out
    assert captured.err == ""

    journal = json.loads(
        journal_path.read_text(encoding="utf-8")
    )

    assert journal["entries"][0]["etat"] == "CORRECTIONS"


def test_main_refuse_action_invalide(tmp_path, monkeypatch, capsys):
    journal_path = tmp_path / "marie_tests_journal.json"

    journal_path.write_text(
        json.dumps(
            {
                "entries": [
                    valid_entry(),
                ]
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "ROBERTO.process_journal.JOURNAL_PATH",
        journal_path,
    )
    monkeypatch.setattr(
        sys,
        "argv",
        ["process_manual_test.py", "id-cible", "action-invalide"],
    )

    assert main() == 1

    captured = capsys.readouterr()

    assert captured.out == ""
    assert "ERREUR:" in captured.err
    assert "Action invalide" in captured.err

    journal = json.loads(
        journal_path.read_text(encoding="utf-8")
    )

    assert journal["entries"][0]["etat"] == "RECU"
