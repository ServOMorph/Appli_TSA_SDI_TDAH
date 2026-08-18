import pytest

from ROBERTO.workflow import traiter_entree


def valid_entry():
    return {
        "id": "b5d5fba1-eb90-410f-9a1f-61f49d236fde",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-14T17:38:18.738Z",
        "etat": "RECU",
    }


def test_workflow_recu_analyse_corrections_sans_mutation():
    entree = valid_entry()
    entree_originale = dict(entree)

    resultat = traiter_entree(entree, "corriger")

    assert resultat["etat"] == "CORRECTIONS"
    assert resultat is not entree
    assert entree == entree_originale
    assert entree["etat"] == "RECU"

    for field in (
        "id",
        "test_id",
        "status",
        "comment",
        "created_at",
    ):
        assert resultat[field] == entree[field]


def test_workflow_recu_analyse_integre_sans_mutation():
    entree = valid_entry()
    entree_originale = dict(entree)

    resultat = traiter_entree(entree, "integrer")

    assert resultat["etat"] == "INTEGRE"
    assert resultat is not entree
    assert entree == entree_originale
    assert entree["etat"] == "RECU"

    for field in (
        "id",
        "test_id",
        "status",
        "comment",
        "created_at",
    ):
        assert resultat[field] == entree[field]


def test_workflow_refuse_action_invalide():
    entree = valid_entry()
    entree_originale = dict(entree)

    with pytest.raises(ValueError, match="Action invalide"):
        traiter_entree(entree, "invalide")

    assert entree == entree_originale


def test_workflow_corrections_vers_integre():
    entree = valid_entry()
    entree["etat"] = "CORRECTIONS"
    entree_originale = dict(entree)

    resultat = traiter_entree(entree, "integrer")

    assert resultat["etat"] == "INTEGRE"
    assert resultat is not entree
    assert entree == entree_originale


def test_workflow_corrections_refuse_action_corriger():
    entree = valid_entry()
    entree["etat"] = "CORRECTIONS"

    with pytest.raises(ValueError, match="Action invalide"):
        traiter_entree(entree, "corriger")


def test_workflow_bout_en_bout_recu_analyse_corrections_integre():
    entree = valid_entry()

    apres_corrections = traiter_entree(entree, "corriger")
    assert apres_corrections["etat"] == "CORRECTIONS"

    apres_integration = traiter_entree(apres_corrections, "integrer")
    assert apres_integration["etat"] == "INTEGRE"
