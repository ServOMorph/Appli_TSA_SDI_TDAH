# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07)



## Actions ouvertes

### V3 — En cours (branche `v3`, post-visio Marie 2026-07-06)
- [P2|reporté] Trancher : mode surcharge sans aucune tâche visible (effet de bord de la suppression D1 du bloc "Que faire maintenant ?") — décision explicitement reportée à la Phase V3-3 (travail spécifique sur la surcharge)
  - fait quand: décision actée avec l'utilisateur pendant la Phase V3-3
  - réf: `roadmap_v3.md` Phase V3-1, note "Effet de bord D1" ; Phase V3-3
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Phase V3-1 (bugs + nettoyage UI) codée, test manuel passé intégralement (27/27 cas OK, 2026-07-07) — gate de phase respecté (tests, sortie, test manuel), reste doc à jour.
- B1 a nécessité une refonte de la persistance du Planning : `pendingPlanTask`/`startPlanTask`/`clearPendingPlanTask`/`schedulePendingTask` (AppContext) remplacent `planTodoTask`/`getUnscheduledPlannedTasks` — une tâche en cours de planification n'est plus écrite en base tant qu'un créneau n'est pas validé.
- B3 non reproduit dans le code actuel (flux de création déjà correct) — aucun changement fait, à confirmer si le testeur reproduit encore le symptôme.
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe `build.outDir: 'dist/v2'` — reste sur la branche `v2`.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-06, suite 7)

## Décisions prises
- Phase V3-1 codée intégralement : B1-B3, D1-D4b, P4a, P5, Q1.
- B3 vérifié non reproductible avec le code actuel — aucune action corrective nécessaire.

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : `pendingPlanTask`/`startPlanTask`/`clearPendingPlanTask`/`schedulePendingTask` remplacent `planTodoTask`/`getUnscheduledPlannedTasks` (B1) ; `getPlannedTasksForDate` n'exclut plus les tâches `completed` (P4a) ; écran `first-task` retiré (D2)
- `src/ui/screens/planning/E40Planning.tsx` : refonte du flux d'assignation (B1, P5), bordures des créneaux passées à `--color-text-muted` (B2), affichage des tâches terminées (P4a)
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bloc "Que faire maintenant ?" retiré (D1), section "Tâche du jour" réordonnée au-dessus de "Planning du jour" avec police agrandie (D3), limite d'affichage à 3 tâches retirée (Q1)
- `src/ui/components/BottomNav.tsx` : segment de nav "Aujourd'hui" retiré (D4)
- `src/ui/screens/tasks/E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx`, `E24Today.tsx` : limite de 3 tâches et modale M04 retirées (Q1), libellé "Aujourd'hui" → "Tâche du jour" (D4b), `startPlanTask` à la place de `planTodoTask` (B1)
- `src/ui/screens/onboarding/E03Energy.tsx` : termine directement l'onboarding (`completeOnboarding`) au lieu de naviguer vers `first-task`
- Supprimés (devenus morts) : `src/ui/screens/onboarding/E04FirstTask.tsx(.test.tsx)`, `src/domain/rules/actionImmediateRules.ts(.test.ts)`, `TaskV2Repository.getPlannedTasks()`
- `roadmap_v3.md` : Phase V3-1 cochée (B1-B3, D1-D4b, P4a, P5, Q1), note "Effet de bord D1" ajoutée
- `plan_test_manuel_v3-1.md` (nouveau) : 12 sections, 27 cas de test manuel scopés à la Phase V3-1
- 330/330 tests unitaires verts, `tsc -b` clean, `eslint` 0 erreur

## Hypothèses validées / invalidées
- VALIDE : B3 ("ajouter une tâche depuis Todo re-propose de faire la tâche") non reproductible avec le code actuel — le flux de création propose déjà les 4 destinations sans forcer une action
- EN ATTENTE : test manuel utilisateur de la Phase V3-1 (`plan_test_manuel_v3-1.md`) pas encore passé
- EN ATTENTE : acceptabilité de l'absence totale de tâche visible en mode surcharge (effet de bord de D1)

## Prochaine étape exacte
Mettre la doc à jour pour clore formellement le gate de la Phase V3-1, puis démarrer la Phase V3-2 (énergie : domaine + saisie).

## Dernière session (2026-07-07)
Test manuel V3-1 passé intégralement : 27/27 cas OK. Aucun écart consolidé. Point mode surcharge (P2) reporté à la Phase V3-3 à la demande de l'utilisateur.
