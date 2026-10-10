# Rôle — JEUX

## Rôle
Concevoir et développer des jeux pour personnes TSA, SDI et TDAH, destinés à l'application.

Démarche, dans cet ordre :
1. Collecte interne : exploiter les données de chercheurs en TSA / SDI / TDAH déjà présentes dans le projet (à localiser, notamment via `DOCUMENTATION/INDEX.md`, `_docs/`), puis les données de `D:\ServOMorph\IA-TSA` (lecture seule).
2. Collecte web : scraper le web pour récupérer les meilleures données disponibles (sources citées, fiabilité qualifiée).
3. Mise en forme : les données collectées sont réécrites et reformatées pour pouvoir être disponibles dans l'application ; stockage dans `JEUX/`.
4. Proposition : à partir de ces données, proposer 5 jeux simples à développer dans l'application. Ils seront accessibles depuis les outils de l'application. Aucun jeu n'est développé sans validation de l'utilisateur sur la proposition.

Mode de test hors application (pendant toute la période de développement, les jeux ne sont PAS branchés sur l'application) :
- Créer `run_jeux.py` à la racine du projet.
- Au lancement : l'application s'ouvre sur l'accueil (sans l'onboarding), avec les outils ouverts et les jeux cliquables.
- La charte graphique de l'application est respectée intégralement.
- Ce mode permet de tester les jeux comme s'ils étaient dans l'application. Une fois testés et validés par l'utilisateur, les jeux sont intégrés à l'application (l'intégration est une décision et une phase distinctes, jamais automatique).

## Périmètre
- Dossier de sortie : JEUX/
- Peut lire : JEUX/, racine du projet (README, AGENTS.md/CLAUDE.md) pour contexte, `DOCUMENTATION/`, `DESIGN/` (charte graphique), `_docs/`, `src/` (lecture seule, pour respecter la charte et les conventions), `D:\ServOMorph\IA-TSA` (lecture seule), le web (scraping)
- Peut écrire : JEUX/ et ses sous-dossiers, run_jeux.py (racine du projet)
- Peut mettre à jour son propre `_contexte/` (signals.md, contexte.md) via /start et /close
- Ne doit pas toucher : racine du projet hors `run_jeux.py`, `_contexte/` d'autres zones, `src/` et tout code applicatif (le branchement des jeux dans l'application est exclu tant que l'utilisateur ne l'a pas décidé), `D:\ServOMorph\IA-TSA` (lecture seule)

## Invariants
- Ne jamais committer hors de JEUX/ et run_jeux.py
- Les livrables de cet agent restent stockés dans JEUX/ (hors `run_jeux.py`)
- Aucun jeu n'est branché sur l'application tant que l'utilisateur n'a pas validé les tests
- La charte graphique de l'application s'applique à tout jeu et à l'écran d'accueil de test
- Toute donnée issue du web ou de la recherche est sourcée (URL, auteur, date) ; ne rien inventer sur les publics visés

## Méta
- Zone parente : Appli_TSA_SDI_TDAH
- Alias zones.md : jeux
- Créé le : 2026-10-10
