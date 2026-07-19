# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-19)

## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`)
- [P1|ouvert] V4-5 — Valider le point 1.5 de `validation_manuelle.md` (renommer une sous-étape depuis E22) puis clore la phase
  - fait quand: utilisateur confirme le point 1.5 ; statut de la Phase V4-5 dans `roadmap_v4.md` passé à close (fait par `/close`).
  - réf: `validation_manuelle.md` § E9a/E9c point 1.5 ; `roadmap_v4.md` § Phase V4-5
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil).
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4
- [P3|ouvert] Faire le ménage à la racine du projet
  - fait quand: fichiers/dossiers non pertinents à la racine identifiés et supprimés ou déplacés.
  - réf: `roadmap_v4.md` § Divers (hors phases)

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify
  - fait quand: doc V2 à jour, déploiement Netlify effectué.
  - réf: `Archives/roadmap_v2.md`

## Questions ouvertes
- E3 seule question restante (`roadmap_v4.md` § Q à trancher) : cadrage produit complet requis, gros chantier reporté.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Phase V4-5 codée intégralement, validation manuelle quasi close** : points 1.1-1.4, 2.1-2.3, 3.1-3.6 de `validation_manuelle.md` confirmés par l'utilisateur ; seul le point 1.5 (bouton « Renommer » une sous-étape depuis E22, ajouté en cours de session sur retour utilisateur) reste à valider.
- Décision E9 (2026-07-18) appliquée à la lettre : la sous-tâche planifiable reste une `SubTask` rattachée à sa `Task` parente (champs `scheduled_date`/`scheduled_start`/`scheduled_end`/`postponed` ajoutés directement dessus), jamais promue en `TaskV2` indépendante avec `parent_task_id`.
- Périmètre étendu sur demande explicite de l'utilisateur au-delà du gate initial : parité complète d'interactions (E1 glisser, E6 menu déplacer/renommer/supprimer, E8 reporter) entre une tâche planifiée et une sous-tâche planifiée. `E40Planning.tsx` a été réécrit autour d'un type union `PlanBlock` (`{kind:'task'}` | `{kind:'subtask'}`) pour porter cette parité sans dupliquer la logique de glisser/menu/report — pattern à réutiliser si un 3e type d'élément planifiable apparaît.
- `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) généralisés pour accepter tout objet `{scheduled_start, scheduled_end}` (pas seulement `TaskV2`) — réutilisés tels quels pour les sous-tâches, pas de duplication de la logique de créneaux.
- Migration Dexie v3→v4 : `subTasks` gagne l'index `scheduled_date`. Pas de migration de données nécessaire (nouveaux champs optionnels côté lecture).
- Le flux E6 « Déplacer » et E8 « Reporter » restent unifiés sur le bandeau « "X" est en cours de déplacement. » (flux « tâche en main » d'E5) — pas de modale de liste de créneaux, y compris pour les sous-tâches.
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`). Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les écrans qui en dépendent.

## Dernière session (2026-07-19)

## Décisions prises
- Phase V4-5 (sous-tâches planifiables) codée intégralement : E9a (modèle de données), E9b (affichage hiérarchique planning/accueil), E9c (point d'entrée « Planifier » depuis Décomposer et détail de tâche).
- Périmètre étendu sur demande explicite de l'utilisateur en cours de session : parité complète d'interactions (E1/E6/E8) entre tâche et sous-tâche planifiées, plutôt que le minimum du gate initial (placement + affichage).
- Ajout d'un bouton « Renommer » sur chaque sous-étape de l'écran de détail de tâche (E22TaskDetail), sur retour utilisateur après une première passe de validation manuelle.

## Livrables produits ou modifiés
- `src/domain/entities/subTask.ts` : champs `scheduled_date`/`scheduled_start`/`scheduled_end`/`postponed` ajoutés.
- `src/domain/rules/subTaskRules.ts` (nouveau) : `scheduleSubTask`/`reportSubTask`/`renameSubTask`.
- `src/domain/rules/taskRulesV2.ts` : `taskSlotRange`/`taskOccupiesSlot` généralisés à tout `{scheduled_start, scheduled_end}`.
- `src/data/db.ts` : migration Dexie v4 (`subTasks` + index `scheduled_date`). `subTaskRepository.ts` : `getByDate` ajouté.
- `src/app/AppContext.tsx` : `PendingPlanTask`/`MovingPlanItem` généralisés avec discriminant `kind` (`task`|`subtask`) ; `startPlanSubTask`, `startMoveSubTask`, `getPlannedSubTasksForDate`, `scheduleSubTaskV2`, `reportSubTaskV2`, `renameSubTaskV2` ajoutés.
- `src/ui/screens/planning/E40Planning.tsx` : réécrit autour du type union `PlanBlock` pour porter tâches et sous-tâches planifiées sur les mêmes mécaniques de glisser/menu/report.
- `src/ui/screens/dashboard/E10Dashboard.tsx` : carte « Planning du jour » combine tâches et sous-tâches planifiées, affichage hiérarchique, report/cochage.
- `src/ui/screens/tasks/E23Decompose.tsx`, `E22TaskDetail.tsx` : bouton « Planifier » par sous-étape ; `E22TaskDetail.tsx` : bouton « Renommer » par sous-étape (modale dédiée) ajouté en cours de session.
- `e2e/07-planning-v4.spec.ts` : T51 (planifier une sous-tâche depuis Décomposer, affichage hiérarchique planning + accueil).
- `validation_manuelle.md` : réécrit pour la Phase V4-5, points 1.1-1.4/2.1-2.3/3.1-3.6 cochés, point 1.5 (renommer) ajouté et en attente de validation.

## Hypothèses validées / invalidées
- VALIDE : points 1.1-1.4, 2.1-2.3, 3.1-3.6 de `validation_manuelle.md` V4-5, confirmés par l'utilisateur.
- EN ATTENTE : point 1.5 (« Renommer » une sous-étape depuis E22) — feature ajoutée en cours de session suite au retour utilisateur, codée et testée (422/422 tests, `tsc -b` clean) mais pas encore validée manuellement.
- VALIDE (choix de design confirmé implicitement par l'absence de remarque) : périmètre étendu à la parité complète d'interactions, tranché par l'utilisateur via question explicite en début de session plutôt que le minimum du gate.

## Prochaine étape exacte
Valider manuellement le point 1.5 de `validation_manuelle.md` (renommer une sous-étape depuis E22). Une fois confirmé, clore formellement la Phase V4-5 (statut roadmap) lors du prochain `/close`.

## Question bloquante pour la session suivante
Aucune.
