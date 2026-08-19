# Roadmap — Demandes Marie V1 (Flux B ROBERTO, Google Drive)

Source : `ROBERTO/flux_b_drive/analyses/constats_2026-08-18.md` + document archivé `ROBERTO/flux_b_drive/entrees/2026-08-18_Modifications (1).pdf`.
Créée le : 2026-08-18. Première roadmap de ce flux — implémente Phase 3 de `roadmap_roberto_workflow.md` (Flux B, jusque-là `[TODO]`).

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Arbitrages

- **Section Budget du PDF écartée en bloc** — confirmé par l'utilisateur : le document est antérieur à `roadmap_budget_v3` (déployée v5.47/v5.49). Le modèle Budget décrit dans les captures (montant total, écran « Mon compte » séparé) n'existe plus dans le code. Aucun item Budget dans cette roadmap.
- **TA1 (débordement Date/Heure) retiré** — déjà couvert par le correctif du 2026-08-15 (`E21CreateTaskV2.tsx:302,314`), et Marie elle-même l'avait noté avec incertitude.
- **LI3 (écran « Ajouter une catégorie » tronqué) retiré** — l'écran plein-page décrit dans le PDF n'existe plus ; l'ajout de catégorie est aujourd'hui un formulaire inline (`E61ListDetail.tsx:238-269`). Probablement obsolète, à reconfirmer avec Marie plutôt qu'à traiter à l'aveugle.

### Écarts assumés à signaler à l'utilisateur / Marie
- Toute la section Budget du PDF ne sera pas traitée : si un besoin similaire subsiste sur le modèle Budget actuel (v3), il doit être reformulé.
- Le point sur l'écran d'ajout de catégorie tronqué n'est pas repris tel quel — à revalider sur l'écran actuel (formulaire inline) si Marie rencontre encore un souci de clavier qui recouvre le champ.

## Ordre & dépendances

```
Phase 1 (bugs & raccourcis) ─┐
Phase 2 (tâches & planning) ─┼─ indépendantes entre elles
Phase 3 (détail élément liste)┘
Phase 4 (perso fond outils) ── indépendante
Phase 5 (préparation dist) ── dépend de 1+2+3+4
```

Aucune dépendance de données entre les phases 1 à 4 : chacune touche un modèle/écran distinct et peut être livrée et testée isolément.

---

## Phase 1 — Bugs prioritaires & raccourcis [EN COURS]

Trois corrections indépendantes, un seul fichier chacune, aucune dépendance de données — regroupées pour une livraison rapide des points les plus gênants pour Marie.

- [x] TA3 — Couleur par défaut d'une tâche sans couleur choisie : `PlanningBoard.tsx:180-185`, fallback `ambianceColor` remplacé par `var(--color-surface)` pour une tâche sans couleur (`kind === 'task'` uniquement). Aucun autre site de tint concerné (seul call site du projet, vérifié par recherche).
- [x] LI1 — Suppression de catégorie ne supprime plus tout l'outil : `E61ListDetail.tsx`, bouton × dédié ajouté par ligne de catégorie, confirmation propre (« Supprimer « <nom> » ? »), appelle `deleteListCategory` (déjà exposé par `useListsState.ts`/`listCategoryRepository.ts`, jamais câblé côté UI jusqu'ici) — le bouton de suppression globale de la liste (header) n'est plus le seul point de suppression.
- [x] EN1 — Accès direct à la modification de l'énergie : `E10Dashboard.tsx:166`, `onEnergyClick` pointe désormais vers `goTo('energy-checkin')`. `E30EnergyView` (écran de consultation) n'a plus de point d'entrée depuis l'accueil — laissé en place (pas de suppression d'écran hors périmètre de cette phase), à signaler comme écran mort potentiel.

Gate : [x] tests verts (74/74 sur les 3 fichiers touchés, 575/576 suite complète — 1 échec préexistant sans rapport, `E01Welcome.test.tsx`) · [ ] test manuel (points 10-12 ajoutés à `tests_manuels.md`, à valider par Marie) · [x] doc (`tests_manuels.md` à jour) · [x] sortie : 3 comportements implémentés et testés unitairement, `tsc -b` clean, lint sans nouvelle erreur (seule l'erreur préexistante `db.ts:308` subsiste).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Tâches & Planning : menu simplifié et rendu visuel [EN COURS]

Regroupe les modifications touchant `E22TaskDetail.tsx` et `PlanningBoard.tsx`, les deux écrans qui portent l'affichage d'une tâche.

- [x] TA2 — Menu d'actions d'une tâche : `E22TaskDetail.tsx`, retiré « Tâche du jour », « Planifier », « Liste », « Terminer » ainsi que tout leur code mort associé (state `showListPicker`/`newListName`/`subtaskWarningAction`, handlers et modales dédiées). Gardé « Décomposer » et « Dupliquer ». Ajouté « Modifier » en tête de menu, qui ouvre directement l'édition inline du titre (`setActiveField('title')`) — pas de nouvel écran, réutilise l'affordance déjà existante.
- [x] AP1 — Hauteur de case selon la durée : `PlanningBoard.tsx`, fonction `blockHeightStyle(durationMinutes)` avec 3 paliers (`≤30min` → 40px, `31-90min` → 56px, `>90min` → 76px), appliquée à la case tintée de chaque bloc planifié.
- [x] AP2 — Encadrement des jours + animation de glissement : `PlanningBoard.tsx`, `dateStripStyle` transformé en fonction prenant `ambianceColor` pour l'encadrement du bandeau. Glissement tactile suivi en direct (`handleTouchMove` + `dragOffset`, `translateX`), retour animé à la position d'origine au relâchement (`transition: transform 0.2s ease-out` désactivée pendant le drag).

Gate : [x] tests verts (26/26 PlanningBoard, 21/21 E22TaskDetail, 578/578 suite complète moins l'échec préexistant `E01Welcome.test.tsx`) · [ ] test manuel (points 13-15 ajoutés à `tests_manuels.md`, à valider par Marie) · [x] doc (`tests_manuels.md` à jour) · [x] sortie : `tsc -b` clean, lint sans nouvelle erreur (seule l'erreur préexistante `db.ts:308` subsiste).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Listes : détail d'élément avec description et sous-tâches [EN COURS]

Item isolé mais substantiel (modèle de données + nouvel écran) — ne fusionne pas avec les phases voisines, sans lien de fichiers avec elles.

- [x] Migration Dexie : `ListItem` (`src/domain/entities/listItem.ts`) étendu avec `description: string`. Nouvelle table `listItemSubTasks` (`ListItemSubTask` : `id, list_item_id, title, position, checked, created_at`), pattern indépendant plutôt que le self-reference `parent_id` de `Task` — plus simple ici car pas de sous-sous-tâches ni de planification. `db.ts` version 13 : store `listItemSubTasks` + migration par défaut `description: ''` sur les éléments existants. Câblage complet : `listItemSubTaskRepository.ts`, `app/repositories.ts`, `buildSnapshot.ts` (export v3.4, table `list_item_sub_tasks`), `useSettingsState.ts` (clearDatabase/importData).
- [x] LI2 — Nouvel écran `E62ListItemDetail.tsx`, route `list-item-detail` (`navigation.ts`, `App.tsx`, `DevResetButton.tsx`) : accessible en cliquant sur le titre d'un élément dans `E61ListDetail.tsx` (converti en bouton, `selectListItem` + `goTo('list-item-detail')`). Champ description (`textarea`, sauvegarde à la perte de focus) et sous-tâches toujours dépliées (pas de repli, à la différence de `PlanningBoard.tsx`/`toggleExpand`) : ajout, coche, suppression via `useListsState.ts` (`getListItem`, `updateListItemDescription`, `getListItemSubTasks`, `addListItemSubTask`, `toggleListItemSubTask`, `deleteListItemSubTask`). `deleteListItem`/`deleteListCategory`/`deleteList` cascadent désormais la suppression des sous-tâches.

Gate : [x] tests verts (595/596 suite complète moins l'échec préexistant `E01Welcome.test.tsx` — 8 nouveaux tests : migration v13, repository, écran E62, clic dans E61ListDetail) · [ ] test manuel (point 16 ajouté à `tests_manuels.md`, à valider par Marie) · [x] doc (`tests_manuels.md` à jour) · [x] sortie : `tsc -b` clean, lint sans nouvelle erreur (seule l'erreur préexistante `db.ts:308` subsiste), élément ouvrable, description et sous-tâches persistées et rechargées.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Paramètres : personnalisation du fond des outils [EN COURS]

- [x] AP3 — Réglage porté directement sur la carte de chaque outil plutôt que dans `E112Accessibility.tsx` (le choix est par outil, pas un réglage global d'accessibilité) : `ToolWidgetCard.tsx`, `ToolCard` affiche un sélecteur `<input type="color">` (pattern natif déjà utilisé en `E112Accessibility.tsx`) et, si une couleur est choisie, un bouton « × » pour la retirer. Entité `Tool` (`tool.ts`) étendue avec `color?: string | null` (champ optionnel, pas de migration de fixtures nécessaire). `toolRules.ts` : `createTool` accepte un 7e paramètre optionnel `color` (défaut `null`), tous les appels existants restent inchangés. `db.ts` version 14 : migration par défaut `tool.color = null` sur les outils existants. `useToolsState.ts` : nouvelle fonction `updateToolColor(id, color)`. Fond de carte teinté via `pastelBackground(tool.color)` (`ui/styles/ambiance.ts`, déjà utilisé pour l'ambiance) plutôt que la couleur brute. Le sélecteur et le bouton de retrait sont dans la même `Card` que le bouton d'ouverture mais ne déclenchent pas `onOpen`.

Gate : [x] tests verts (601/602 suite complète moins l'échec préexistant `E01Welcome.test.tsx` — nouveaux tests : `toolRules.test.ts` (couleur optionnelle), `ToolWidgetCard.test.tsx` (4 tests : sélection, retrait, pas de couleur par défaut, clic sélecteur n'ouvre pas l'outil), migration v14 dans `db.test.ts`) · [ ] test manuel (point 17 ajouté à `tests_manuels.md`, à valider par Marie) · [x] doc (`tests_manuels.md` à jour) · [x] sortie : `tsc -b` clean, lint sans nouvelle erreur (seule l'erreur préexistante `db.ts:310` subsiste — ligne décalée par l'ajout de la migration v14), couleur de fond par outil visible et persistante sur l'écran Outils.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Préparation de la dist pour Marie [EN COURS]

Ne duplique pas `/deploy` — vérifications spécifiques à cette roadmap avant de le lancer.

- [x] Entrée `CHANGELOG.md` (v5.38) couvrant l'ensemble des changements des phases 1 à 4.
- [x] `WHATS_NEW` (`E01Welcome.tsx`) remplacé par les 8 changements visibles par Marie des phases 1 à 4 (couleur tâche, suppression catégorie, énergie directe, menu tâche, hauteur planning, encadrement/animation planning, détail élément liste, couleur de fond outil).
- [x] `src/domain/data/manualTestsCatalog.ts` : 8 nouveaux tests ajoutés (`couleur-tache-sans-couleur-choisie`, `supprimer-une-categorie-de-liste`, `acceder-directement-a-l-energie`, `menu-tache-simplifie`, `hauteur-case-planning`, `detail-element-de-liste`, `couleur-de-fond-par-outil` — miroir des points 10-17 déjà présents dans `tests_manuels.md`, aucun ajout nécessaire côté `tests_manuels.md` pour cette phase).
- [ ] Une fois cette phase `[FAIT]` : lancer `/deploy` pour livrer la dist à Marie.

Gate : [x] tests verts (601/602 suite complète moins l'échec préexistant `E01Welcome.test.tsx`) · [ ] test manuel (couverture complète : points 10-17 de `tests_manuels.md` restent à valider par Marie, cf. gates des phases 1 à 4) · [x] doc (`CHANGELOG.md`, `WHATS_NEW`, `manualTestsCatalog.ts` à jour) · [x] sortie côté code : `tsc -b` clean, lint sans nouvelle erreur (seule l'erreur préexistante `db.ts:310` subsiste) · [ ] sortie finale : `/deploy` non encore exécuté.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Q à trancher

- Aucune Q bloquante pour le découpage — TA1 et LI3 ont été tranchées par la lecture du code (déjà couvert / architecture changée) et retirées de la roadmap plutôt que laissées ouvertes.

## Reporté en V1.1+

Aucun.

## Reporté hors V1

- Section Budget entière du PDF (obsolète, voir § Arbitrages).
- LI3 (écran d'ajout de catégorie tronqué, probablement obsolète).
