import pytest

from ROBERTO.integration import integrer_entree


def valid_entry(etat="ANALYSE"):
    return {
        "id": "b5d5fba1-eb90-410f-9a1f-61f49d236fde",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-14T17:38:18.738Z",
        "etat": etat,
    }


def test_integrer_entree_analyse_vers_integre_sans_mutation():
    entree = valid_entry()
    entree_originale = dict(entree)

    resultat = integrer_entree(entree)

    assert resultat["etat"] == "INTEGRE"
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


@pytest.mark.parametrize("etat", ["RECU", "CORRECTIONS", "INTEGRE"])
def test_integrer_entree_refuse_un_etat_autre_que_analyse(etat):
    entree = valid_entry(etat=etat)
    entree_originale = dict(entree)

    with pytest.raises(ValueError, match="état ANALYSE attendu"):
        integrer_entree(entree)

    assert entree == entree_originale
