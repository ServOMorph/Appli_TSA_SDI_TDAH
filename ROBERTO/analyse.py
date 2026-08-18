from ROBERTO.state_machine import Etat, StateMachine


def analyser_entree(entree: dict) -> dict:
    if entree.get("etat") != Etat.RECU.value:
        raise ValueError(
            f"Impossible d'analyser une entrée en état "
            f"{entree.get('etat')!r} : état RECU attendu."
        )

    nouvel_etat = StateMachine().transition(Etat.RECU, "ANALYSER")

    entree_modifiee = dict(entree)
    entree_modifiee["etat"] = nouvel_etat.value

    return entree_modifiee
