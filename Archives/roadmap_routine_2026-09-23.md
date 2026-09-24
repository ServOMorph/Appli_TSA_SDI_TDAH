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

## Point à clarifier en cours de route [TRANCHÉ]

Le retour dit : « je veux qu'il y ait des flèches pour naviguer parmi les prochains jours » à propos
du sélecteur de 7 cases (lundi-dimanche de la semaine en cours). Ambigu entre « voir les jours
suivant dimanche » et « naviguer d'une semaine à l'autre ».

**Décision (2026-09-23, Marie)** : navigation par semaine calendaire complète (les flèches font
avancer/reculer de 7 jours, lundi à dimanche), pas un glissement jour par jour. Question posée et
réponse consignées dans `COMMUNICATION/Marie/historique_conversation_marie.md` (entrée du
2026-09-23).

---

## Phase 1 — Modèle de données : entités, migrations Dexie, repositories [FAIT]

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

**Réalisé (2026-09-23)** :
- Trois nouvelles entités minimales : `Routine` (id, name, color, timestamps — même gabarit que
  `List`, l'ordre étant porté par `Tool` comme pour les listes), `RoutineStep` (id, routine_id,
  title, position, duration_minutes) et `RoutineSchedule` (id, routine_id, weekday, time — une
  ligne par jour planifié, chacune avec son propre horaire, au lieu de réutiliser
  `TaskRecurrence` qui ne porte qu'un seul horaire pour toute la série).
- `Tool` gagne un champ `routine_id: string | null`, sur le modèle de `list_id` — point d'entrée
  pour qu'un outil de type `'routine'` pointe vers sa routine (câblage UI en Phase 2 ;
  `IMPLEMENTED_TOOL_TYPES` volontairement pas encore modifié, cf. constat de la Phase 2).
  `createTool()` (`toolRules.ts`) le renseigne à `null`, aucun appelant actuel n'en a besoin.
- Trois repositories CRUD (`RoutineRepository`, `RoutineStepRepository`,
  `RoutineScheduleRepository`), même gabarit que `BudgetDepositCategoryRepository` — `getByRoutineId`
  trié par `position` pour les étapes, par `weekday` pour les plannings — câblés dans
  `repositories.ts`.
- `db.ts` version 26 : nouvelles tables (`routines: 'id'`, `routineSteps: 'id, routine_id, position'`,
  `routineSchedules: 'id, routine_id, weekday'`) + migration renseignant `routine_id: null` sur les
  outils existants.
- Les sous-tâches d'une étape de routine (Phase 5) réutiliseront `Task`/`parent_id` en pointant vers
  l'id de la `RoutineStep`, sans changement de schéma supplémentaire (`parent_id` est un simple
  champ texte, non contraint à un id de `Task`).
- Réel des tables `Tool` déjà typées en dur (5 fichiers de test + `toolRules.test.ts`) mis à jour
  pour inclure `routine_id: null` — sinon rupture de compilation, ce champ étant désormais requis
  par le type `Tool`.
- Hors périmètre de cette phase, à reprendre en Phase 2 quand des routines réelles existeront :
  câblage export/import (`buildSnapshot.ts`) et parité `hasSignificantData()` /
  `is_empty_snapshot_payload()` pour les nouvelles tables (déjà tracé `[P2]` signals.md pour les
  tables existantes, même risque de duplication à surveiller pour `routines`).
- Suite complète 947/947 (7 nouveaux tests : 3 paires CRUD repository + 1 test de migration v25→v26),
  `tsc -b` + `eslint` clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Outil Routine : dossier, liste, création/modification d'une routine [FAIT]

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

**Ajout (2026-09-23, décision utilisateur)** : câbler l'export/import des tables Routine dans cette
phase plutôt qu'en dette — sinon un export JSON de Marie (demandé avant chaque `/deploy`, étape 0.1)
perdrait silencieusement ses routines dès qu'elle en créerait une. Fichiers concernés :
`src/data/sync/buildSnapshot.ts` (+3 tables, bump `SNAPSHOT_SCHEMA_VERSION`),
`src/app/contexts/useSettingsState.ts` (`IMPORT_TABLES`, `readImportArray`, `clearDatabase`,
validation des références), `src/app/AppContext.tsx` (`hasSignificantData()`).

**Tests** : tests d'écran (création, réordonnancement des étapes, modification, suppression d'une
routine) ; test du nouveau mode dans `ToolCreateModal.test.tsx`.

**Critère de sortie** : création/consultation/modification/suppression d'une routine (nom, étapes
ordonnées, durée, couleur — hors planification par jour) fonctionnelle et testée, suite verte,
`tsc -b` + lint clean, vérifié visuellement dans un navigateur.

**Réalisé (2026-09-23)** :
- `IMPLEMENTED_TOOL_TYPES` liste désormais `'routine'` — l'entrée sort de son état grisé.
- Écran unique `src/ui/screens/tools/E79RoutineDetail.tsx` (code `E79`, `screenCodes.ts`), et non
  le duo liste+détail pressenti (pattern `E76`/`E77`) : une routine est, comme une liste, un objet
  1:1 avec son `Tool` (`Tool.routine_id`), pas un module à part entrée multiple comme le Budget
  (`tableau_comptage`) — pas d'écran « liste des routines » séparé, cohérent avec l'absence
  d'écran « liste des listes ». Contenu : renommer, couleur (`ColorPicker` en mode libre), CRUD
  des étapes (titre, durée optionnelle), réordonnancement par boutons monter/descendre (▲/▼,
  échange de `position` entre l'étape et sa voisine), suppression de la routine (confirmation,
  cascade étapes + plannings).
- `src/app/contexts/useRoutineState.ts` (nouveau, pattern `useListsState.ts` pour le lazy-fetch des
  étapes plutôt que `useBudgetState.ts` — plus proche du besoin) : `routines` chargé en mémoire,
  `selectedRoutineId`/`selectRoutine` (même mécanisme que `selectedListId`), CRUD étapes.
- `useToolsState.ts` : `createToolRoutine(name, folderId)` (crée `Routine` + `Tool` liés, miroir de
  `createToolList`) ; `deleteTool` étendu pour le type `'routine'` (supprime étapes, plannings et
  la routine avant l'outil).
- `ToolCreateModal.tsx` : mode `'new-routine'` (nom seul — étapes ajoutées ensuite dans l'écran de
  détail, couleur éditable après création). `E72FolderDetail.tsx` et `E10Dashboard.tsx` (outils à
  la racine) câblés pour ouvrir/créer une routine, au même niveau que liste et budget.
- `ToolWidgetCard.tsx` (carte outil dans un dossier) et `E10Dashboard.tsx` (carte outil racine) :
  la routine affiche son propre nom et sa propre couleur (`Routine.color`, pas `Tool.color`,
  laissé à `null` pour ce type — décision Phase 1 : la couleur est intrinsèque à la routine, au
  même titre que `Task.color`, pas un attribut générique de `Tool`).
- Export/import (ajout scope, décision utilisateur en cours de phase) : `buildSnapshot.ts` inclut
  `routines`/`routine_steps`/`routine_schedules` (bump `SNAPSHOT_SCHEMA_VERSION` 3.7 → 3.8, docstring
  19 → 22 tables) ; `useSettingsState.ts` (`IMPORT_TABLES`, lecture, validation des références
  `routine_id`, écriture transactionnelle, `clearDatabase()`) ; `AppContext.hasSignificantData()`
  inclut `routineSteps.count()` (même logique que `listItems`, pas `routines` seul — une routine
  vide sans étape ne vaut pas données significatives).
- Suite complète 967/967 (20 nouveaux tests : écran `E79RoutineDetail.test.tsx`, mode routine de
  `ToolCreateModal.test.tsx`, carte routine de `ToolWidgetCard.test.tsx`, export/import routine de
  `useSettingsState.test.tsx`), `tsc -b` + `eslint` clean.
- Vérifié manuellement dans un navigateur (Playwright, serveur dev local) : création d'une routine
  depuis Accueil, ajout de deux étapes avec durée, réordonnancement, changement et retrait de
  couleur, modification et suppression d'une étape, suppression de la routine avec retour à
  l'accueil — aucune erreur console à aucune étape.
- Hors périmètre, reporté en Phase 3 : planification par jour (`RoutineSchedule`), donc le point à
  clarifier sur les flèches de navigation du sélecteur de jours.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Planification : sélecteur 7 jours + pavé numérique horaire [FAIT]

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

**Réalisé (2026-09-23)** :
- Point à clarifier tranché par Marie avant le développement (voir section dédiée en tête de
  fichier) : les flèches font avancer/reculer d'une semaine calendaire complète. Question posée
  en **mode forcé** sur demande explicite de l'utilisateur (gardien de sortie sauté, `bot.py`
  relancé pour drainer la demande), réponse reçue et consignée dans
  `COMMUNICATION/Marie/historique_conversation_marie.md`.
- `src/domain/rules/routineRules.ts` : logique pure du pavé numérique (`KeypadDigits`,
  `isKeypadDigitAllowed`, `pressKeypadDigit`, `keypadTime`, `emptyKeypadDigits`), testée
  unitairement plutôt qu'uniquement via le composant — saisie positionnelle (dizaine heures,
  unité heures, dizaine minutes, unité minutes), chaque chiffre pressé validé contre les bornes
  00:00-23:59 (ex. dizaine d'heures ≤ 2, unité d'heures ≤ 3 si dizaine = 2, dizaine de minutes ≤
  5), plutôt qu'une validation a posteriori.
- `src/ui/components/RoutineTimeKeypad.tsx` (nouveau) : pavé 0-9 + Effacer, chiffres interdits à
  la position courante grisés/désactivés (pas d'état d'erreur), affichage `HH:MM` au fur et à
  mesure, `onComplete(time)` appelé automatiquement une fois les 4 chiffres saisis.
- `src/ui/components/RoutineWeekdayPicker.tsx` (nouveau) : 7 cases lundi→dimanche avec leurs
  dates réelles (réutilise `weekStrip`/`addDays`/`formatDayBadge`/`formatMonthYear` de
  `src/domain/rules/planningSlotRules.ts`, déjà utilisés par le planning existant — pas de
  logique de date dupliquée), flèches ◀/▶ pour naviguer d'une semaine calendaire à l'autre.
  `RoutineSchedule.weekday` étant un jour de semaine récurrent (comme `TaskRecurrence.weekdays`,
  pas une date précise), la navigation change uniquement les dates affichées à titre de repère
  visuel — un jour planifié (ex. lundi) reste planifié identiquement quelle que soit la semaine
  affichée, cohérent avec le modèle de données posé en Phase 1.
- `useRoutineState.ts` : `getRoutineSchedules(routineId)` (lazy-fetch, même pattern que
  `getRoutineSteps`), `setRoutineDaySchedule(routineId, weekday, time)` (upsert : met à jour
  l'horaire si ce jour est déjà planifié, crée sinon), `removeRoutineDaySchedule(id)`.
- `E79RoutineDetail.tsx` : nouvelle section « Planification » (entre la Card renommer/couleur et
  les étapes), clic sur un jour → modale avec le pavé numérique ; jour déjà planifié → horaire
  actuel affiché + bouton « Retirer ce jour ». Pas de nouvel écran ni de nouvelle route — tout
  reste dans l'écran détail existant de la Phase 2.
- Suite complète 985/985 (18 nouveaux tests : 8 tests purs du pavé dans `routineRules.test.ts`, 4
  `RoutineTimeKeypad.test.tsx`, 4 `RoutineWeekdayPicker.test.tsx`, 2 `E79RoutineDetail.test.tsx`),
  `tsc -b` + `eslint` clean. Corrigé au passage un `await` manquant préexistant dans
  `E79RoutineDetail.test.tsx` (assertion sur une Promise non attendue, `findByText` sans `await`)
  qui provoquait une erreur asynchrone résiduelle une fois des minuteurs simulés ajoutés au même
  fichier.
- Vérifié manuellement dans un navigateur (Playwright, serveur dev local) : création d'une
  routine, planification de deux jours simultanés (lundi 07:15, mercredi 18:30) via le pavé
  numérique, validation en direct des bornes horaires (touches 3-9 grisées tant que la dizaine
  d'heures n'est pas fixée à 0/1), navigation semaine suivante/précédente (le jour récurrent
  planifié reste affiché sur toute semaine), retrait d'un jour planifié, persistance confirmée
  après retour à l'accueil puis re-navigation dans la routine — aucune erreur console.
- Hors périmètre, non touché : `hasSignificantData()` (`AppContext.tsx`) ne compte que
  `routineSteps`, pas `routineSchedules` — écart mineur assumé (une routine planifiée mais sans
  étape reste un cas marginal), à revoir si signalé en pratique.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Intégration planning (E10/E12) : affichage et coche automatique [FAIT]

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

**Réalisé (2026-09-23)** :
- Correction du constat de phase : `PlanningBoard.tsx` (E10, planning du jour) n'était en réalité
  utilisé que par E10 — `E12WeekPlanning.tsx` (planning de la semaine) est un composant à grille de
  jours totalement séparé, avec son propre chargement de données, jamais `PlanningBoard`. Les deux
  ont donc été modifiés indépendamment pour afficher les routines.
- `src/domain/rules/planningSlotRules.ts` : ajout de `weekdayOf(date)` (jour JS 0-6 d'une date),
  réutilisé pour retrouver quelles routines sont planifiées un jour donné sans dupliquer le calcul.
- `src/domain/rules/routineRules.ts` : `isRoutineOccurrenceCompleted(stepIds, completedStepIds)`,
  logique pure — une occurrence n'est jamais terminée si la routine n'a aucune étape (même principe
  que la coche automatique parent/sous-tâches existante, `useTasksState.ts` `toggleSubTask`).
- Nouvelle table `routineStepCompletions` (`id, routine_step_id, routine_id, date`, migration Dexie
  v27) : une ligne = une étape marquée faite un jour donné. Nécessaire car `RoutineSchedule.weekday`
  est un jour récurrent (Phase 1) — sans table de complétion datée, impossible de distinguer
  « fait lundi dernier » de « fait ce lundi ». `RoutineStepCompletionRepository` et
  `RoutineScheduleRepository.getByWeekday(weekday)` (nouveau) posés avec tests CRUD dédiés, sur le
  même gabarit que les repositories de la Phase 1.
- `useRoutineState.ts` : `getPlannedRoutinesForDate(date)` — résout les plannings du jour de semaine
  concerné, la routine associée et son état de complétion (agrégation steps + completions via
  `isRoutineOccurrenceCompleted`), nouveau type `PlannedRoutineOccurrence` réexporté par
  `AppContext.tsx` (même pattern que `PlannedSubTask`).
- **Écart assumé, volontaire** : seul le chemin de lecture (`getPlannedRoutinesForDate`) est posé
  dans cette phase. Aucune fonction d'écriture (« cocher une étape à telle date ») n'est exposée :
  rien dans cette phase n'a d'interface pour la déclencher, cocher les étapes est le sujet de la
  Phase 5 (écran plein écran). En pratique, la case du planning restera donc toujours non cochée
  tant que la Phase 5 n'est pas livrée — comportement attendu, pas un bug. Vérifié malgré tout que
  la lecture fonctionne bout en bout en écrivant directement une ligne `routineStepCompletions` dans
  IndexedDB via le navigateur (voir vérification manuelle ci-dessous), plutôt que de se contenter
  des tests automatisés seuls.
- `PlanningBoard.tsx` (E10) : nouveau `PlanBlock.kind === 'routine'`. Logo dédié
  (`src/ui/components/RoutineIcon.tsx`, nouveau, icône de boucle/répétition), titre
  « routine « Nom » », case à cocher **non interactive** (`disabled`, reflète l'état calculé), pas de
  bouton Reporter (n'a pas de sens pour une routine récurrente), clic sur la ligne →
  `selectRoutine` + `goTo('routine-detail')` (écran existant de la Phase 2, pas encore l'écran plein
  écran de la Phase 5 — cohérent avec le constat de phase qui anticipait ce remplacement futur).
  Tri mixte tâches/sous-tâches/routines par horaire conservé (`sortBlocks`).
- `E12WeekPlanning.tsx` : même logo, même libellé, en case (chip) parmi les tâches du jour ; clic
  ouvre aussi le détail de la routine. Pas de case à cocher dans cette vue (E12 n'en affiche pas non
  plus pour les tâches).
- Suite complète 1000/1000 (34 nouveaux tests : `weekdayOf`, `isRoutineOccurrenceCompleted`,
  `RoutineStepCompletionRepository`, `RoutineScheduleRepository.getByWeekday`, migration v27,
  blocs routine de `PlanningBoard.test.tsx`, chips routine de `E12WeekPlanning.test.tsx`),
  `tsc -b` + `eslint` clean. Corrigé au passage les 16 tests de migration de `db.test.ts` qui
  vérifiaient `verno === 26` en dur (ils rouvrent toujours la base à la dernière version connue,
  donc 27 depuis cette phase) — pas un bug introduit par cette phase, juste une conséquence
  mécanique du bump de version.
- Vérifié manuellement dans un navigateur (Playwright, serveur dev local) : création d'une routine
  planifiée mercredi 07:15, affichage correct dans le planning du jour (E10) avec logo, titre,
  horaire et case grisée non cochée ; clic → ouvre le détail routine (E79) ; affichage correct dans
  le planning de la semaine (E12) sur la bonne case de jour, clic → ouvre aussi le détail routine ;
  navigation à la semaine suivante en E12 (simulation du glissement tactile) : la routine récurrente
  réapparaît sur le même jour de semaine (mercredi 30/09), confirmant le modèle récurrent et non
  daté posé en Phase 1 ; écriture directe d'une ligne `routineStepCompletions` dans IndexedDB puis
  rechargement : la case du planning passe bien à cochée/« terminée » — confirme que le chemin de
  lecture fonctionne bout en bout en conditions réelles, au-delà des tests automatisés. Aucune
  erreur console à aucune étape. Donnée de vérification retirée après contrôle.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Écran plein écran des étapes (cocher, sous-tâches pliables) [FAIT]

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

**Réalisé (2026-09-23)** :
- Nouvel écran `src/ui/screens/tools/E80RoutineSteps.tsx` (code `E80`, route `routine-steps` avec un
  paramètre `date` optionnel — repli sur `todayStr()` si absent, même convention que `PlanningBoard`).
  Il remplace, comme anticipé par le constat de la Phase 4, la destination du clic sur un bloc routine
  du planning : `PlanningBoard.tsx` (E10) et `E12WeekPlanning.tsx` (E12) ouvrent désormais cet écran
  (avec respectivement le jour affiché et le jour précis de la case cliquée) au lieu du détail routine
  E79, qui reste seul point d'entrée pour la gestion (renommer, planifier, ajouter/modifier/supprimer
  une étape), accessible depuis le dossier/outil.
- Étapes listées dans l'ordre (`position`), chacune avec une case à cocher qui reflète et modifie sa
  complétion pour la date affichée : nouvelle fonction `toggleRoutineStepCompletion(routineId, stepId,
  date)` dans `useRoutineState.ts` (upsert/suppression dans `routineStepCompletions`, table posée en
  Phase 4) et `getRoutineStepCompletionsForDate(routineId, date)` pour lire l'ensemble des étapes
  cochées ce jour-là. Ferme l'écart assumé de la Phase 4 : la case du planning se coche désormais
  réellement depuis cet écran, plus seulement en écriture directe IndexedDB de vérification.
- Sous-tâches d'une étape : réutilisation intégrale du mécanisme `Task`/`parent_id` déjà existant pour
  les sous-tâches de tâche (`getSubTasks`, `toggleSubTask`, `addSubTask`, `deleteSubTask` de
  `useTasksState.ts`, sans aucune fonction nouvelle côté données), conformément à la décision déjà
  actée en Phase 1 (« sans changement de schéma supplémentaire »). Chaque étape est toujours dépliable
  (bouton `done/total` même à 0/0), pour permettre d'ajouter sa première sous-tâche — la création se
  fait directement dans cet écran (aucune autre entrée existante ne le permettait).
- **Écart assumé, volontaire** : la complétion d'une sous-tâche n'est pas datée (elle réutilise le
  statut normal de `Task`, comme partout ailleurs dans l'app — sous-tâches de tâche, d'élément de
  liste), contrairement à la case de l'étape elle-même. Une sous-tâche cochée reste donc cochée aux
  prochaines occurrences du même jour de semaine, sans réinitialisation automatique, et son état ne
  déclenche pas la coche automatique de l'étape parente (mécanismes de complétion distincts, non
  reliés). Cohérent avec le peu de matière du retour sur ce point (« sous-tâches pliables » seulement)
  et avec l'absence de toute réinitialisation automatique ailleurs dans l'app ; à revoir si Marie
  signale en pratique qu'une sous-tâche de routine doit se réinitialiser chaque jour comme l'étape.
- Suite complète 1009/1009 (9 nouveaux tests : 7 `E80RoutineSteps.test.tsx`, 1 entrée `screenCodes.test.ts`,
  1 entrée `App.suspense.test.tsx`), `tsc -b` + `eslint` clean. Tests de navigation existants mis à
  jour (`PlanningBoard.test.tsx`, `E12WeekPlanning.test.tsx`) : le clic sur un bloc routine attend
  désormais `goTo({ name: 'routine-steps', date })` au lieu de `goTo('routine-detail')`.
- Vérifié manuellement dans un navigateur (Playwright, serveur dev local) : clic sur la routine planifiée
  du planning du jour (E10) → ouvre E80 avec le nom de la routine, la date du jour affiché et son étape
  existante ; cocher l'étape puis retour à l'accueil → la case du planning du jour passe bien à
  cochée/« terminée » (ferme bout en bout l'écart de lecture-seule de la Phase 4) ; clic sur la puce
  routine du planning de la semaine (E12) → ouvre E80 avec la date exacte du jour cliqué, étape déjà
  cochée retrouvée ; dépliage d'une étape sans sous-tâche, ajout d'une sous-tâche, coche de la
  sous-tâche (1/1) — aucune erreur console à aucune étape. Sous-tâche de vérification supprimée et
  étape décochée après contrôle, pour ne pas laisser de donnée de test dans le profil de développement
  partagé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Modification d'une routine : tous les jours vs un seul jour [FAIT]

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

**Réalisé (2026-09-24)** :
- Mécanisme propre à `RoutineStep`/`RoutineSchedule`, sans réutiliser `persistSeriesBatch`
  (`seriesPersistence.ts`) : ce dernier détache une occurrence *datée* d'une série de `Task`
  (un jour précis dans le calendrier), alors que toute la routine est modélisée par jour de
  semaine *récurrent* depuis la Phase 1 (`RoutineSchedule.weekday`, pas de date). Reprendre le
  modèle par occurrence datée aurait introduit une notion étrangère au reste de la routine ;
  le détachement « un seul jour » porte donc sur le jour de semaine récurrent (ex. « tous les
  mercredis »), pas sur une date isolée — cohérent avec le reste du modèle, à revoir seulement
  si Marie signale explicitement vouloir un détachement par date précise plutôt que par jour de
  semaine.
- `RoutineStep` gagne `weekday: number | null` (`null` = étape commune, partagée par tous les
  jours non détachés ; un numéro = étape propre à ce jour, indépendante). `RoutineSchedule`
  gagne `steps_overridden: boolean` (jour détaché ou non). Migration Dexie v28
  (`db.ts`), défaut `weekday: null` / `steps_overridden: false` sur les lignes existantes.
  Import JSON (`useSettingsState.ts`) : mêmes défauts appliqués aux exports antérieurs à cette
  phase, qui n'ont pas ces champs (même convention que `description ?? ''` déjà en place pour
  les anciens exports de liste).
- `useRoutineState.ts` : `resolveEffectiveSteps` (interne) résout, pour une routine et un jour
  de semaine donné, soit les étapes communes soit les étapes propres au jour selon
  `steps_overridden` — réutilisé par `getRoutineCompletionForDate` (corrige au passage un angle
  mort introduit par cette phase elle-même : sans cette résolution, la complétion automatique du
  planning aurait compté indistinctement étapes communes et étapes de tous les jours détachés).
  Nouvelles fonctions exposées : `getRoutineStepsForDate(routineId, date)` (résolution + indicateur
  `overridden`), `detachRoutineDay(routineId, weekday)` (clone les étapes communes vers ce jour,
  marque le jour détaché), `reattachRoutineDay(routineId, weekday)` (supprime les étapes propres
  au jour, redevient commun). `addRoutineStep`/`moveRoutineStep` acceptent un `weekday` optionnel
  (`null` par défaut, comportement E79 inchangé) pour opérer sur le bon sous-ensemble d'étapes.
- `E80RoutineSteps.tsx` (écran plein écran de la Phase 5) : bouton « Modifier ce jour », visible
  uniquement si ce jour de semaine est planifié. Premier clic → détache automatiquement (clone les
  étapes communes) puis ouvre un mode édition (ajouter/modifier/supprimer/réordonner, même gabarit
  que E79) scopé à ce jour ; jours déjà détachés → édition directe. Bandeau « Ce jour a ses propres
  étapes, indépendantes des autres jours. » avec bouton « Revenir à la version commune » qui
  supprime les étapes propres au jour et réaligne sur les étapes communes. `E79RoutineDetail.tsx`
  (gestion structurelle globale) reste inchangé : ses fonctions opèrent implicitement sur les
  étapes communes (`weekday: null`), sans toucher aux jours détachés.
- **Écart assumé, volontaire** : les sous-tâches (Phase 5) ne sont pas recopiées lors d'un
  détachement — une étape clonée démarre sans sous-tâche, même si l'étape commune d'origine en
  avait. De même, `RoutineStepCompletion` référence l'id de l'étape ; après détachement, les
  étapes du jour changent d'id, donc l'historique de complétion de ce jour précis (s'il y en avait
  un avant détachement) ne s'applique plus aux nouvelles étapes clonées. Cohérent avec le
  peu de matière du retour sur ce point ; à revoir si signalé en pratique.
- Suite complète 1018/1018 (16 nouveaux tests : entités/règles `routineRules.test.ts`,
  repositories `routineStepRepository.test.ts`/`routineScheduleRepository.test.ts`, migration
  `db.test.ts`, écran `E80RoutineSteps.test.tsx`), `tsc -b` + `eslint` clean (un avertissement
  `react-hooks/exhaustive-deps` corrigé en cours de phase en stabilisant `resolveEffectiveSteps`/
  `getRoutineCompletionForDate` via `useCallback`, sans changement de comportement).
- Vérifié manuellement dans un navigateur (Playwright, serveur dev local, sur une page rechargée
  à neuf pour écarter tout artefact de rechargement à chaud du serveur dev pendant le codage) :
  depuis le planning du jour (E10), ouverture d'E80 pour mercredi, coche/décoche de l'étape
  commune (chemin Phase 5 non régressé) ; « Modifier ce jour » détache et clone l'étape ; titre
  modifié sur l'étape détachée puis vérifié, via E79 (outil), que l'étape commune reste inchangée
  (« Se brosser les dents », sans le suffixe de test) ; ajout d'une seconde étape propre au jour et
  réordonnancement (▲/▼) en mode édition ; « Revenir à la version commune » supprime les deux
  étapes propres au jour et rétablit l'étape commune seule. Aucune erreur console générée par le
  code de cette phase. Données de test nettoyées après contrôle (retour à l'état commun, décoche).
- **Constat hors périmètre, signalé et non corrigé** : en testant le clic sur le bandeau de jours
  d'E10 (`PlanningBoard.tsx`), React relève systématiquement une erreur console « Cannot update a
  component (`AppProvider`) while rendering a different component (`PlanningBoard`) » —
  reproductible sur un jour sans aucune routine planifiée, donc indépendante du travail de cette
  phase. Cause identifiée par lecture de code : `updateDisplayDate`/`jumpTo`
  (`PlanningBoard.tsx:414-425`, non modifié par cette phase) appellent `replace(...)` (setState de
  `AppProvider`) à l'intérieur de la fonction de mise à jour passée à `setDisplayDate`, ce qui
  s'exécute pendant le rendu de `PlanningBoard` — anti-pattern React préexistant, probablement
  introduit par la refonte du bandeau de jours (`roadmap_retours_2026-09-22.md`, Phase 5,
  antérieure à cette roadmap). N'empêche pas l'app de fonctionner (avertissement React, pas un
  crash) mais mérite un correctif dédié, hors périmètre de cette roadmap Routine.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
