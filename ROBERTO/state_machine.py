from enum import Enum


class Etat(Enum):
    ATTENTE = "ATTENTE"
    RECU = "RECU"
    ANALYSE = "ANALYSE"
    CORRECTIONS = "CORRECTIONS"
    INTEGRE = "INTEGRE"


class StateMachine:
    TRANSITIONS = {
        Etat.ATTENTE: {
            "JSON_RECU": Etat.RECU,
        },
        Etat.RECU: {
            "ANALYSER": Etat.ANALYSE,
        },
        Etat.ANALYSE: {
            "CORRIGER": Etat.CORRECTIONS,
            "INTEGRER": Etat.INTEGRE,
        },
        Etat.CORRECTIONS: {
            "INTEGRER": Etat.INTEGRE,
        },
    }

    def transition(self, etat_actuel: Etat, evenement: str) -> Etat:
        try:
            return self.TRANSITIONS[etat_actuel][evenement]
        except KeyError as exc:
            raise ValueError(
                f"Transition invalide : {etat_actuel.value} + {evenement}"
            ) from exc
