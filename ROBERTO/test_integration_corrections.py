import pytest

from ROBERTO.integration_corrections import integrer_corrections


def valid_entry(etat="CORRECTIONS"):
    return {
        "id": "b5d5fba1-eb90-410f-9a1f-61f49d236fde",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-14T17:38:18.738Z",
        "etat": etat,
    }


def test_integrer_corrections_vers_integre_sans_mutation():
    entree = valid_entry()
    entree_originale = dict(entree)

    resultat = integrer_corrections(entree)

    assert resultat["etat"] == "INTEGRE"
    assert resultat is not entree
    assert entree == entree_originale
    assert entree["etat"] == "CORRECTIONS"

    for field in (
        "id",
        "test_id",
        "status",
        "comment",
        "created_at",
    ):
        assert resultat[field] == entree[field]


@pytest.mark.parametrize("etat", ["ANALYSE", "RECU", "INTEGRE"])
def test_integrer_corrections_refuse_un_etat_autre_que_corrections(etat):
    entree = valid_entry(etat=etat)
    entree_originale = dict(entree)

    with pytest.raises(ValueError, match="état CORRECTIONS attendu"):
        integrer_corrections(entree)

    assert entree == entree_originale
