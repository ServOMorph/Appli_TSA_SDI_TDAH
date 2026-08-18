# AGENT_WORKFLOW — Règles de processus ROBERTO

Change rarement. Ne contient jamais d'état temporaire (voir `AGENT_STATE.md` pour l'état courant des 3 flux).

Source : `ROBERTO/_docs/prompt_vibecoding-kit.md`, `ROBERTO/_docs/workflow1-chatgpt.md`. Ce fichier définit l'implémentation retenue pour ce projet ; les documents source restent la référence conceptuelle.

---

## Flux gérés

- **Flux A — Testeur JSON** : `ATTENTE → RECU → ANALYSE → CORRECTIONS → INTEGRE`. Implémenté (`ROBERTO/state_machine.py`, `workflow.py`, `process_journal.py`, `scripts/process_manual_test.py`). Jamais écraser silencieusement un résultat de test précédent.
- **Flux B — Google Drive** : non implémenté (Phase 3 de `roadmap_roberto_workflow.md`).
- **Flux C — `sync-marie`** : non implémenté en tant que flux ROBERTO. États cibles : développement / en cours de vérification / bloqué / prêt à tester / prêt à intégrer. `PRÊT À TESTER` ne signifie jamais `À INTÉGRER` — l'intégration se décide uniquement en préparation de release (Priorité 4).

## Priorités (politique, pas du code rigide)

0. Sécurité / intégrité / blocage critique (perte de données, corruption, bug bloquant, déploiement cassé) — traiter immédiatement.
1. Nouveau retour testeur (Flux A) — analyser avant tout travail secondaire.
2. Tâches Google Drive (Flux B), si aucun retour testeur prioritaire.
3. Chantier `sync-marie` (Flux C), si aucun travail prioritaire.
4. Préparation de release, une fois les flux dans un état suffisamment cohérent.

## Invariants

- Jamais d'écrasement silencieux d'un JSON testeur ou d'une donnée utilisateur.
- Jamais de rollback de code n'entraîne un rollback de données Supabase (rollback code / schéma / données strictement séparés).
- Une entrée en état CORRECTIONS ne peut recevoir que l'action `integrer` (`ROBERTO/workflow.py`).
- Toute décision de priorité importante doit être explicable (quel flux, pourquoi ce choix plutôt qu'un autre), pas une exécution silencieuse.

## Cohabitation avec `_contexte/` (protocole vibecoding existant)

- `_contexte/signals.md` / `_contexte/contexte.md` (racine projet) restent le protocole de session general (`/start`, `/close`) pour tout le projet, tous chantiers confondus (UI, sync-marie applicatif, etc.) — ils ne sont pas remplacés.
- `AGENT_STATE.md` est le sous-ensemble de cet état spécifique aux 3 flux orchestrés par ROBERTO (JSON testeur, Google Drive, `sync-marie` côté orchestration). Il est plus fin-grained et mis à jour à chaque traitement d'entrée, pas seulement en fin de session.
- Pas de duplication : `_contexte/signals.md` référence `AGENT_STATE.md` pour le détail des 3 flux au lieu de le recopier. `AGENT_STATE.md` ne recopie pas les questions ouvertes hors périmètre ROBERTO (UI, déploiement, etc.).
- `AGENT_STATE.md` remplace `ROBERTO/_orchestrateur_ia/chatgpt/etat.md` (spécifique à l'ancien relai ChatGPT, plus la méthode par défaut).
