import json

import pytest

from ROBERTO.process_journal import traiter_entree_du_journal


def test_traiter_entree_du_journal_recu_vers_integre_sans_modifier_les_autres(
    tmp_path,
):
    journal_path = tmp_path / "marie_tests_journal.json"

    entree_cible = {
        "id": "id-cible",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-18T12:00:00.000Z",
        "etat": "RECU",
    }

    autre_entree = {
        "id": "id-autre",
        "test_id": "supprimer-une-liste",
        "status": "nok",
        "comment": "Autre résultat",
        "created_at": "2026-08-18T12:01:00.000Z",
        "etat": "ANALYSE",
    }

    journal_initial = {
        "entries": [
            entree_cible,
            autre_entree,
        ]
    }

    journal_path.write_text(
        json.dumps(journal_initial, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    resultat = traiter_entree_du_journal(
        "id-cible",
        "integrer",
        journal_path=journal_path,
    )

    journal_final = json.loads(
        journal_path.read_text(encoding="utf-8")
    )

    assert resultat["etat"] == "INTEGRE"

    assert journal_final["entries"][0] == {
        **entree_cible,
        "etat": "INTEGRE",
    }

    assert journal_final["entries"][1] == autre_entree
    assert journal_final["entries"][1] is not journal_final["entries"][0]


def test_traiter_entree_du_journal_refuse_entree_absente(tmp_path):
    journal_path = tmp_path / "marie_tests_journal.json"

    journal_path.write_text(
        json.dumps({"entries": []}),
        encoding="utf-8",
    )

    try:
        traiter_entree_du_journal(
            "id-inconnue",
            "integrer",
            journal_path=journal_path,
        )
    except ValueError as exc:
        assert "Entrée introuvable" in str(exc)
    else:
        raise AssertionError("Une entrée absente devait lever ValueError.")


@pytest.mark.parametrize("etat", [None, "INCONNU", "attente"])
def test_traiter_entree_du_journal_refuse_etat_invalide_sans_reecrire(
    tmp_path, etat
):
    journal_path = tmp_path / "marie_tests_journal.json"

    entree_cible = {
        "id": "id-cible",
        "test_id": "creer-une-liste",
        "status": "ok",
        "comment": None,
        "created_at": "2026-08-18T12:00:00.000Z",
        "etat": etat,
    }

    journal_initial = {"entries": [entree_cible]}
    contenu_initial = json.dumps(journal_initial, ensure_ascii=False, indent=2)
    journal_path.write_text(contenu_initial, encoding="utf-8")

    with pytest.raises(ValueError, match="État invalide"):
        traiter_entree_du_journal(
            "id-cible",
            "integrer",
            journal_path=journal_path,
        )

    assert journal_path.read_text(encoding="utf-8") == contenu_initial
