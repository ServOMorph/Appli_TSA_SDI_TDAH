# Roadmap — Outil « Routine » (retour testeur #229113cc)

Source : retour `229113cc-99e9-4b30-8fbe-9bb7133435c7`, écran E10, device
`103c9b92-81ab-42f3-b141-e1c6869e3e84` (Marie), déposé le 2026-09-21. Sorti de
`roadmap_retours_2026-09-22.md` dès sa planification (2026-09-22) : chantier trop large pour être
absorbé dans cette roadmap-là, spécification déjà fournie en détail par Marie, fonctionnalité déjà
annoncée « bientôt disponible » dans le menu Ajouter (`ToolType` liste déjà `'routine'`, non encore
dans `IMPLEMENTED_TOOL_TYPES`). Roadmap créée le 2026-09-23, aucune phase démarrée — le codage
commencera à une session ultérieure.

## Retour analysé

| id | écran | constat | traitement |
| --- | --- | --- | --- |
| `229113cc` | E10 | Nouvel outil « Routine » : dossier dédié, création de routines à étapes ordonnées (nom, durée, couleur), planification par jour de semaine avec horaire propre à chaque jour saisi via un pavé numérique dédié, affichage dans le planning avec coche automatique quand toutes les étapes sont faites, écran plein écran des étapes (avec sous-tâches pliables), modification globale ou par jour unique | Phases 1 à 6 |

## Point à clarifier en cours de route

Le retour dit : « je veux qu'il y ait des flèches pour naviguer parmi les prochains jours » à propos
du sélecteur de 7 cases (lundi-dimanche de la semaine en cours). Ambigu entre « voir les jours
suivant dimanche » et « naviguer d'une semaine à l'autre ». Ne pas trancher par hypothèse : à
confirmer avec l'utilisateur au moment de la Phase 3 (sélecteur de jours), pas bloquant pour le
reste du découpage.

---

## Phase 1 — Modèle de données : entités, migrations Dexie, repositories [TODO]

**Constat**
- Aucune entité Routine dans le code actuel. `ToolType` inclut déjà `'routine'`
  (`src/domain/entities/tool.ts:1`) mais `IMPLEMENTED_TOOL_TYPES` (`tool.ts:14`) ne le liste pas —
  point d'entrée exact pour l'activer.
- Les sous-tâches existent déjà comme `Task` avec `parent_id` non-null
  (`src/domain/entities/task.ts:5`, helpers `isSubTask`/`getSubTasks` dans
  `src/domain/rules/taskRules.ts:51-64`) — réutilisable pour décomposer une étape de routine en
  sous-tâches (Phase 5), mais l'« étape » de routine elle-même (titre, position, durée) est une
  notion propre à la routine, distincte de `Task`.
- Aucun mapping « jour de semaine → horaire propre » dans le modèle existant :
  `TaskRecurrence.weekdays` (`src/domain/entities/taskRecurrence.ts`) sélectionne des jours mais un
  seul horaire vaut pour toute la série (porté par chaque `Task` occurrence,
  `scheduled_start`/`scheduled_end`, `task.ts:15-16`) — insuffisant pour la demande (un horaire par
  jour choisi), nécessite une entité de planification propre à la routine.
- Pattern de référence bout-en-bout (entité → repository → migration Dexie → `repositories.ts`) :
  chaîne budget mise en place lors de la Phase 8 de `roadmap_retours_2026-09-22.md`
  (`src/domain/entities/budgetDepositCategory.ts`,
  `src/data/repositories/budgetDepositCategoryRepository.ts`, `src/data/db.ts` version 25,
  `src/app/repositories.ts`).

**Fichiers pressentis** : `src/domain/entities/routine.ts`, `routineStep.ts`, `routineSchedule.ts`
(nouveaux) ; `src/data/repositories/routineRepository.ts`, `routineStepRepository.ts`,
`routineScheduleRepository.ts` (nouveaux) ; `src/data/db.ts` (nouvelle version) ;
`src/app/repositories.ts` ; `src/domain/entities/tool.ts` (`IMPLEMENTED_TOOL_TYPES`).

**Tests** : tests de repository (CRUD) pour chaque nouvelle table ; `db.test.ts` (migration, table
vide après upgrade, données existantes non altérées).

**Critère de sortie** : couche données seule (entités, migration, repositories) en place et testée,
aucune UI encore branchée, `tsc -b` + lint clean, suite verte.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Outil Routine : dossier, liste, création/modification d'une routine [TODO]

**Constat**
- Flux « ajouter un dossier routine depuis Accueil » = `createFolder`
  (`src/app/contexts/useToolsState.ts:23`) suivi de navigation vers `folder-detail`
  (`src/ui/screens/tools/E72FolderDetail.tsx`), où le bouton `+` (ligne 53) ouvre
  `ToolCreateModal` — il faut y ajouter un mode `'new-routine'` à côté de `'new-list'`
  (`src/ui/components/ToolCreateModal.tsx:67, 99-177`), et lister `'routine'` dans
  `IMPLEMENTED_TOOL_TYPES` pour sortir l'entrée de son état grisé « (bientôt disponible) »
  (`ToolCreateModal.tsx:106-112`).
- Couleur : réutiliser `src/ui/components/ColorPicker.tsx` en mode libre (comme `Task.color`,
  `ColorPicker.tsx:93-109`) — pas de notion de « catégorie de routine » justifiant le second mode du
  composant (sélection parmi des couleurs de catégories existantes, `ColorPicker.tsx:67-91`).
- Pattern d'écran « outil » complet à répliquer : `src/ui/screens/tools/E74BudgetSettings.tsx` /
  `E76BudgetLivrets.tsx` / `E77BudgetLivretDetail.tsx` (liste + détail CRUD), state hook dédié sur le
  modèle de `src/app/contexts/useBudgetState.ts`, styles partagés sur le modèle de
  `src/ui/styles/budget.ts`.
- Réordonnancement des étapes : pas d'équivalent direct trouvé dans le code actuel, à concevoir en
  phase (liste avec boutons monter/descendre ou glisser-déposer, à trancher selon la complexité
  acceptable pour ce composant).

**Fichiers pressentis** : `src/ui/screens/tools/` (nouveaux écrans liste + détail routine, numérotés
`Exx` à choisir en phase) ; `src/ui/components/ToolCreateModal.tsx` ; `src/domain/entities/tool.ts` ;
`src/app/navigation.ts` ; `src/App.tsx` (routing) ; `src/app/contexts/useRoutineState.ts` (nouveau,
pattern `useBudgetState.ts`) ; `src/ui/components/ColorPicker.tsx` (réutilisation) ;
`src/ui/styles/routine.ts` (nouveau).

**Tests** : tests d'écran (création, réordonnancement des étapes, modification, suppression d'une
routine) ; test du nouveau mode dans `ToolCreateModal.test.tsx`.

**Critère de sortie** : création/consultation/modification/suppression d'une routine (nom, étapes
ordonnées, durée, couleur — hors planification par jour) fonctionnelle et testée, suite verte,
`tsc -b` + lint clean, vérifié visuellement dans un navigateur.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Planification : sélecteur 7 jours + pavé numérique horaire [TODO]

**Constat**
- Aucun composant de saisie d'heure par pavé numérique dans le code actuel (recherche `keypad` /
  `pavé` / `0-9` infructueuse dans `src/ui`) — à construire entièrement.
- Calcul HH:MM réutilisable : `src/domain/rules/taskRules.ts:89-106` (`minutesBetween`/
  `scheduleTask`) pour dériver une durée/heure à partir de chiffres saisis séquentiellement.
- Voir « Point à clarifier en cours de route » ci-dessus (portée des flèches de navigation) — à
  trancher avec l'utilisateur avant de figer le comportement de ce composant.
- Chaque jour sélectionné porte son propre horaire (`RoutineSchedule` de la Phase 1), saisi via 4
  clics successifs sur le pavé (dizaine heures, unité heures, dizaine minutes, unité minutes).

**Fichiers pressentis** : `src/ui/components/RoutineWeekdayPicker.tsx` (nouveau),
`src/ui/components/RoutineTimeKeypad.tsx` (nouveau), intégrés dans l'écran de détail routine
(Phase 2).

**Tests** : pavé numérique (saisie séquentielle des 4 chiffres → `HH:MM`, remise à zéro) ; sélecteur
de jours (ajout/retrait, plusieurs jours simultanés, navigation).

**Critère de sortie** : une routine peut être planifiée sur un ou plusieurs jours, chacun avec un
horaire propre saisi via le pavé numérique, suite verte, `tsc -b` + lint clean, vérifié
visuellement.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Intégration planning (E10/E12) : affichage et coche automatique [TODO]

**Constat**
- `PlanningBoard.tsx` est le composant partagé de rendu du planning (utilisé par E10 et E12). Bloc
  générique `PlanBlock` (`kind: 'task' | 'subtask'`), trié par `sortBlocks` (lignes 501-504), rendu
  avec icône (`TaskIcon`, ligne 641), titre, checkbox de complétion (lignes 663-670,
  `handleComplete`). Il faut un 3ᵉ `kind: 'routine'` : logo dédié à créer, titre « routine « nom » »
  au lieu du titre résolu classique, checkbox non interactive (grisée), cochée automatiquement
  quand toutes les étapes de la routine sont faites.
- Logique de coche automatique déjà précédentée : `cd7529b6` (Phase 4 de
  `roadmap_retours_2026-09-22.md`) a ajouté la coche auto d'une tâche parente quand toutes ses
  sous-tâches sont cochées (`toggleSubTask`) — même principe à transposer entre une routine et ses
  étapes.
- Le clic sur le bloc routine doit ouvrir l'écran plein écran des étapes (Phase 5), pas le détail de
  tâche classique (`openDetail` actuel route vers `'task-detail'`, `PlanningBoard.tsx:632`).

**Fichiers pressentis** : `src/ui/screens/dashboard/PlanningBoard.tsx`,
`src/ui/components/TaskCardLayout.tsx` (logo dédié), `src/app/contexts/useRoutineState.ts` (état de
complétion par occurrence planifiée d'une routine).

**Tests** : `PlanningBoard.test.tsx` (rendu du bloc routine, checkbox non interactive, coche
automatique) ; test de règle pour la complétion automatique.

**Critère de sortie** : une routine planifiée apparaît dans le planning avec son logo dédié, se coche
automatiquement quand toutes ses étapes sont cochées, suite verte, `tsc -b` + lint clean, vérifié
visuellement.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Écran plein écran des étapes (cocher, sous-tâches pliables) [TODO]

**Constat** : pattern pliable/dépliable déjà en place — état `expandedIds`/`toggleExpand`
(`PlanningBoard.tsx:425-432`), bouton avec badge `done/total` + chevron (`PlanningBoard.tsx:646-659`),
repris à l'identique dans `src/ui/screens/lists/E61ListDetail.tsx:444` pour les sous-tâches d'un item
de liste — modèle direct à copier pour les étapes de routine décomposables en sous-tâches. Cet écran
liste les étapes dans l'ordre, cochables, chaque étape pouvant être dépliée pour afficher/cocher ses
sous-tâches.

**Fichiers pressentis** : nouvel écran plein écran sous `src/ui/screens/tools/`, `src/app/navigation.ts`,
`src/App.tsx`.

**Tests** : test d'écran (cocher une étape, plier/déplier une étape décomposée en sous-tâches, ordre
respecté).

**Critère de sortie** : écran plein écran fonctionnel et testé, suite verte, `tsc -b` + lint clean,
vérifié visuellement.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Modification d'une routine : tous les jours vs un seul jour [TODO]

**Constat** : depuis l'outil Routine, sélectionner la routine — le bouton « enregistrer » devient
« modifier » et la modification s'applique à tous les jours planifiés. Depuis l'écran plein écran
d'un jour donné (Phase 5), un bouton « modifier » distinct ne doit affecter que ce jour-là. Implique
une notion de détachement par occurrence planifiée, à rapprocher du mécanisme déjà utilisé pour les
occurrences détachées d'une tâche récurrente (`persistSeriesBatch`,
`src/app/contexts/usePlanningState.ts` — cf. Phases 1 et 2 de `roadmap_retours_2026-09-22.md`) ; à
confirmer si directement réutilisable ou si un mécanisme propre à `RoutineSchedule` est plus simple,
en phase.

**Fichiers pressentis** : `src/app/contexts/useRoutineState.ts`, écrans détail routine et étapes
(Phases 2 et 5), `src/app/contexts/usePlanningState.ts` (pattern de détachement, si réutilisable).

**Tests** : modification globale (tous les jours) vs modification ponctuelle (un seul jour, sans
impact sur les autres jours planifiés).

**Critère de sortie** : les deux modes de modification fonctionnels et distincts, suite verte,
`tsc -b` + lint clean, vérifié visuellement.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
