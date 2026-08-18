# Contexte — roberto

## Objectif (immuable sauf décision explicite)
Implémenter et faire évoluer le système d'orchestration de workflow ROBERTO (flux testeur JSON / Google Drive / sync-marie, moteur de décision, releases) pour ce projet, puis en extraire un skill générique.

## Stack / contraintes techniques (stable, rarement modifié)
- Python 3.13, stdlib uniquement + `pytest` pour les tests (`python -m pytest`) — pas de `requirements.txt` formalisé à ce jour pour ROBERTO.
- Code métier dans `ROBERTO/` (modules `state_machine.py`, `analyse.py`, `corrections.py`, `integration.py`, `integration_corrections.py`, `workflow.py`, `process_journal.py`), CLI dans `scripts/` (racine projet, ex. `scripts/process_manual_test.py`).
- Journal réel exploité par le Flux A : `_contexte/marie_tests_journal.json` (racine du projet).
- Cahier des charges complet de la mission : `ROBERTO/_docs/prompt_vibecoding-kit.md`, `ROBERTO/_docs/workflow1-chatgpt.md`. Synthèse de cadrage : `ROBERTO/synthese_analyse.md`.
- Roadmap active : `roadmap_roberto_workflow.md` (racine du projet, 7 phases).
- Hérite pour le reste de la stack applicative du projet parent (`Appli_TSA_SDI_TDAH` : React/TypeScript PWA, Dexie.js, Supabase pour `sync-marie`) sans en faire partie — ROBERTO orchestre, ne réimplémente pas le code applicatif.

## État actuel (réécrit intégralement à chaque /close)
Flux A (testeur/JSON) quasi terminé, committé, 32/32 tests verts — bloqué par un gap réel : `integrer_corrections` (CORRECTIONS→INTEGRE) jamais câblé dans `workflow.py`, aucun chemin CLI pour une entrée bloquée en CORRECTIONS. C'est le premier point de la Phase 1 de `roadmap_roberto_workflow.md`. Flux B (Google Drive) et Flux C (sync-marie) : non commencés. Réorientation actée le 2026-08-18 : la suite se fait en travail direct par cet agent, plus par délégation à ChatGPT (skill `chatgpt-orchestrateur` du kit, jugé non économe en tokens côté Claude pour ce type de tâches).

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-08-18 : Initialisation du protocole vibecoding, agent créé via `/create_agent` (conversion d'un dossier `ROBERTO/` déjà existant, contenant `_docs/` et le code du Flux A produits en amont).
- 2026-08-18 : Réorientation de la mission — abandon du relai ChatGPT (`chatgpt-orchestrateur`) comme méthode par défaut, travail repris en direct par cet agent. Détail dans `roadmap_roberto_workflow.md` (cadrage) et `claude-vibecoding-kit/_contexte/signals.md`.
