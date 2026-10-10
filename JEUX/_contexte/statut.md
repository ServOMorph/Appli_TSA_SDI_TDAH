# Statut — jeux (2026-10-10)

## Objectif
Concevoir des jeux pour personnes TSA / SDI / TDAH (public précisé : jeunes adultes autonomes), testés hors application via `run_jeux.py`.

## Avancement
Collecte interne et web faite (`JEUX/donnees/synthese_recherche.md`). Banc de test opérationnel. Deux jeux développés puis rejetés par l'utilisateur : Tri calme (trop simple), Planning d'énergie (pas assez ludique).

## Blocages
Critères de « ludique » non définis ; tension possible avec le principe du design system « ni ludique à tout prix, ni addictif ».

## Prochain pas
Recueillir les critères de l'utilisateur (jeux et mécaniques appréciés), reconstruire la proposition, la faire valider.

## Commit proposé
Commit de session fait par `/close` : `close(jeux): session 2026-10-10 — ...`

## Fichiers modifiés
`run_jeux.py`, `JEUX/` (harness, tri_calme, planning_energie, donnees, propositions_jeux.md, _contexte, vitest.config.ts, tsconfig.json).

## Tests et migrations
29 tests Vitest passent (logique des deux jeux), types et lint sans erreur. Aucune migration. Tactile, mode sombre et difficulté réelle non testés.
