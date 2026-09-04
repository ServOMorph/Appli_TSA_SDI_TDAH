# Équipe parallèle — EVOLUTIONS_TESTS

## Coordinateur

- Alias : EVOLUTIONS_TESTS
- Branche d'intégration : `main`
- Dossier : `EVOLUTIONS_TESTS/`

## Membres

| Alias | Mode | Worktree | Branche | Rôle |
|---|---|---|---|---|
| evolutions_tests-accueil_testeurs | sandbox | dédié | `agent/evolutions_tests-accueil_testeurs` | Préparer l'accueil de testeurs sans modifier l'application. |
| evolutions_tests-retours_annotes | code | dédié | `agent/evolutions_tests-retours_annotes` | Concevoir et réaliser le flux de retours annotés. |

## Contrat de coordination

- Chaque membre travaille dans son worktree et sa branche dédiée.
- Les statuts remontent uniquement au coordinateur ; les consignes redescendent uniquement depuis lui.
- Une demande d'intégration contient le commit proposé, le résumé, les tests, les migrations et les points à valider.
- L'intégration dans `main` nécessite une validation explicite de l'utilisateur.
