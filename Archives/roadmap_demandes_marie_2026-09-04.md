# Roadmap — Demandes Marie du Google Doc (analyse 2026-09-04)

## Origine

Google Doc « Modifications » (`https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`),
modifié le 2026-09-04 19:48 UTC, analysé le même jour (`/analyser_googledoc`, depuis `/deploy`
étape 0.4). Réconciliation complète du différentiel dans `_contexte/marie_modifications_suivi.md`
(13 demandes retirées du Doc ce même passage : #3, #19, #21, #22, #23 à #33 — comportement livré
v5.84 conservé pour toutes sauf #3, abandonnée). Cette roadmap ne couvre que les 6 demandes encore
actives à l'issue de cette analyse.

## Analyse du Google Doc — traçabilité catégorie → demande → état → traitement

| N° (Doc) | Catégorie | État à l'analyse | Traitement |
| --- | --- | --- | --- |
| 33 (reprise Doc) | Accueil / Planning | Évolution à concevoir (revient sur #19, déjà livrée) | Phase 1 |
| 34 | Énergie | Évolution à concevoir | Phase 1 |
| 35 | Paramètres / Profil | Évolution à concevoir (fonctionnalité nouvelle) | Phase 2 |
| 36 | Paramètres / Profil | Évolution à concevoir | Phase 1 |
| 37 | Tâches | Évolution à concevoir (refonte, remplace #3 abandonnée) | Phase 3 |
| 38 | Accueil / Planning | Évolution à concevoir (référence de Marie introuvable dans le code, cf. Précisions) | Phase 4 |

## État constaté dans le code (2026-09-04)

- **33 (reprise Doc) / #19** — `PlanningBoard.tsx:56-64` (`dateStripBoxStyle`) : `border: 2px solid
  <couleur>` **et** `backgroundColor: color-mix(in srgb, <couleur> 14%, var(--color-surface))`.
  Marie veut retirer le fond, garder uniquement le contour (elle revient explicitement sur #19,
  livrée v5.84 et validée `ok` par elle le 2026-09-03).
- **#34** — `EnergyDisplay.tsx:14-24,33` (`chipStyle` + `backgroundColor:
  pastelBackground(ambianceColor)`) : bordure générique grise (`1px solid var(--color-border)`),
  fond teinté de la couleur d'ambiance. Même motif à inverser que #19/33.
- **#36** — même motif `backgroundColor: pastelBackground(color)`, aucune bordure colorée, à trois
  endroits : `ToolWidgetCard.tsx:38` (`ToolCard`, écran Outils `E70Tools.tsx`),
  `E10Dashboard.tsx:133` (carte « Mon compte », `settings.mon_compte_color`) et
  `E10Dashboard.tsx:148-151` (grille « Outils » de l'accueil, `tool.color`).
- **#35** — aucune notion de « catégorie de tâche » dans le domaine actuel. `task.color` est une
  couleur libre choisie via `ColorPicker.tsx` (`<input type="color">` natif — le « panel de
  couleur » cité par Marie est very probablement le sélecteur natif du système qui s'ouvre au tap,
  cohérent avec sa description). Aucune entité de catégorie de tâche n'existe (à distinguer de
  `listCategory.ts` et `budgetCategory.ts`, qui couvrent d'autres domaines). Fonctionnalité
  entièrement nouvelle.
- **#37** — `E22TaskDetail.tsx` : fond coloré seulement si `task.scheduled_date`, et avec la
  couleur d'**ambiance** (pas la couleur de la tâche, `:427-430`) — déjà un écart avec la demande
  (« fond de la couleur de la tâche »). Champs en cases empilées sur une colonne (`fieldRowStyle`,
  `:254-264`), non cliquables (texte statique). 4 boutons d'action dont « Modifier » (`:502-504`)
  qui ouvre `E24EditTask.tsx`, écran séparé. `minHeight: 100svh` déjà présent sur `pageStyle`
  (`:31-40`) donc l'écran occupe déjà toute la hauteur même sans sous-tâches — le point « je veux
  que la page prenne tout l'écran » semble déjà satisfait visuellement, à reconfirmer au rendu réel
  (pas de preuve visuelle disponible dans cette analyse). #37 acte explicitement l'abandon de #3
  (« on abandonne la modification "cadre date et heure qui dépasse de l'écran" »).
- **#38** — recherche exhaustive : aucune animation de glissement personnalisée n'existe pour
  l'heure ou la durée. `E21CreateTaskV2.tsx:314` utilise un `<input type="time">` natif ;
  `DurationRoller.tsx` utilise des `<select>` natifs (aucun glissement custom). **Le modèle de
  référence cité par Marie n'existe pas dans le code actuel** — seule animation à glissement
  réelle : le bandeau des jours de `PlanningBoard.tsx` (`dragOffset` / `transform: translateX`,
  `:411-431,486-491`), qui est justement l'élément visé par la demande. Le « saut au relâchement »
  qu'elle décrit s'explique par le code : `handleTouchEnd` (`:422-431`) remet `dragOffset` à `0`
  **pendant que** `jumpTo` change `stripCenter`, sans transition continue entre les deux états — la
  case centrale change de jour instantanément plutôt que de glisser jusqu'à sa position finale.

## Décisions produit

Aucune de ces décisions ne bloque le démarrage d'une phase : ce sont des choix d'implémentation
documentés, à valider par Marie via le parcours de test correspondant (comme pour la plupart des
demandes précédentes de ce registre), pas des points structurants nécessitant une réponse
préalable.

- **D1 (Phase 1)** — La carte « Mon compte » de l'accueil (`E10Dashboard.tsx:133`) n'est pas
  littéralement « une carte d'outil », mais suit le même motif visuel. Retenu : lui appliquer le
  même traitement contour/sans-fond par cohérence, à confirmer par Marie au test.
- **D2 (Phase 2, #35)** — Une fois au moins une catégorie de couleur configurée, le sélecteur de
  couleur à la création/modification d'une tâche n'affiche plus que les catégories (lecture
  littérale de la demande) ; tant qu'aucune catégorie n'est configurée, le `ColorPicker` actuel
  reste inchangé (pas de régression pour qui n'utilise pas cette fonctionnalité).
- **D3 (Phase 2, #35)** — La valeur stockée sur la tâche reste `task.color` (couleur effective),
  pas une référence à la catégorie : pas de migration de données nécessaire, cohérent avec le
  modèle actuel de couleur libre. Une tâche déjà colorée avant l'activation du code couleur garde
  sa couleur affichée telle quelle.
- **D4 (Phase 3, #37)** — Pas de fusion risquée d'`E22TaskDetail` / `E21CreateTaskV2` /
  `E24EditTask` en un unique composant multi-mode. Retenu : factoriser un composant de mise en page
  partagé (bandeau titre coloré + logo, grille 2 colonnes de champs cliquables) réutilisé par les
  écrans de détail et de création, ce qui satisfait « utiliser ce même écran d'affichage » sans
  réécriture d'un composant unique fragile. Le sort d'`E24EditTask.tsx` (conservé ou vidé de sa
  substance si l'édition passe entièrement par le clic sur chaque case de la fiche) se tranche
  pendant la conception détaillée de la phase.
- **D5 (Phase 4, #38)** — Faute de référence exploitable dans le code (cf. État constaté), la cible
  retenue est une réécriture du bandeau des jours pour un défilement continu, sans saut au
  relâchement, la case centrale restant centrée — reconstruite à partir de la description littérale
  de Marie plutôt que d'un modèle existant. À valider par Marie au test.

---

## Phase 1 — Style « contour coloré, sans fond » (33 reprise Doc, #34, #36) [FAIT]

Revient sur #19 (bandeau des jours) et applique le même motif à trois autres endroits déjà
identifiés dans le code.

- `src/ui/styles/ambiance.ts` : nouveau helper `outlineOnlyStyle(color)` — `{ border: '2px solid
  <color>', backgroundColor: 'var(--color-surface)' }`, à côté de
  `pastelBackground`/`mutedBackground`/`flashyBackground`.
- `src/ui/screens/dashboard/PlanningBoard.tsx` : `dateStripBoxStyle` (`:56-64`) — fond retiré,
  contour 2px via le nouveau helper.
- `src/ui/components/EnergyDisplay.tsx` : `chipStyle` — fond teinté remplacé par le contour coloré
  (bordure grise générique retirée).
- `src/ui/components/ToolWidgetCard.tsx` (`ToolCard`) et `src/ui/screens/dashboard/E10Dashboard.tsx`
  (carte « Mon compte » + grille Outils) : même remplacement (D1 appliquée : « Mon compte » traitée
  comme une carte d'outil).
- **Écart constaté en cours d'implémentation, non prévu par l'analyse initiale** :
  `src/ui/screens/dashboard/E12WeekPlanning.tsx` (`weekBoxStyle`, écran « Planning de la semaine »
  livré en Phase 5 de `roadmap_planning_accueil_2026-08-29.md`) reproduisait exactement le même
  motif fond+contour que `PlanningBoard.tsx`. Corrigé par cohérence avec la même demande (« la case
  des jours de la semaine sur le planning ») plutôt que de laisser un des deux écrans du planning
  incohérent avec l'autre — décision non bloquante, à valider par Marie comme le reste de la phase.
- `src/ui/screens/tools/E70Tools.tsx` : aucun changement direct nécessaire (rend `ToolCard`/
  `FolderCard`, hérite du helper via `ToolWidgetCard.tsx`).
- Tests : `PlanningBoard.test.tsx`, `E12WeekPlanning.test.tsx`, `EnergyDisplay.test.tsx` (créé),
  `ToolWidgetCard.test.tsx`, `E10Dashboard.test.tsx`, `ambiance.test.ts` (nouveau helper). `tsc -b` +
  lint + suite complète (722 tests) verts.
- Catalogue in-app (`manualTestsCatalog.ts`) : `bandeau-des-jours-colore` (révision 2, docRefs
  `[19, 33]`, mentionne aussi le planning de la semaine), `couleur-de-fond-par-outil` renommé
  « Couleur de contour par outil » (révision 4, docRef 36 ajouté), `consulter-et-modifier-l-energie`
  (révision 3, docRef 34 ajouté).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Code couleur par catégorie de tâche (#35) [FAIT]

Nouvelle fonctionnalité : catégories de tâche nommées et colorées, gérées depuis Paramètres >
Accessibilité, utilisées comme raccourci de couleur à la création/modification d'une tâche.

- `src/domain/entities/taskCategory.ts` (`id`, `name`, `color`, `position`, `created_at`) +
  `src/domain/rules/taskCategoryRules.ts` (`createTaskCategory`), sur le modèle de `listCategory.ts`.
- `src/data/repositories/taskCategoryRepository.ts` (CRUD + `getAll` trié par position) ;
  `src/data/db.ts` version 19 (`taskCategories: 'id, position'`) ; `src/app/repositories.ts`
  (`taskCategoryRepo`) ; nouveau hook `src/app/contexts/useTaskCategoriesState.ts`, câblé dans
  `AppContext.tsx`.
- **Écart constaté en cours d'implémentation, non prévu par l'analyse initiale** : la table Dexie
  ajoutée devait aussi être versée dans le payload de sauvegarde/synchronisation partagé
  (`buildSnapshot.ts`, export manuel ET sync Supabase — `task_categories`, schéma bumpé 3.5 → 3.6)
  ainsi que dans `clearDatabase()`/`importData()` (`useSettingsState.ts`), sous peine de perte
  silencieuse des catégories à l'export/import et de résidus après suppression du compte. Corrigé
  par cohérence avec le motif documenté dans `buildSnapshot.ts` (« une seule source pour les tables
  Dexie... évite qu'une table ajoutée soit oubliée »).
- `src/ui/screens/settings/E112Accessibility.tsx` : nouvelle section « Code couleur des tâches »
  (créer via un formulaire nom + `<input type="color">`, renommer via une modale, changer la
  couleur, supprimer). `ColorPicker.tsx` n'est pas réutilisé ici : la couleur y est obligatoire
  (jamais retirable), ce qui ne correspond pas au contrat nullable du composant ; l'écran suit donc
  la convention locale déjà en place (couleur d'outil, `<input type="color">` brut) pour rester
  cohérent avec le reste de la section.
- `src/ui/components/ColorPicker.tsx` : nouvelle prop optionnelle `categories?: TaskCategory[]` —
  si non vide, remplace le sélecteur natif par les catégories (nom + pastille) en boutons
  sélectionnables (D2) ; `value`/`onChange` inchangés (D3 : la tâche garde `task.color`). Sans
  catégorie (prop omise ou vide), comportement strictement inchangé.
- `E21CreateTaskV2.tsx` et `E24EditTask.tsx` : passent `categories={taskCategories}` au
  `ColorPicker` existant.
- Tests : `taskCategoryRepository.test.ts`, `db.test.ts` (version 19 + table), `ambiance`/pattern
  suivi pour `ColorPicker.test.tsx` (catégories présentes/absentes), `E112Accessibility.test.tsx`
  (créer/renommer/changer couleur/supprimer), `E21CreateTaskV2.test.tsx` / `E24EditTask.test.tsx`
  (sélecteur remplacé), `AppContext.test.tsx` (CRUD catégories bout en bout sur la vraie base
  Dexie). `tsc -b` + lint + suite complète (742 tests) verts.
- Catalogue in-app (`manualTestsCatalog.ts`, docRefs `[35]`) : parcours « Configurer un code couleur
  de tâche » (créer/renommer/recolorer/supprimer une catégorie) et « Choisir une couleur de tâche
  par catégorie » (le sélecteur ne propose plus que les catégories une fois configurées).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Refonte de la fiche de tâche, réutilisée pour la création (#37, remplace #3) [FAIT]

Remplace le correctif du cadre Date/Heure (#3, abandonné par Marie) par une refonte complète de
l'écran.

- `src/ui/components/TaskCardLayout.tsx` (nouveau, D4) : composant de mise en page partagé —
  bandeau pleine largeur (`TaskIcon` + titre) teinté de `task.color` (neutre si aucune couleur),
  suivi d'une grille 2 colonnes (`role="group"`) ; `TaskFieldCard` associé (libellé + valeur,
  repliable, teinté par la couleur de la tâche) porte l'interaction « cliquable pour modifier ».
- `src/ui/screens/tasks/E22TaskDetail.tsx` : adopte `TaskCardLayout`/`TaskFieldCard`. Fond du
  bandeau = `task.color` (corrige l'écart constaté : ce n'est plus la couleur d'ambiance). Bouton
  « Modifier » retiré ; édition inline par case pour Icône, Couleur, Date, Horaire, Coût en
  énergie — Icône/Couleur/Énergie enregistrent au clic (repli immédiat), Horaire par un bouton
  Enregistrer dédié (heure + durée), Date au changement. Titre cliquable dans le bandeau (saisie +
  Entrée/blur). Recurrence : les édits sur tâche récurrente proposent occurrence/série via la même
  modale que la suppression.
  **Écart constaté en cours d'implémentation, non prévu par l'analyse initiale** : la demande ne
  couvrait explicitement que 5 champs (Icône, Couleur, Date, Horaire, Énergie) ; Description et
  Obligatoire n'avaient plus aucun point d'accès une fois le bouton « Modifier » retiré (leur seul
  autre point d'entrée, `E24EditTask.tsx`, disparaît — voir plus bas). Ajoutés comme case
  supplémentaire (Description, repliable) et case simple (Obligatoire, case à cocher) pour ne rien
  régresser.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : réutilise `TaskCardLayout` pour le bandeau (icône +
  titre en direct) et la grille (Icône, Couleur, Date/Horaire si planifiée, Énergie), sans repli —
  contrairement à la fiche de détail, un formulaire de création n'a pas de valeur à résumer avant
  saisie ; ce sont donc des cases statiques (toujours ouvertes), pas des `TaskFieldCard`
  repliables. Sous-tâches, Description, Obligatoire et Récurrence restent hors grille, inchangés.
- `src/ui/screens/tasks/E24EditTask.tsx` : retiré (route `task-edit`, code écran `E24` compris)
  après vérification que l'édition inline de la fiche couvre tous ses champs (titre, description,
  icône, couleur, énergie, essentiel, date, horaire) — plus aucun point d'entrée ne menait à cet
  écran une fois « Modifier » supprimé.
- Le correctif résiduel de #3 (`appearance: none` / `WebkitAppearance: none`, commit `bcbb932`)
  disparaît avec les champs qu'il ciblait sur `E24EditTask.tsx` ; conservé tel quel sur
  `E21CreateTaskV2.tsx` où ces champs existent encore.
- Tests : `TaskCardLayout.test.tsx` (nouveau), `E22TaskDetail.test.tsx` (édition inline par champ,
  recurrence, bandeau teinté), `E21CreateTaskV2.test.tsx` (bandeau partagé), suppression de
  `E24EditTask.test.tsx` ; `App.suspense.test.tsx`, `screenCodes.test.ts`, `navigation.ts` mis à
  jour (route retirée) ; e2e `02-tasks.spec.ts` (bouton Modifier retiré du parcours détail, écran de
  création vérifié par son champ Titre plutôt qu'un titre de page) et `07-planning-v4.spec.ts`
  (édition via les nouvelles cases). `tsc -b` + lint + suite complète (780 tests) verts.
- Catalogue in-app : révision du parcours existant sur la fiche de tâche + nouveau parcours sur la
  création (nouvel écran, édition par case).
- **Incident, sans rapport avec le contenu de cette phase** : en cours d'implémentation, un `git
  merge` non déclenché par cette session (fusion d'`agent/retours`, fonctionnalité de retours
  annotés, par la session `TESTS`) s'est retrouvé en conflit sur `src/App.tsx` et `src/data/db.ts`
  pendant que ces mêmes fichiers étaient en cours d'édition ici. Travail mis en pause sur confirmation
  utilisateur ; la session `TESTS` a stashé le travail non commité trouvé sur `main` (dont celui de
  cette phase) pour fusionner proprement, puis n'a pas pu restaurer le stash sans conflit et l'a
  laissé intact (`stash@{0}`). Récupération faite ici par fichier ciblé (`git checkout stash@{0} --
  <fichier>` pour les fichiers propres à cette phase, réédition manuelle de `App.tsx`/
  `navigation.ts`/`screenCodes.ts`/`App.suspense.test.tsx` pour ne pas écraser les ajouts de la
  fonctionnalité fusionnée) plutôt qu'un `git stash pop` global : le stash contient aussi des
  modifications non commitées d'autres sessions concurrentes (`AGENTS.md`,
  `DESIGN/_contexte/signals.md`, `DISCORD/discord_com/gateway/STYLE.md`,
  `claude-vibecoding-kit/rclone_backup_files.txt`) qui n'ont pas été touchées et restent uniquement
  dans `stash@{0}` — **à récupérer par leurs sessions respectives avant toute suppression de ce
  stash**.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Animation du bandeau des jours (#38) [FAIT]

Cause du saut identifiée en Phase 4 (cf. état constaté) : `handleTouchEnd` remettait `dragOffset`
à `0` **au même instant** où `jumpTo` recentrait `stripCenter` sur le nouveau jour — deux
changements visuellement décorrélés (l'un correspond à une distance de glissement arbitraire,
l'autre à un recentrage discret d'exactement un jour), d'où le saut.

- `src/ui/screens/dashboard/PlanningBoard.tsx` : réécriture du mécanisme, sans mesure de layout
  côté JS (incompatible avec jsdom en test, et inutile) :
  - **Jours tampons** : rendu de `DATE_STRIP_RADIUS + 1` (au lieu de `DATE_STRIP_RADIUS`) de part
    et d'autre du centre — 2 jours supplémentaires masqués par le `overflow: hidden` du bandeau,
    pour qu'un glissement révèle du contenu réel plutôt qu'un vide. Marqués `aria-hidden` +
    `tabIndex={-1}` (non atteignables au clavier/lecteur d'écran tant qu'ils restent hors-champ).
  - **Position exprimée en fraction de piste, pas en pixels mesurés** : la piste (7 cases) a une
    largeur de `140%` de la case visible (5/7), positionnée par `translateX(calc(-100% * n / 7 +
    dragPx))` — `n` est le nombre de « crans » de piste consommés (1 au repos, pour masquer le
    tampon de gauche), `dragPx` le décalage brut du doigt pendant le glissement actif. Le
    navigateur résout `calc()`/`%` en pixels réels au moment du rendu ; aucune mesure `clientWidth`
    n'est nécessaire côté JS.
  - **Machine à 3 états** (`phase`: `idle` / `dragging` / `settling`) au lieu d'un simple booléen
    `dragging` : au relâchement (`handleTouchEnd`), la piste ne saute plus à `0` — elle passe en
    `settling` et continue son mouvement (via la transition CSS déjà en place, 0.2s ease-out)
    jusqu'au cran plein le plus proche dans la direction du glissement (`n=2` pour avancer d'un
    jour, `n=0` pour reculer, `n=1` — le repos — si le seuil de 50px n'est pas atteint). Le jour
    affiché ne change qu'une fois cette transition terminée (`onTransitionEnd` sur la piste,
    filtré par `event.target === event.currentTarget` pour ignorer les transitions de mise à
    l'échelle qui remontent depuis les cases-jour enfants) : à cet instant, la fenêtre de jours est
    recentrée et le décalage réinitialisé au même rendu — les deux états étant visuellement
    identiques (glisser la fenêtre d'un jour ou glisser le pixel d'une case équivalent), le
    remplacement est invisible.
- Tests : `PlanningBoard.test.tsx` — glissement sous le seuil (retour au repos sans changer de
  jour), glissement au-dessus du seuil (jour chargé seulement après la fin de la transition, jamais
  avant), continuité du mouvement au relâchement (la piste poursuit vers le cran plein plutôt que
  de sauter à zéro), présence des jours tampons masqués (`aria-hidden`). `tsc -b` + lint + suite
  complète (783 tests) verts.
- **Écart non traité, signalé sans action** : `src/ui/screens/dashboard/E12WeekPlanning.tsx`
  (écran « Planning de la semaine ») reproduit le même mécanisme de glissement avec le même défaut
  (`dragOffset` remis à 0 en même temps que le changement de semaine). #38 et son analyse ne
  visaient explicitement que le bandeau des jours de `PlanningBoard.tsx` ; ce second écran n'a pas
  été touché pour ne pas étendre le périmètre de la phase sans demande explicite — à traiter dans
  une phase dédiée si Marie confirme le même problème sur cet écran.
- Catalogue in-app : `defilement-des-jours-dans-la-case` révisé (révision 2, docRefs `[21, 38]`) —
  étapes ajoutées pour distinguer relâchement sous le seuil (retour en douceur, pas de changement
  de jour) et au-dessus (fin de course en douceur jusqu'au jour suivant/précédent, sans saut).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Après la dernière phase

- `_contexte/marie_modifications_suivi.md` : passer 33 (reprise Doc), #34, #35, #36, #37, #38 à
  `livrée vX.Y` au fur et à mesure de leur livraison et validation par Marie ; ajouter une entrée
  « Historique des revues ».
- `COMMUNICATION/Marie/a_transmettre.md` : une entrée par phase livrée, en langage simple, précédée
  du ou des numéros concernés.
- Vérifier `WHATS_NEW` (`E01Welcome.tsx`) à jour à chaque livraison.
- Archiver cette roadmap dans `Archives/` au `/deploy` qui livre la dernière phase.
