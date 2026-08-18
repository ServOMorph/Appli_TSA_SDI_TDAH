from ROBERTO.analyse import analyser_entree
from ROBERTO.corrections import corriger_entree
from ROBERTO.integration import integrer_entree


def traiter_entree(entree: dict, action: str) -> dict:
    entree_analysee = analyser_entree(entree)

    if action == "corriger":
        return corriger_entree(entree_analysee)

    if action == "integrer":
        return integrer_entree(entree_analysee)

    raise ValueError(
        f"Action invalide : {action!r}. "
        "Actions attendues : 'corriger' ou 'integrer'."
    )
