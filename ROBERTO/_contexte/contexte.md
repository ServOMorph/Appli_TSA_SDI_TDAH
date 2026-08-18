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
Mission en pause (2026-08-18) — prochaine session utilisateur sur la zone globale, pas ici. Phases 1 et 2 de `roadmap_roberto_workflow.md` `[FAIT]` : gap `integrer_corrections` corrigé (`workflow.py` route vers la bonne fonction selon l'état de l'entrée), `AGENT_STATE.md`/`AGENT_WORKFLOW.md` créés à la racine du projet (état des 3 flux / règles de processus, sans dupliquer `_contexte/signals.md`/`contexte.md` racine). Journal testeur réel : 4/7 entrées en INTEGRE, 3 en RECU en attente de retest manuel du correctif budget (non bloquant côté workflow). Flux B (Google Drive) et Flux C (sync-marie, côté orchestration ROBERTO) : non commencés — Phase 3 est la prochaine étape, en attente de confirmation utilisateur (checkpoint roadmap). Cette zone lit désormais aussi `_contexte/signals.md`/`contexte.md` racine (lecture seule) au `/start`. Deux correctifs de mécanisme (`close.md`/`start.md` racine) proposés mais non implémentés — voir `signals.md` action P2.

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-08-18 : Initialisation du protocole vibecoding, agent créé via `/create_agent` (conversion d'un dossier `ROBERTO/` déjà existant, contenant `_docs/` et le code du Flux A produits en amont).
- 2026-08-18 : Réorientation de la mission — abandon du relai ChatGPT (`chatgpt-orchestrateur`) comme méthode par défaut, travail repris en direct par cet agent. Détail dans `roadmap_roberto_workflow.md` (cadrage) et `claude-vibecoding-kit/_contexte/signals.md`.
- 2026-08-18 : Phases 1-2 closes (gap `integrer_corrections` corrigé, `AGENT_STATE.md`/`AGENT_WORKFLOW.md` créés). Lecture élargie à `_contexte/signals.md`/`contexte.md` racine accordée (session kit). Constat : le `/close` de cette session a écrit la synthèse dans les fichiers `_contexte/` racine au lieu de ceux de cette zone — non conçu, à corriger (voir `signals.md`, action P2).
