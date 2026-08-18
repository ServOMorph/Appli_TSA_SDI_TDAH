from ROBERTO.state_machine import Etat, StateMachine


def integrer_corrections(entree: dict) -> dict:
    if entree.get("etat") != Etat.CORRECTIONS.value:
        raise ValueError(
            f"Impossible d'intégrer une entrée en état "
            f"{entree.get('etat')!r} : état CORRECTIONS attendu."
        )

    nouvel_etat = StateMachine().transition(Etat.CORRECTIONS, "INTEGRER")

    entree_modifiee = dict(entree)
    entree_modifiee["etat"] = nouvel_etat.value

    return entree_modifiee
