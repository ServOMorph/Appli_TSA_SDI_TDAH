# AGENT_STATE — État courant des 3 flux ROBERTO

Change à chaque traitement d'entrée, pas seulement en fin de session. Remplace `ROBERTO/_orchestrateur_ia/chatgpt/etat.md` (obsolète, relai ChatGPT abandonné). Règles de processus : voir `AGENT_WORKFLOW.md`.

Mis à jour : 2026-08-18

---

## Flux A — Testeur JSON

État : implémenté, opérationnel. Journal réel : `_contexte/marie_tests_journal.json` (7 entrées).
- 1 entrée en INTEGRE (`b5d5fba1-...`, migration/test de validation Phase 1).
- 6 entrées en RECU, non encore traitées (`analyser` puis `corriger`/`integrer` via `scripts/process_manual_test.py`).

## Flux B — Google Drive

État : non implémenté. Aucune tâche suivie à ce jour.

## Flux C — `sync-marie`

État : développement, bloqué. Détail applicatif complet dans `_contexte/signals.md`/`contexte.md` (source de vérité, non dupliqué ici) :
- Phases 1-3 de `roadmap_sync_marie.md` livrées et testées.
- Phase 4 partielle (accès développeur en lecture seul).
- Bloquant : divergence critique avec `main` (roadmap_budget_v3 + v5.47/v5.49 manquants sur la branche), sync réelle avec l'appareil de Marie non testée.
- `PRÊT À TESTER` pas encore atteint.

## Release

État : non préparée. Aucun flux dans un état suffisamment cohérent pour déclencher une préparation de release ROBERTO (indépendant du cycle `/deploy` applicatif existant, qui continue de fonctionner en parallèle).
