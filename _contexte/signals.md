# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-02)

## Questions ouvertes
- [P1] Valider manuellement la Phase V5-2a (points 110-117 de `tests_manuels.md`), en particulier le point 110 (migration des données existantes) sur une base contenant déjà des données réelles, pas une installation vierge. — fait quand : points 110-117 validés, `tests_manuels.md` purgé, phase passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2a, `tests_manuels.md`
- [P1] Démarrer la Phase V5-2b (planning et tâches refondus) de `roadmap_v5.0.md`, une fois V5-2a validée. — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P2] Corriger `exportData()` (`useSettingsState.ts`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts:21`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts:21`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-02 — Phase V5-2a codée : unification du modèle de tâches, gate technique atteint, validation manuelle en attente)

## Décisions prises
- Phase V5-2a insérée avant l'ancienne V5-2 (renommée V5-2b) : les items de V5-2 (sous-étapes dépliables sur le planning, création avec sous-étapes) supposaient un modèle de tâche unique, alors que le code portait deux systèmes parallèles (`Task`/`SubTask` pour Réception/Aujourd'hui, `TaskV2` pour le planning). Décision actée avec l'utilisateur en début de session (plan mode) : unifier en un seul modèle plutôt que dupliquer les sous-étapes.
- Icônes de tâche (V5-2b) : SVG custom restreint, pas de nouvelle dépendance. Durée par rouleaux (V5-2b) : composant custom. `dnd-kit` non touché par V5-2 (hors périmètre, ne concerne que la grille planning déjà retirée en V5-1).

## Livrables produits ou modifiés
- `src/domain/entities/task.ts` : entité `Task` unique absorbant `SubTask` et `TaskV2` (`parent_id`, `essential`, `energy_cost`, `postponed`, créneau) ; `subTask.ts` et `taskV2.ts` supprimés.
- `src/domain/rules/taskRules.ts` : fusion de `taskRulesV2.ts` et `subTaskRules.ts` (supprimés), ajout de `isCompleted`/`isSubTask`/`getSubTasks`/`getSubTaskCounts`/`uncompleteTask`.
- `src/data/repositories/taskRepository.ts` : repository unique remplaçant les trois repositories (`subTaskRepository.ts`, `taskV2Repository.ts` supprimés).
- `src/data/db.ts` : migration Dexie v7 (fusion des trois tables) puis v8 (suppression de `subTasks`/`tasksV2` — Dexie ne permet pas de lire et supprimer un store dans le même `upgrade`).
- `src/app/contexts/useTasksState.ts`, `usePlanningState.ts`, `useSettingsState.ts` (export/clearDatabase) : adaptés au modèle unique, API du contexte inchangée.
- Écrans adaptés sans changement de rendu : `E20Inbox`, `E22TaskDetail`, `E23Decompose`, `E24Today`, `E10Dashboard`, `PlanningBoard`, `E21CreateTaskV2`.
- `src/test/factories.ts` (nouveau) : fabriques de tests partagées, remplaçant sept fabriques dupliquées.
- `roadmap_v5.0.md` : Phase V5-2a insérée `[EN COURS]`, ancienne V5-2 renommée V5-2b.
- `tests_manuels.md` : points 110-117 ajoutés (validation manuelle V5-2a).
- `CHANGELOG.md` : entrée v5.4.

## Hypothèses validées / invalidées
- VALIDE : l'unification était nécessaire avant de coder les sous-étapes sur le planning (V5-2b) — confirmé en explorant le code (`TaskV2` n'avait aucun lien vers des sous-étapes).
- Défaut latent trouvé et corrigé en chemin : `TaskRepository.reorder()` réencryptait un titre déjà chiffré (lecture brute en base puis `update()`), corrompant le titre au réordonnancement quand le chiffrement local est actif. Préexistant, révélé par l'unification. Verrouillé par un test.
- VALIDE : 508/508 tests unitaires, 53/53 e2e sur build régénéré, `tsc -b`/lint/build clean. Le flaky pré-existant `AppContext.test.tsx` n'est pas apparu sur ces runs — pas de conclusion tirée sur sa disparition, non recherché spécifiquement.
- EN ATTENTE : validation manuelle (points 110-117), en particulier la migration des données sur une base contenant déjà des données réelles (pas une installation vierge) — non vérifiable par les tests automatisés seuls.
- Incident en cours de session : une commande PowerShell (`Get-Content -Raw` / `Set-Content`) a corrompu l'encodage UTF-8 de trois fichiers de test (accents en mojibake) — détecté et réparé dans la même session, vérifié par recherche de motifs de mojibake résiduels.

## Prochaine étape exacte
Valider manuellement la Phase V5-2a (`tests_manuels.md`, points 110-117), puis démarrer la Phase V5-2b (`roadmap_v5.0.md`).

## Question bloquante pour la session suivante
Aucune.
