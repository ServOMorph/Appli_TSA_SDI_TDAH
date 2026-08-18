# Roadmap — Système d'orchestration de workflow ROBERTO
Objectif : implémenter dans ce projet un système où l'agent lit l'état de trois flux indépendants (retours testeur JSON, tâches Google Drive, branche `sync-marie`), décide seul de la prochaine action selon des règles de priorité explicites, et prépare les releases — puis extraire un skill générique réutilisable de cette expérience.
Créée le : 2026-08-18

---

## Cadrage (à lire avant Phase 1, ne pas supprimer)

**Source de la mission** : `ROBERTO/_docs/prompt_vibecoding-kit.md` (spécification complète, 891 lignes) et `ROBERTO/_docs/workflow1-chatgpt.md` (proposition d'architecture, 522 lignes). Ces deux documents sont la référence — à relire avant chaque phase touchant à leur périmètre, ne pas se fier uniquement à cette roadmap pour le détail. Règle fondamentale posée par la spec elle-même (section 24) : elle définit l'objectif et les principes, pas une implémentation rigide — s'écarter du détail suggéré est autorisé si justifié et si les principes fondamentaux (traçabilité, séparation code/données, jamais d'écrasement silencieux) sont respectés.

**Deux objectifs couplés, dans l'ordre** :
1. Implémenter le système dans ce projet (`Appli_TSA_SDI_TDAH`), en conditions réelles, sur les trois flux.
2. Extraire de cette implémentation un skill générique de conception de workflow — seulement une fois l'expérience réelle acquise (pas avant, cf. `ROBERTO/synthese_analyse.md` §12, point non tranché mais ordre logique imposé par la spec elle-même section 23 : « Ne commence l'implémentation qu'après avoir suffisamment compris l'existant »).

**Réorientation actée le 2026-08-18** : les étapes 1 à 12 du Flux A ont été produites par délégation à ChatGPT via le skill `chatgpt-orchestrateur` du kit (`claude-vibecoding-kit`). Analyse a posteriori (même date) : ce relai ne fait pas d'économie de tokens côté Claude sur des tâches de cette granularité (composer la délégation avec code de référence inline coûte autant que l'écrire directement, plus le coût des captures d'écran/allers-retours GUI) — décision : la suite de cette mission se fait en travail direct par une session Claude Code dans ce projet, sans passer par ce relai. Le mécanisme `chatgpt-orchestrateur` reste disponible mais n'est plus la méthode par défaut pour ce projet.

**Collision de nom à connaître** : `templates/roberto/` dans le kit (automatisation PC, mascotte, macros Windows) n'a aucun rapport avec ce `ROBERTO/` — seul le nom de dossier est partagé (convention `/insert_template`, destination par défaut fixe). Voir `ROBERTO/synthese_analyse.md` pour le détail complet de cette clarification.

**Terminologie** : la spec section 4 nomme les flux "Flux 1/2/3" ; le travail déjà fait (délégation ChatGPT) les a nommés "Flux A/B/C". Les deux désignent la même chose (Flux 1 = Flux A = testeur/JSON, etc.) — cette roadmap utilise A/B/C pour rester cohérente avec le code déjà écrit (`ROBERTO/state_machine.py` etc.).

---

## Phase 1 — Finaliser le Flux A (Testeur / JSON) [FAIT]

**Déjà fait, committé, testé (branche `sync-marie`, 32/32 tests verts)** :
- [x] `ROBERTO/state_machine.py` : `Etat` (ATTENTE/RECU/ANALYSE/CORRECTIONS/INTEGRE), `StateMachine.transition`.
- [x] `ROBERTO/analyse.py`, `corrections.py`, `integration.py`, `integration_corrections.py` : une transition par fichier, testée isolément (`test_*.py` associés).
- [x] `ROBERTO/workflow.py` (`traiter_entree`) : orchestre `analyser_entree` puis l'action `corriger`/`integrer`.
- [x] `ROBERTO/process_journal.py` (`traiter_entree_du_journal`) : résout une entrée par id dans le journal, écrit en atomique (fichier temporaire + `replace`), valide l'état contre `ETATS_VALIDES` avant traitement.
- [x] `scripts/process_manual_test.py` (CLI, 2 args positionnels) + `scripts/test_process_manual_test.py` (3 tests : `integrer`, `corriger`, action invalide).

**Gap découvert le 2026-08-18, corrigé le même jour (`a39c3db`)** :
- [x] `integrer_corrections` câblé dans `workflow.py` (`traiter_entree` distingue désormais l'état courant : route vers `integrer_corrections` si CORRECTIONS au lieu de toujours ré-analyser depuis RECU).
- [x] Test de bout en bout RECU→ANALYSE→CORRECTIONS→INTEGRE ajouté (`test_workflow.py`, `test_process_journal.py`).
- [x] Flux A validé sur le vrai `_contexte/marie_tests_journal.json` : 4/7 entrées réelles menées jusqu'à INTEGRE via `scripts/process_manual_test.py` (dont 3 traitées en session le 2026-08-18). 3 entrées restent en RECU, bloquées non pas par un gap du workflow mais par une décision produit : elles rapportent toutes le même bug (accès budget indisponible), correctif suspecté déjà présent dans le code mais non encore reconfirmé par test manuel — voir `AGENT_STATE.md` et `tests_manuels.md` (sections 3, 6, 9).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Séparer WORKFLOW et STATE (fondation partagée aux 3 flux) [FAIT]
Réf. spec section 3 et section 11.
- [x] Emplacement retenu : racine du projet (`AGENT_STATE.md`, `AGENT_WORKFLOW.md`), pas dans `_contexte/` (réservé au protocole vibecoding du kit).
- [x] `AGENT_WORKFLOW.md` créé : règles de processus (flux gérés, priorités, invariants).
- [x] `AGENT_STATE.md` créé : état courant des 3 flux, mis à jour à chaque traitement d'entrée (remplace `ROBERTO/_orchestrateur_ia/chatgpt/etat.md`).
- [x] Cohabitation avec `_contexte/signals.md`/`contexte.md` définie dans `AGENT_WORKFLOW.md` (section dédiée) : pas de duplication, `signals.md` référence `AGENT_STATE.md` pour le détail des 3 flux.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Flux B : tâches Google Drive [TODO]
Réf. spec section 4 (Flux 2) et section 6 de `workflow1-chatgpt.md`. Rien n'existe à ce jour pour ce flux.
- [ ] Étape d'import/transcription Google Drive → `TASKS.md` (ou équivalent structuré) — ne jamais faire dépendre la logique d'une lecture ad hoc du Drive à chaque session.
- [ ] Modèle de tâche minimal : id, description, priorité, statut (nouveau/en cours/terminé/intégré/bloqué), origine, dépendances éventuelles, urgence éventuelle, critères de validation éventuels.
- [ ] Mécanisme de détection de ce qui est nouveau vs déjà traité.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Flux C : `sync-marie` [TODO]
Réf. spec section 4 (Flux 3). Important : ce flux **orchestre et rend compte** de l'état de la branche applicative réelle `sync-marie` (dont l'avancement effectif vit dans `_contexte/signals.md`/`contexte.md` racine du projet — Phases 1-3 livrées, Phase 4 partielle, divergence critique avec `main` non résolue à ce jour) — il ne duplique pas ce travail applicatif.
- [ ] États à déterminer : développement / en cours de vérification / bloqué / prêt à tester / prêt à intégrer.
- [ ] Poser explicitement l'invariant de la spec : "prêt à tester" ≠ "à intégrer" — l'intégration se décide en Phase 6 (préparation de release), jamais automatiquement.
- [ ] Faire le lien avec l'état réel documenté (divergence `main`, `supabase/schema.sql` jamais exécuté, etc.) sans le retraiter.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Moteur de décision [TODO]
Réf. spec section 5 et section 6 (« L'agent doit EXPLIQUER son choix »), et `workflow1-chatgpt.md` §3.
- [ ] Implémenter les priorités explicites : 0 sécurité/régression critique > 1 JSON testeur > 2 Google Drive > 3 `sync-marie` > 4 préparation de release.
- [ ] À chaque décision, produire une explication lisible (quel flux, pourquoi ce choix plutôt qu'un autre) — pas une simple exécution silencieuse.
- [ ] Tester le moteur sur des scénarios combinés (ex. JSON urgent + Drive en cours + sync-marie prête).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Release, urgences, rollback [TODO]
Réf. spec sections 7 à 10.
- [ ] Préparation de release : analyser l'ensemble des 3 flux avant de constituer une nouvelle version destinée au testeur (pas de dist tant qu'un flux prioritaire n'est pas dans un état stable).
- [ ] Génération automatique des sections nouveautés/tests/urgences (probablement à brancher sur le cycle `WHATS_NEW`/`manualTestsCatalog.ts` déjà existant dans ce projet — vérifier avant de créer un mécanisme parallèle).
- [ ] Gestion des urgences : bandeau/état machine-readable (pas seulement texte humain), priorité 0 du moteur de décision.
- [ ] Séparer explicitement rollback code / rollback schéma / rollback données (jamais un rollback de code n'entraîne un rollback des données Supabase).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 7 — Extraction du skill générique [TODO]
Réf. spec sections 13 à 21, `ROBERTO/synthese_analyse.md` §9-12 (emplacement/nom à trancher, pas dans `templates/roberto/` — collision de nom déjà démontrée, nom sans référence à "roberto").
- [ ] Rédiger le skill : quand l'utiliser, quelles informations analyser, quelles questions poser, comment construire états/priorités/conflits/release boundaries/persistance, comment le faire évoluer.
- [ ] Trancher l'emplacement (nouveau `templates/<nom>/` du kit vs vrai skill `skills/<nom>/`) — décision en attente depuis `synthese_analyse.md`.
- [ ] Trancher le sort de `roadmap_messages_zones.md` vs `create_com_agents` (deux designs concurrents non résolus au niveau kit, mentionnés comme fondation possible).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer. Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
