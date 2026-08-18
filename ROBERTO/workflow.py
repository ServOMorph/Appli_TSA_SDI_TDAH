from ROBERTO.analyse import analyser_entree
from ROBERTO.corrections import corriger_entree
from ROBERTO.integration import integrer_entree
from ROBERTO.integration_corrections import integrer_corrections
from ROBERTO.state_machine import Etat


def traiter_entree(entree: dict, action: str) -> dict:
    if action not in ("corriger", "integrer"):
        raise ValueError(
            f"Action invalide : {action!r}. "
            "Actions attendues : 'corriger' ou 'integrer'."
        )

    if entree.get("etat") == Etat.CORRECTIONS.value:
        if action != "integrer":
            raise ValueError(
                f"Action invalide pour une entrée en état CORRECTIONS : "
                f"{action!r}. Seule 'integrer' est acceptée."
            )
        return integrer_corrections(entree)

    entree_analysee = analyser_entree(entree)

    if action == "corriger":
        return corriger_entree(entree_analysee)

    return integrer_entree(entree_analysee)
