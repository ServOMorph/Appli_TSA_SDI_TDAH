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

## Phase 2 — Code couleur par catégorie de tâche (#35) [TODO]

Nouvelle fonctionnalité : catégories de tâche nommées et colorées, gérées depuis Paramètres >
Accessibilité, utilisées comme raccourci de couleur à la création/modification d'une tâche.

- Nouvelle entité domaine, ex. `src/domain/entities/taskCategory.ts` (`id`, `name`, `color`,
  `position`), sur le modèle de `listCategory.ts` / `budgetCategory.ts`.
- Repository + persistance Dexie (`src/data/repositories/`, `src/data/db.ts` — nouvelle table,
  migration de schéma).
- `src/ui/screens/settings/E112Accessibility.tsx` : nouvelle section « Code couleur » (créer,
  renommer, supprimer une catégorie ; lui attribuer une couleur — réutiliser `ColorPicker.tsx`).
- `src/ui/components/ColorPicker.tsx` ou un nouveau composant dédié : si des catégories existent,
  proposer les catégories (nom + pastille couleur) en remplacement du sélecteur natif (cf. D2/D3) ;
  sinon comportement inchangé.
- `E21CreateTaskV2.tsx` (`:270`) et `E24EditTask.tsx` : brancher le nouveau sélecteur.
- Tests : entité + repository, `E112Accessibility.test.tsx` (nouvelle section), sélecteur de
  couleur (avec/sans catégorie configurée), `E21CreateTaskV2.test.tsx` / `E24EditTask.test.tsx`.
  Tests de migration Dexie. `tsc -b` + lint + suite complète verts.
- Catalogue in-app : parcours « Configurer un code couleur » (créer une catégorie, lui donner une
  couleur) et « Choisir une couleur de tâche par catégorie » (le sélecteur ne propose plus que les
  catégories une fois configurées).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Refonte de la fiche de tâche, réutilisée pour la création (#37, remplace #3) [TODO]

Remplace le correctif du cadre Date/Heure (#3, abandonné par Marie) par une refonte complète de
l'écran.

- Composant de mise en page partagé (cf. D4) : bandeau titre pleine largeur en haut, fond de la
  couleur de la tâche, logo (`TaskIcon`) devant le titre dans la même case ; en dessous, grille
  2 colonnes de champs (Icône, Couleur, Date, Horaire, Coût en énergie…) chacun dans une case
  teintée de la couleur de la tâche, cliquable pour modifier son contenu directement (pas de bouton
  « Modifier » global).
- `src/ui/screens/tasks/E22TaskDetail.tsx` : adopter ce composant ; fond de page = couleur de la
  tâche (`task.color`), pas la couleur d'ambiance (corrige l'écart constaté) ; retirer le bouton
  « Modifier » (`:502-504`) ; câbler l'édition inline par case.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : réutiliser le même composant de mise en page pour la
  création (« je veux que tu utilises ce même écran d'affichage pour la création »).
- `src/ui/screens/tasks/E24EditTask.tsx` : à réduire ou retirer selon ce que l'édition inline rend
  effectivement obsolète (cf. D4) — décision de conception, pas de suppression aveugle en début de
  phase.
- Retirer le correctif résiduel non déployé de #3 (`appearance: none` / `WebkitAppearance: none`,
  commit `bcbb932`) s'il devient sans objet dans la nouvelle mise en page.
- Tests : `E22TaskDetail.test.tsx`, `E21CreateTaskV2.test.tsx`, tests du composant de mise en page
  partagé, e2e `02-tasks.spec.ts` (parcours détail + création). `tsc -b` + lint + suite complète
  verts.
- Catalogue in-app : révision du parcours existant sur la fiche de tâche + nouveau parcours sur la
  création (nouvel écran, édition par case).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Animation du bandeau des jours (#38) [TODO]

- `src/ui/screens/dashboard/PlanningBoard.tsx` : réécrire le mécanisme de glissement du bandeau
  (`handleTouchStart/Move/End`, `dateStrip`, `dragOffset`) pour un défilement continu qui suit le
  doigt sans à-coup, où la case restée au centre au relâchement y demeure (pas de recalcul discret
  de `stripCenter` qui provoque un saut) — probablement via un rendu de jours supplémentaires
  au-delà du rayon visible + une transition d'établissement calée sur la distance réellement
  parcourue plutôt qu'un `jumpTo` binaire.
- Tests : `PlanningBoard.test.tsx` (comportement de glissement, absence de saut, jour centré
  conservé). `tsc -b` + lint + suite complète verts.
- Catalogue in-app : révision du parcours `defilement-des-jours-dans-la-case` (déjà existant pour
  #21, à mettre à jour plutôt qu'à dupliquer).

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
