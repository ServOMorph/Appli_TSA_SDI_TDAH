import pytest

from ROBERTO.corrections import corriger_entree


def valid_entry(etat="ANALYSE"):
    return {
        "id": "b5d5fba1-eb90-410f-9a1f-61f49d236fde",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-14T17:38:18.738Z",
        "etat": etat,
    }


def test_corriger_entree_analyse_vers_corrections_sans_mutation():
    entree = valid_entry()
    entree_originale = dict(entree)

    resultat = corriger_entree(entree)

    assert resultat["etat"] == "CORRECTIONS"
    assert resultat is not entree
    assert entree == entree_originale
    assert entree["etat"] == "ANALYSE"

    for field in (
        "id",
        "test_id",
        "status",
        "comment",
        "created_at",
    ):
        assert resultat[field] == entree[field]


@pytest.mark.parametrize("etat", ["RECU", "INTEGRE"])
def test_corriger_entree_refuse_un_etat_autre_que_analyse(etat):
    entree = valid_entry(etat=etat)
    entree_originale = dict(entree)

    with pytest.raises(ValueError, match="état ANALYSE attendu"):
        corriger_entree(entree)

    assert entree == entree_originale
