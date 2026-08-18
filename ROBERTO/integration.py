from ROBERTO.state_machine import Etat, StateMachine


def integrer_entree(entree: dict) -> dict:
    if entree.get("etat") != Etat.ANALYSE.value:
        raise ValueError(
            f"Impossible d'intégrer une entrée en état "
            f"{entree.get('etat')!r} : état ANALYSE attendu."
        )

    nouvel_etat = StateMachine().transition(Etat.ANALYSE, "INTEGRER")

    entree_modifiee = dict(entree)
    entree_modifiee["etat"] = nouvel_etat.value

    return entree_modifiee
