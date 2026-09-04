# Équipe parallèle — TESTS

## Coordinateur

- Alias : TESTS
- Branche d'intégration : `main`
- Dossier : `TESTS/`

## Membres

| Alias | Mode | Worktree | Branche | Rôle |
|---|---|---|---|---|
| ONBOARD | sandbox | dédié | `agent/onboard` | Préparer l'accueil de testeurs sans modifier l'application. |
| RETOURS | code | dédié | `agent/retours` | Concevoir et réaliser le flux de retours annotés. |

## Contrat de coordination

- Chaque membre travaille dans son worktree et sa branche dédiée.
- Les statuts remontent uniquement au coordinateur ; les consignes redescendent uniquement depuis lui.
- Une demande d'intégration contient le commit proposé, le résumé, les tests, les migrations et les points à valider.
- L'intégration dans `main` nécessite une validation explicite de l'utilisateur.
