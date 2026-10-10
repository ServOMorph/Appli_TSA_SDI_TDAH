# Statut — jeux (2026-10-10)

## Objectif
Concevoir des jeux pour personnes TSA / SDI / TDAH (public précisé : jeunes adultes autonomes), testés hors application via `run_jeux.py`.

## Avancement
Collecte initiale et banc de test conservés. Les implémentations des trois prototypes (Tri calme, Planning d'énergie, Fruits en cascade) sont retirées à la demande de l'utilisateur ; leur analyse est conservée dans `JEUX/donnees/analyse_prototypes_rejetes.md`. Trois nouvelles pistes figurent dans `JEUX/propositions_jeux.md`, en attente de choix. Aucun jeu n'est actuellement inscrit au catalogue ni branché dans l'application.

## Blocages
Le concept à prototyper n'est pas choisi. Les jeux préférés de sa fille sont connus (Zombie Tsunami, Tetris, jeux de fusion), mais les mécaniques précises qu'elle apprécie restent à clarifier.

## Prochain pas
Choisir une des trois pistes et préciser les éléments de ces jeux qui lui plaisent avant le prochain prototype.

## Commit proposé
Commit de session fait par `/close` : `close(jeux): session 2026-10-10 — ...`

## Fichiers modifiés
`JEUX/` (harness, donnees, propositions_jeux.md, analyse des prototypes, _contexte, vitest.config.ts, tsconfig.json). `run_jeux.py` est conservé.

## Tests et migrations
Les 35 tests des trois prototypes passaient avant leur retrait. Il ne reste aucun test de jeu dans JEUX. TypeScript et ESLint passent après le retrait. Aucune migration applicative.
