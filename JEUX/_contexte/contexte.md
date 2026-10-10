# Contexte — jeux

## Objectif (immuable sauf décision explicite)
Concevoir et développer des jeux pour personnes TSA, SDI et TDAH, destinés à l'application. Collecte des données de recherche (projet, IA-TSA, web), reformatage pour l'application, proposition de 5 jeux simples accessibles depuis les outils, test via `run_jeux.py` (accueil sans onboarding, outils ouverts, jeux cliquables, charte graphique respectée) avant toute intégration.

## Stack / contraintes techniques (stable, rarement modifié)
- Application hôte : PWA React 19 + TypeScript + Vite 8, stockage local Dexie (IndexedDB), glisser-déposer @dnd-kit. Tests : Vitest, Playwright (e2e).
- Lancement actuel de l'application : `run.py` racine (`npm run dev -- --host`). `run_jeux.py` (créé) lance le banc de test via `JEUX/harness/vite.config.ts` (port 5180, base IndexedDB propre à cette origine).
- Charte graphique : `_docs/docs de dev/5- DESIGN SYSTEM NEURODIVERGENT.md`, zone `DESIGN/`, styles dans `src/ui/styles`. Écrans dans `src/ui/screens`, composants dans `src/ui/components`.
- Sources de données : documentation projet (`DOCUMENTATION/INDEX.md`), `D:\ServOMorph\IA-TSA` (dossiers `docs/`, `data/`, lecture seule), web.
- Contrainte : `src/` en lecture seule tant que les jeux ne sont pas validés ; `run_jeux.py` et le code de test vivent hors du code applicatif (JEUX/ + racine).
- Vérifications locales : `npx vitest run --config JEUX/vitest.config.ts`, `npx tsc -p JEUX/tsconfig.json`, `npx eslint JEUX --max-warnings 0`.

## État actuel (réécrit intégralement à chaque /close)
Banc de test opérationnel avec deux jeux fonctionnels : Tri calme (trop simple) et Planning d'énergie (pas assez ludique), tous deux rejetés par l'utilisateur après essai.
Public cible précisé : jeunes adultes autonomes, parfois à haut potentiel.
Les critères de « ludique » restent à recueillir avant toute nouvelle proposition. Aucun jeu n'est branché sur l'application.

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-10-10 : Initialisation du protocole vibecoding.
- 2026-10-10 : Jeux non branchés sur l'application pendant le développement ; test via `run_jeux.py` ; intégration après validation utilisateur.
- 2026-10-10 : Public cible = jeunes adultes autonomes, parfois haut potentiel. La proposition initiale (jeux simples, issue de données enfants TSA) est abandonnée.
- 2026-10-10 : Banc de test = harnais séparé qui importe `src/` en lecture seule (section « Jeux » injectée sur l'accueil), base de données isolée de `npm run dev`.
- 2026-10-10 : Tri calme et Planning d'énergie jugés insuffisants par l'utilisateur après essai (trop simple / pas assez ludique). Le sens de « ludique » reste à préciser.
