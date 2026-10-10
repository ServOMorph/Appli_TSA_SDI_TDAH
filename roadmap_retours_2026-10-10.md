# Roadmap — Retours testeurs du 2026-10-10

Déclenchée par `/traiter_retours` (Phase 3 de `roadmap_correctifs_retours_2026-09-29.md`).
11 retours ouverts, dont 10 de Marie (`192f2411`).

## Retours analysés

| Retour | Écran | Constat | Traitement |
|---|---|---|---|
| `818b5891` | E10 | Défilement des jours rejeté (28/09) : Marie demande une proposition complète | Phase 1 — flèches + « Aujourd'hui » + calendrier (choix utilisateur 2026-10-10) |
| `1c42ba1b` | E10 | Carte orange « Mode surcharge actif » à retirer, ne garder que « centre de récupération », écran centré, outils accessibles | Phase 1 |
| `0cacea0f` | E22 | « Dupliquer » ajoute « (copie) », ne demande ni date ni heure | Phase 2 |
| `b9e58eab` | E21 | Heure de début en champ natif, durée par roulette : Marie veut des chiffres cliquables comme pour les routines | Phase 2 |
| `b19506a7` | E79/E10 | Pas de durée totale de routine ni d'heure de fin dans le planning | Phase 3 |
| `1734c523` | E80 | Pas de changement d'heure pour la routine d'un seul jour | Phase 3 |
| `9ac356a8` | E10 | Pas de choix outil/dossier sur « + », pas de menu « ⋯ » (déplacer, supprimer) sur les cartes | Phase 4 |
| `17f8fcae` | E77 | Catégories, « livret jeune » (non classé), mouvements par catégorie, source d'un dépôt ambiguë | Phase 5 — faite, réponse en file |
| `c2143fff` | E21 | Case « dépense » liée à « Mon compte » ; comportement au décochage non défini | Phase 6 — faite, réponse en file |
| `58787b8f` | E10 | Badge Netlify : désactivé côté site, version en cache sur le téléphone | Vérifié avec Marie le 2026-10-10 : badge absent. Marqué validé côté serveur (`resolved_at`) sur demande explicite de l'utilisateur, aucune réponse déposée |
| `389e3f8a` | E10 | « Test 5 », appareil de test | Réponse directe déposée le 2026-10-10 |

## Phase 1 — Accueil : mode surcharge et navigation des jours [FAIT]

- Constat : carte de surcharge `E10Dashboard.tsx:107-118` ; navigation des jours dans `PlanningBoard.tsx` (bandeau à case centrale).
- `1c42ba1b` : retirer la carte orange, garder le seul bouton « centre de récupération » en haut du planning, écran centré, outils accessibles en mode surcharge (vérifier ce qui les masque).
- `818b5891` : remplacer le défilement du bandeau par flèches précédent/suivant, bouton « Aujourd'hui », appui sur la date pour ouvrir un calendrier.
- Fichiers pressentis : `src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/dashboard/PlanningBoard.tsx` (+ tests).
- Tests : rendu en mode surcharge (pas de carte, bouton présent, outils accessibles) ; navigation jour précédent/suivant/aujourd'hui/date choisie.
- Critère de sortie : gates verts, réponses des deux retours relues puis mises en file.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Tâches : dupliquer et sélecteurs d'heure et de durée [FAIT]

- Constat : `usePlanningState.ts:282` suffixe « (copie) » ; `E21CreateTaskV2.tsx:297-298` champ `type="time"`, durée par `DurationRoller`.
- `0cacea0f` : « Dupliquer » demande date et heure de début, conserve toutes les informations et les sous-tâches, sans « (copie) ».
- `b9e58eab` : heure de début et durée (minutes, heures, jours) par chiffres cliquables, sur le modèle du sélecteur d'heure des routines (à identifier et réutiliser).
- Fichiers pressentis : `src/app/contexts/usePlanningState.ts`, `src/ui/screens/tasks/E22TaskDetail.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `src/ui/components/DurationRoller.tsx`.
- Tests : duplication (titre intact, sous-tâches copiées, date/heure choisies) ; sélection d'heure et de durée.
- Critère de sortie : gates verts, réponses relues puis mises en file.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Routines : durée totale, heure de fin, heure d'un jour [FAIT]

- Constat : seules les étapes portent une durée (`E79RoutineDetail.tsx:63,191`) ; aucun réglage d'heure dans `E80RoutineSteps.tsx`.
- `b19506a7` : durée totale saisie à la création, modifiable ; heure de fin affichée sur la routine dans le planning, comme pour les tâches.
- `1734c523` : changer l'heure de la routine d'un seul jour dans E80, avec le même sélecteur que la programmation des routines.
- Fichiers pressentis : entité et repository routine (migration Dexie probable), `E79RoutineDetail.tsx`, `E80RoutineSteps.tsx`, `PlanningBoard.tsx`, `E12WeekPlanning.tsx`, `useRoutineState.ts`, payload de sync.
- Tests : durée totale persistée et affichée ; heure du jour modifiée sans toucher les autres jours.
- Critère de sortie : gates verts, réponses relues puis mises en file.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Dossiers d'outils sur l'Accueil [FAIT]

- Constat : `ToolCreateModal.tsx` ne propose que liste/routine ; `ToolWidgetCard.tsx` sans menu ; dossiers existants (`E72FolderDetail.tsx`).
- `9ac356a8` : « + » propose de créer un outil ou un dossier ; menu « ⋯ » en haut à droite des cartes outil et dossier : déplacer (choix du dossier), supprimer (avec confirmation).
- Fichiers pressentis : `ToolCreateModal.tsx`, `ToolWidgetCard.tsx`, `E10Dashboard.tsx`, `E70Tools.tsx`, état des outils.
- Tests : création de dossier depuis « + » ; déplacement ; suppression confirmée et annulée.
- Critère de sortie : gates verts, réponse relue puis mise en file.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — Livret : catégories et « livret jeune » [FAIT]

- Décision de Marie (2026-10-10) : un dépôt propose la provenance (montant total ou autre catégorie) ; l'argent non classé porte le nom du livret.
- `17f8fcae` : catégories visibles sur E77, catégorie « livret jeune » pour l'argent non classé, mouvements visibles seulement en ouvrant une catégorie.
- Fichiers pressentis : `E77BudgetLivretDetail.tsx`, `budgetRules.ts`, `useBudgetState.ts`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 6 — Dépense liée à une tâche [FAIT]

- Décision de Marie (2026-10-10) : décocher la tâche garde la dépense.
- `c2143fff` : case « dépense » dans E21 ; en cochant la tâche, fenêtre : montant, catégorie de « Mon compte » ; dépense enregistrée avec le nom de la tâche comme motif.
- Fichiers pressentis : entité tâche (migration Dexie), `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx`, `useTasksState.ts`, `useBudgetState.ts`, `PlanningBoard.tsx`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
