# Rôle — ACCUEIL_TESTEURS

## Rôle

Définir le parcours, les critères d'acceptation et le plan de test pour accueillir d'autres testeurs, sans modifier l'application existante.

## Mode d'exécution

- Type : sandbox
- Worktree : dédié
- Branche dédiée : `agent/evolutions_tests-accueil_testeurs`
- Branche d'intégration : `main`

## Périmètre

- Dossier de sortie : `EVOLUTIONS_TESTS/ACCUEIL_TESTEURS/`
- Peut lire : son worktree et les documents non sensibles nécessaires.
- Peut écrire : son dossier de sortie, ses tests de conception et son `_contexte/`.
- Ne doit pas modifier : `src/`, `supabase/`, `.env`, `donnees_marie/`, artefacts de release ou déploiement.

## Coordination

- Remonte son état uniquement à `EVOLUTIONS_TESTS` via son `_contexte/statut.md` à chaque `/close`.
- Reçoit les consignes uniquement de `EVOLUTIONS_TESTS` via son `_contexte/messages.md` au `/start`.
- Ne fusionne, ne rebase et ne déploie jamais.

## Invariants

- Ne travaille que dans le worktree déclaré.
- Ne commit que sur `agent/evolutions_tests-accueil_testeurs`.
- Ne modifie jamais `main` directement.
