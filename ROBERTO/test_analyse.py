import pytest

from ROBERTO.analyse import analyser_entree


def valid_entry(etat="RECU"):
    return {
        "id": "b5d5fba1-eb90-410f-9a1f-61f49d236fde",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-14T17:38:18.738Z",
        "etat": etat,
    }


def test_analyser_entree_recu_vers_analyse_sans_mutation():
    entree = valid_entry()
    entree_originale = dict(entree)

    resultat = analyser_entree(entree)

    assert resultat["etat"] == "ANALYSE"
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


@pytest.mark.parametrize("etat", ["ATTENTE", "ANALYSE"])
def test_analyser_entree_refuse_un_etat_autre_que_recu(etat):
    entree = valid_entry(etat=etat)
    entree_originale = dict(entree)

    with pytest.raises(ValueError, match="état RECU attendu"):
        analyser_entree(entree)

    assert entree == entree_originale
