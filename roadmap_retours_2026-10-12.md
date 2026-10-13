# Roadmap — Retours testeur du 2026-10-10/11 (Marie, appareil 192f2411)

Créée le 2026-10-12 par `/traiter_retours`. Retours reçus sur v6.9/v6.11. Les réponses sont mises
en file d'attente de déploiement (`queue_pending_feedback_reply.py`), publiées au prochain `/deploy`.

Légende : `[TODO]` · `[EN COURS]` · `[FAIT]`. Une seule phase `[EN COURS]` à la fois. Statuts mis à
jour par `/close`.

## Retours analysés

| Retour | Écran | Constat | Traitement |
|---|---|---|---|
| 6fbf95e8 | E10 | Cartes outils hors de la page | Phase 1 |
| 754db232 | E12 | Planning de la semaine : cases du bas inaccessibles | Phase 1 |
| b8f42e4e | E72 | Création de liste impossible sans catégorie | Phase 2 |
| 5cd28d81 | E72 | Pas de dossier dans un dossier | Phase 3 |
| 979d0ddd | E80 | Durée de la routine non modifiable pour un jour | Phase 4 |
| c755cb11 | E122 | Envoi d'un retour impossible sans image | Phase 5 |
| 9ac356a8 | E10 | Relance : « ⋯ » sur « Mon compte » | Question à Marie (actions attendues), état `attend_testeur` |
| bac22741 | E112 | Retirer « Couleur des outils » | Question à Marie (couleur des routines), état `attend_testeur` |
| df7ee31d | E10 | Nouvel outil « Tableau prévisions » | Roadmap dédiée plus tard, état `attend_decision` |
| b5087222 | E10 | Dépense non demandée quand la tâche se coche via ses sous-tâches | Phase 1 bis |
| bac22741 | E112 | Retirer « Couleur des outils » (routines : couleur conservée, décision de Marie) | Phase 1 bis |
| 903bfcef | E79 | Renommer une routine | Déjà en production : réponse directe déposée le 2026-10-13 |
| 951ce1c6 | E79 | Sous-tâches par étape de routine | Phase 1 ter |
| 9ac356a8 | E10 | « ⋯ » sur « Mon compte » : ranger / supprimer | Question A/B posée à Marie le 2026-10-13, état `attend_testeur` ; phase après sa réponse |
| 80dcd005 | E22 | Choix de portée à la décomposition d'une tâche récurrente, et sélection des occurrences | Décision produit en attente (voir Phase 1 quater) |

---

## Phase 1 — Petits correctifs : grille des outils (E10), défilement du planning (E12) [TODO]

- **6fbf95e8** — Constat : `E10Dashboard.tsx:137` `gridTemplateColumns: 'repeat(3, 1fr)'` ; une
  piste `1fr` ne descend pas sous la largeur min-content de la carte (libellé + `📁` +
  `paddingRight: 32px` de `cardWithMenuStyle`, `ToolActionsMenu.tsx:32`) : la 3e colonne sort de
  l'écran. Correctif : `repeat(3, minmax(0, 1fr))`, `minWidth: 0` sur les cartes, césure des
  libellés longs.
- **754db232** — Constat : `E12WeekPlanning.tsx:120-129` chaque colonne de jour défile seule
  (`overflowY: 'auto'` par colonne), le cadre est en `overflow: hidden` (`:70`) : pas de défilement
  commun, rien n'indique qu'une colonne défile. Correctif : un seul défilement vertical pour les 7
  colonnes, en-têtes des jours fixés en haut ; vérifier que le glissement horizontal (changement de
  semaine, `:221-241`) ne gêne pas le défilement vertical.
- Fichiers pressentis : `E10Dashboard.tsx`, `ToolActionsMenu.tsx`, `E12WeekPlanning.tsx`.
- Tests : `E10Dashboard.test.tsx` (style de grille), `E12WeekPlanning.test.tsx` (conteneur de
  défilement unique). Contrôle visuel à 375 px.
- Critère de sortie : gates verts, trois cartes tenant dans la largeur avec un libellé long, planning
  de la semaine défilant d'un bloc.

### Réalisé (2026-10-12)

- `E10Dashboard.tsx` : grille `repeat(3, minmax(0, 1fr))`, cartes `minWidth: 0` avec marge
  intérieure réduite (libellé sous le « ⋯ » au lieu d'une marge droite de 32 px), césure
  (`overflowWrap: anywhere`, `hyphens`/`WebkitHyphens: auto`).
- `E12WeekPlanning.tsx` : un seul conteneur de défilement pour les 7 colonnes (`week-scroll`),
  colonnes sans défilement propre, en-têtes des jours `sticky` ; le glissement horizontal ignore un
  geste surtout vertical (pas de décalage ni de changement de semaine).
- Tests : `E10Dashboard.test.tsx` (+1), `E12WeekPlanning.test.tsx` (+2). Gates : vitest 1201/1201,
  `tsc -b` et lint verts.
- Contrôle visuel (Playwright, 375 px, serveur de dev) : aucune largeur de page excédentaire, 6
  cartes dans 343 px ; planning à 36 tâches sur un jour défilant jusqu'en bas, en-têtes restés en
  haut. Non vérifié : rendu de la césure sur Safari iOS (le Chromium de test n'a pas de dictionnaire
  français, « Administratif » y est coupé sans tiret).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 1 bis — Petits correctifs : dépense à la coche automatique (E10), couleur des outils (E112) [TODO]

- **b5087222** — Constat : `toggleSubTask` (`useTasksState.ts:99-113`) complète le parent quand toutes
  les sous-tâches le sont, sans passer par la fenêtre de dépense, qui n'existe que dans
  `PlanningBoard.tsx` (`handleComplete` `:450`, `handleToggleSubTaskRow` `:476`). Correctif : si le
  parent porte `expense_planned`, ne pas le compléter dans `toggleSubTask` ; l'écran ouvre la fenêtre
  de dépense puis complète le parent via `finishExpenseTask`. Périmètre décidé : E10 seulement. E22
  (`:562`) et E23 (`:299`) complètent aussi le parent sans fenêtre de dépense : à signaler, non traité.
- **bac22741** — Constat : `E112Accessibility.tsx:213-262` (rubrique « Couleur des outils », couleur
  de `Mon compte` et de chaque outil). Décision de Marie : les routines gardent leur couleur
  (`routine.color`, `E10Dashboard.tsx:167`) ; les autres outils prennent la couleur d'ambiance et
  la création d'un outil ne demande plus de couleur. À faire : retirer la rubrique, l'usage de
  `tool.color` / `mon_compte_color` à l'Accueil et le choix de couleur à la création (hors routine) ;
  champs de données laissés en place (pas de migration).
- Tests : `PlanningBoard` (parent à dépense coché via sous-tâches), `E112Accessibility`,
  `E10Dashboard` (couleur d'ambiance, couleur de routine conservée).
- Critère de sortie : gates verts.

**Réalisé**
- b5087222 : `toggleSubTask(subTask, { deferExpenseParent })` (`useTasksState.ts:99`) renvoie le parent
  à dépense prévue au lieu de le compléter ; `PlanningBoard.tsx` (`handleComplete`,
  `handleToggleSubTaskRow`) ouvre alors la fenêtre de dépense, puis `finishExpenseTask` complète le
  parent. E22 / E23 / E80 appellent sans l'option : comportement inchangé (hors périmètre). Tests :
  `AppContext.test.tsx` (parent différé), `PlanningBoard.test.tsx` (fenêtre ouverte, dépense
  enregistrée, parent terminé ensuite).
- bac22741 : rubrique « Couleur des outils » retirée d'`E112Accessibility.tsx` ; `E10Dashboard.tsx`
  et `ToolWidgetCard.tsx` n'utilisent plus `tool.color` (seule `routine.color` colore une carte) ;
  « Mon compte » sans contour. Aucun choix de couleur n'existait à la création d'un outil non routine
  (`ToolCreateModal.tsx`) : rien à retirer. Champs `tool.color` / `mon_compte_color` laissés en place ;
  `updateToolColor` (`useToolsState.ts:90`) n'a plus d'appelant (dette signalée, non retirée).
  Tests adaptés : `E112Accessibility`, `E10Dashboard`, `ToolWidgetCard`.
- Gates : `npx vitest run` (1198 tests), `npx tsc -b`, `npm run lint` verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 1 ter — Sous-tâches par étape dans la configuration d'une routine (E79) [TODO]

- **951ce1c6** — Constat : E80 gère déjà les sous-tâches d'une étape (`subTasksByStep`,
  `E80RoutineSteps.tsx:250`, `parent_id` = id de l'étape) ; la fenêtre « Modifier l'étape » d'E79
  (`E79RoutineDetail.tsx:335-350`) ne propose que titre et durée.
- À vérifier au début de la phase : comportement des sous-tâches avec des étapes personnalisées pour
  un jour (`steps_overridden`, `useRoutineState.ts:117-202`), et absence de migration Dexie.
- Tests : ajout / suppression / affichage de sous-tâches d'une étape depuis E79.
- Critère de sortie : gates verts.

**Réalisé (2026-10-13)** :
- `E79RoutineDetail.tsx` : la fenêtre « Modifier l'étape » liste les sous-tâches de l'étape
  (`getSubTasks`), permet d'en ajouter (`addSubTask`, bouton ou Entrée) et d'en supprimer
  (`deleteSubTask`), effet immédiat comme dans E80. Aucune migration Dexie (`parent_id` = id de l'étape).
- Tests : 3 ajoutés dans `E79RoutineDetail.test.tsx` (affichage, ajout, suppression).
- Gates : `npx vitest run` (1201 tests), `npx tsc -b`, `npm run lint` verts.
- Corrigé dans la phase (`useRoutineState.ts`) : `detachRoutineDay` copie les sous-tâches des étapes
  clonées ; `deleteRoutineStep`, `reattachRoutineDay` et `removeRoutineDaySchedule` suppriment les
  sous-tâches des étapes effacées. 2 tests ajoutés dans `useRoutineState.test.tsx` (1203 tests verts).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 1 quater — Portée des modifications d'une tâche récurrente (E22 / E23) [TODO]

**Décision du 2026-10-13 : option A retenue** (choix de portée à la décomposition). **Option B
(sélection personnalisée des occurrences, par jours de la semaine) : à cadrer avec Marie avant toute
planification** — question à lui poser (fonctionnement attendu, jours de la semaine ou dates
précises, quelles modifications concernées), puis phase dédiée.

- **80dcd005** — Constat : les modifications de champs et la suppression demandent déjà
  « cette occurrence / toute la série » (`E22TaskDetail.tsx:416-460`, `usePlanningState.ts:360-410`).
  La décomposition en sous-tâches (E23, `addSubTask`) n'en demande aucune : les sous-tâches ne
  s'ajoutent qu'à l'occurrence ouverte (seul `usePlanningState.ts:263` les copie, lors d'une
  recréation de série). Le choix ne propose que deux options (cette occurrence / elle et les
  suivantes non détachées) : pas de sélection par jours de la semaine.
- Options : (A) ajouter le choix de portée à la décomposition ; (B) sélection personnalisée des
  occurrences (jours de la semaine) pour toute modification. A est moyen, sans migration ; B est
  lourd (interface de sélection, règles de propagation). Décision à prendre avant de planifier.

**Réalisé (option A)** : `addSubTaskScoped(taskId, title, scope)` dans `usePlanningState.ts`
(même périmètre que `updateTaskFields` : occurrence ouverte + suivantes non détachées) ; E23
(`E23Decompose.tsx`) ouvre le choix « Cette occurrence / Toutes les occurrences / Annuler » à
l'ajout si la tâche est récurrente. 4 tests ajoutés/adaptés (1207 tests verts, `tsc -b` et lint verts).
Non couvert : la suppression d'une sous-étape reste limitée à l'occurrence ouverte ; option B en attente de Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Liste sans catégorie (E72 / E61) [TODO]

- **b8f42e4e** — Constat : `ToolCreateModal.tsx:92` et `:201` exigent `categories.length > 0` ;
  `listItem.ts:7` `category_id: string` obligatoire, `E61ListDetail.tsx:273` n'affiche que des
  catégories. Une liste sans catégorie n'a aucun moyen d'ajouter un élément.
- Approche à arrêter en début de phase (ne pas trancher sur hypothèse) : catégorie implicite
  masquée vs `category_id` facultatif (migration Dexie, version 29, et sync).
- Fichiers pressentis : `ToolCreateModal.tsx`, `E61ListDetail.tsx`, `listItem.ts`, `db.ts`, état
  des listes.
- Tests : création sans catégorie, ajout/cochage d'un élément dans une liste sans catégorie,
  liste avec catégories inchangée.
- Critère de sortie : gates verts, e2e listes si couvert.

**Réalisé** : approche retenue = élément sans catégorie stocké avec `category_id` vide (aucune
migration Dexie, aucun changement de synchronisation). `ToolCreateModal.tsx` : catégories facultatives,
« Créer » actif dès que le nom est saisi. `E61ListDetail.tsx` : une liste sans catégorie affiche
directement ses éléments (ajout, cochage, suppression) ; si des catégories sont ajoutées ensuite,
une ligne « Sans catégorie » conserve l'accès aux éléments existants. 3 tests ajoutés/adaptés
(1210 tests verts, `tsc -b` et lint verts). e2e `09-tools-folders-lists` : 4 tests en échec dans
l'onboarding (`e2e/helpers/reset.ts:29`), échec reproduit sans le correctif (antérieur) ; texte
attendu de T54 aligné sur le nouvel écran, non exécutable tant que l'onboarding e2e est cassé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Dossiers dans un dossier (E72 / E10) [TODO]

- **5cd28d81** — Constat : `folder.ts` sans dossier parent ; `ToolCreateModal.tsx:132` propose
  « Nouveau dossier » seulement si `folderId === null` ; `E10Dashboard.tsx:51` affiche tous les
  dossiers à la racine ; `FolderActionsMenu` (`ToolActionsMenu.tsx:166`) ne propose pas
  « Déplacer ».
- À faire : `parent_id` sur `Folder` (migration Dexie + sync), création dans un dossier, Accueil
  limité aux dossiers racine, E72 listant ses sous-dossiers, déplacement d'un dossier (interdire de
  le déplacer dans lui-même ou un descendant), suppression récursive avec confirmation explicite.
- Fichiers pressentis : `folder.ts`, `db.ts`, état des outils/dossiers, `ToolCreateModal.tsx`,
  `ToolActionsMenu.tsx`, `E72FolderDetail.tsx`, `E10Dashboard.tsx`.
- Tests : règles de déplacement (cycle interdit), suppression récursive, affichage racine/sous-dossier,
  migration.
- Critère de sortie : gates verts, e2e dossiers si couvert.

**Réalisé (2026-10-13)** :
- `Folder.parent_id` facultatif (absent ou `null` = racine) : aucune migration Dexie (pas d'index,
  filtrage en mémoire), sync par blob JSON inchangée, anciens dossiers lus comme racine.
- `folderRules.ts` : `getChildFolders`, `getDescendantFolderIds`, `canMoveFolder` (refus : soi-même,
  descendant, même parent, dossier ou cible inconnus).
- `useToolsState.ts` : `createFolder(name, parentId)`, `moveFolder`, `deleteFolder` récursif (outils
  de tous les sous-dossiers effacés, Budget ramené à la racine).
- UI : « Nouveau dossier » proposé aussi dans un dossier (`ToolCreateModal.tsx`) ; E10 et E70 limités
  aux dossiers racine ; E72 liste ses sous-dossiers ; `FolderActionsMenu` propose « Déplacer » (sans
  soi-même ni descendants) et annonce sous-dossiers et outils effacés.
- Tests : `folderRules.test.ts` (+10), `AppContext.test.tsx` (+1 : cycle refusé, suppression
  récursive), `ToolActionsMenu`, `ToolCreateModal`, `E72FolderDetail`, `E70Tools`, `E10Dashboard`.
  Gates : vitest 1229/1229, `tsc -b` et lint verts.
- E2E `09-tools-folders-lists` non relancé : cassé à l'onboarding avant les correctifs (signalé en
  Phase 2).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Durée d'une routine pour un jour donné (E80) [TODO]

- **979d0ddd** — Constat : `RoutineSchedule` (`routine.ts:15-22`) porte `weekday` et `time`, pas
  de durée ; seule `Routine.duration_minutes` existe. E80 permet de changer l'heure du jour
  (`E80RoutineSteps.tsx:436-439`) et les étapes (`:441-445`), pas la durée.
- À faire : durée facultative par jour planifié (repli sur la durée de la routine), édition depuis
  E80 à côté de l'heure, prise en compte dans le planning (heure de fin) ; migration Dexie + sync.
- Tests : durée du jour prioritaire sur la durée commune, repli, heure de fin dans le planning.
- Critère de sortie : gates verts.

### Réalisé (2026-10-13)

- `RoutineSchedule.duration_minutes?: number | null` (`routineSchedule.ts`) : champ facultatif, non
  indexé, donc aucune migration Dexie ; la synchronisation (blob JSON) et l'import le conservent
  (`useSettingsState.ts` copie le planning par `...schedule`).
- Règle `effectiveRoutineDuration(schedule, routine)` (`routineRules.ts`) : durée du jour si
  définie, sinon `Routine.duration_minutes`.
- `useRoutineState.ts` : `setRoutineDayDuration(routineId, weekday, minutes | null)` ne touche que
  le jour visé ; `getPlannedRoutinesForDate` calcule durée et heure de fin avec la règle, ce qui
  alimente la hauteur et l'heure de fin du planning (`PlanningBoard.tsx`) sans autre changement.
- E80 : bouton « Durée : N min » (ou « Définir la durée ») sous la date, fenêtre « Changer la
  durée » (sélecteur de durée existant, « Enregistrer », « Utiliser la durée de la routine »).
- Tests : `routineRules.test.ts` (+3), `useRoutineState.test.tsx` (+2), `E80RoutineSteps.test.tsx`
  (+4). Gates : vitest 1238/1238, `tsc -b` et `npm run lint` verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Retour sans image (E122, serveur Supabase) [TODO]

- **c755cb11** — Constat : `E122FeedbackCapture.tsx:96` `canSend` exige une image ;
  `feedbackRules.ts:8-9` image obligatoire ; `feedbackReport.ts:18-20` `image_blob: Blob` ;
  `supabase/feedback.sql:10-11` `storage_path not null`, `image_bytes > 0`, RPC (`:37-81`,
  `:325-362`) contrôlant le chemin de l'image.
- À faire : image facultative de bout en bout — domaine, file d'envoi (pas d'upload Storage sans
  image), migration SQL (colonnes nullable, RPC tolérant l'absence d'image), affichage E123/E124
  sans image, scripts dev (`read_feedback_reports.py` ne télécharge rien sans `storage_path`).
- **Migration SQL à appliquer manuellement sur Supabase avant `/deploy`** (anciens clients encore
  en circulation : la RPC doit rester compatible avec un envoi avec image).
- Tests : règle de validité (texte seul accepté, rien du tout refusé), envoi sans image, scripts
  Python.
- Critère de sortie : gates verts, migration appliquée et un envoi sans image constaté en base.

### Réalisé (2026-10-13)

- Domaine : `FeedbackReport.image_blob: Blob | null` (champ Dexie non indexé, aucune migration
  locale) ; `isFeedbackReportValid` accepte un texte seul, exige un commentaire sans image, refuse
  un retour vide.
- Envoi (`feedbackClient.ts`) : sans image, pas de téléversement Storage, `p_storage_path` et
  `p_image_bytes` envoyés à `null`.
- E122 : envoi possible sans capture (texte d'aide mis à jour) ; E124 : pas de capture affichée
  sans image (E123 n'affiche pas l'image).
- `scripts/read_feedback_reports.py` : un retour sans `storage_path` n'est pas téléchargé.
- `supabase/feedback.sql` (section ajoutée en fin de fichier) : `storage_path` et `image_bytes`
  nullables (la contrainte `image_bytes > 0` laisse passer `NULL`), `submit_feedback_v2` remplacée
  (même signature, chemin nul accepté avec octets nuls et commentaire non vide ; contrôles
  inchangés quand un chemin est fourni, donc anciens clients compatibles).
- Tests : `feedbackRules.test.ts` (+3), `feedbackClient.test.ts` (+1), `E122FeedbackCapture.test.tsx`
  (+1), `E124FeedbackDetail.test.tsx` (+2), `test_read_feedback_reports.py` (+1). Gates : vitest
  1245/1245, `tsc -b`, lint, scripts Python 100/100.
- **Reste à faire avant `/deploy`** : appliquer la section SQL ajoutée en fin de `supabase/feedback.sql`
  dans le SQL Editor Supabase, puis constater un envoi sans image en base (critère de sortie non
  atteint tant que ce n'est pas fait).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
