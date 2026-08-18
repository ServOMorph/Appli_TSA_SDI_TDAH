import json
from pathlib import Path

import pytest

from ROBERTO.state_machine import Etat, StateMachine


JOURNAL_PATH = (
    Path(__file__).resolve().parent.parent
    / "_contexte"
    / "marie_tests_journal.json"
)


def test_transition_attente_recu_sur_premiere_entree_du_journal():
    with JOURNAL_PATH.open("r", encoding="utf-8") as f:
        journal = json.load(f)

    entree = journal["entries"][0]

    etat_initial = Etat.ATTENTE
    machine = StateMachine()

    nouvel_etat = machine.transition(etat_initial, "JSON_RECU")

    assert nouvel_etat == Etat.RECU

    assert entree["id"] == "b5d5fba1-eb90-410f-9a1f-61f49d236fde"
    assert entree["test_id"] == "creer-une-liste"
    assert entree["status"] == "ok"
    assert entree["comment"] is None
    assert entree["created_at"] == "2026-08-14T17:38:18.738Z"


def test_transition_invalide_leve_une_erreur():
    machine = StateMachine()

    with pytest.raises(ValueError, match="Transition invalide"):
        machine.transition(Etat.ATTENTE, "ANALYSER")
