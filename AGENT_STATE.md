# AGENT_STATE — État courant des 3 flux ROBERTO

Change à chaque traitement d'entrée, pas seulement en fin de session. Remplace `ROBERTO/_orchestrateur_ia/chatgpt/etat.md` (obsolète, relai ChatGPT abandonné). Règles de processus : voir `AGENT_WORKFLOW.md`.

Mis à jour : 2026-08-18

---

## Flux A — Testeur JSON

État : implémenté, opérationnel. Journal réel : `_contexte/marie_tests_journal.json` (7 entrées).
- 4 entrées en INTEGRE (`b5d5fba1-...`, `b84b3005-...`, `ba7539c1-...`, `3df86880-...` — toutes `status: ok`, transitionnées directement).
- 3 entrées en RECU, en attente de retest : `10a0154b-...` (retirer-de-l-argent-d-un-livret), `a0098520-...` (importer-une-sauvegarde), `23393df4-...` (utiliser-le-budget). Toutes `status: nok`, même symptôme rapporté par Marie le 2026-08-14 : accès au budget indisponible. Correctif suspecté déjà présent dans le code (`useSettingsState.ts:183-185`, réparation de l'entrée `tableau_comptage` manquante à l'import — documenté comme « corrigé, testé » dans `_contexte/contexte.md`), mais jamais transitionné dans le journal ROBERTO. Non lié au blocage `sync-marie`/roadmap_budget_v3 (chronologiquement postérieur aux rapports). Tests manuels de confirmation ajoutés dans `tests_manuels.md` (sections 3, 6, 9) — transitionner les 3 entrées seulement après validation manuelle.

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
