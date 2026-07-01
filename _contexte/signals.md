# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-01)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-9 (Refonte page d'accueil)
  - fait quand: page d'accueil conforme maquette (énergie + mode surcharge + icône agenda en haut, planning du jour au centre, nav Todo/Planifier/Listes en bas), parcours mobile sans scroll parasite testé
  - réf: `roadmap_v2.md` Phase V2-9
- [P2|reporté V2-9] Test manuel V2-7 (Listes) : créer liste, ajouter élément
  - fait quand: nav dashboard (Todo/Planifier/Listes) branchée en V2-9, puis parcours manuel validé
  - réf: `roadmap_v2.md` Phase V2-7 (12 TM rédigés, exécution différée)
- [P2|ouvert] Raccorder la suggestion de liste au flux d'ajout de tâche
  - fait quand: bouton "Ajouter" dans le flux de tâche propose une liste existante
  - réf: `roadmap_v2.md` Phase V2-7 (reporté V2-9) + `src/ui/screens/tasks/E21CreateTaskV2.tsx`
- [P2|reporté V2-9] Test manuel V2-8 TM-07/TM-08 (bloc routine visible dans planning)
  - fait quand: icône agenda V2-9 livrée (accès planning navigable réel), puis TM-07/08 validés
  - réf: `roadmap_v2.md` Phase V2-8 + Risques/angles morts
- [P2|ouvert] Corriger la navigation orpheline `task-create-v2` (accès "Planifier")
  - fait quand: le dashboard/Todo permettent de nouveau d'atteindre le flux 3-destinations sans casser les e2e T11-T13
  - réf: `roadmap_v2.md` Risques/angles morts ("Navigation orpheline") — probablement absorbé par V2-9 (icône agenda + nav Planifier)

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour définir le critère "essentiel" exact (masquage tâches non-essentielles V2-9)

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 390/390 (25 tests V2-8 ajoutés) ; `npm run test:e2e` non relancé cette session (dernier état connu : 46/46)
- `npm run test` en local sature la mémoire par défaut de Node — utiliser `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` avec `NODE_OPTIONS=--max-old-space-size=4096`
  - constat 2026-07-01 : sous ce pool, les tests de `src/crypto/crypto.test.ts` + `taskRepository`/`subTaskRepository` (chiffrement) échouent (`crypto.subtle` undefined dans le worker vmThreads) — faux négatif d'environnement, ils passent en pool par défaut (`npx vitest run` sans flags). Ne pas confondre avec une régression.
- V2-0 à V2-8 closes (mécaniques + tests manuels sauf reports explicites ci-dessus) — prochaine phase : V2-9 (refonte page d'accueil)
- `AppContext.tsx` : state/méthodes listes (`lists`, `selectedListId`, `selectList`, `createList`, `deleteList`, `getListItems`, `addListItem`, `deleteListItem`) + routines (`routines`, `selectedRoutineId`, `selectRoutine`, `createRoutine`, `deleteRoutine`, `getRoutineSteps`, `addRoutineStep`, `deleteRoutineStep`, `toggleRoutineStep`, `scheduleRoutine`, `getRoutinesForDate`)
- Écrans : `src/ui/screens/lists/E60Lists.tsx`/`E61ListDetail.tsx` ; `src/ui/screens/routines/E70Routines.tsx` (liste routines, création nom/type/durée) + `E71RoutineDetail.tsx` (étapes cochables, réservation créneau)
- `src/domain/rules/listRules.ts` : `createList`, `createListItem` ; `src/domain/rules/routineRules.ts` : `createRoutine`, `createRoutineStep`, `scheduleRoutine`, `toggleRoutineStep`
- `Routine` (entité) : ajout `scheduled_date`/`scheduled_start` optionnels (placement planning, pas de migration Dexie nécessaire)
- `E40Planning.tsx` : affiche les routines planifiées du jour comme chip distinct (couleur secondaire) dans la case horaire de `scheduled_start`, clic → détail routine
- Dashboard : nouveau segment "Routines" dans la nav (Todo/Aujourd'hui/À faire plus tard/Routines)
- **Navigation orpheline (important pour V2-9)** : `task-create-v2` (flux 3-destinations dont "Planifier") n'a plus aucun point d'entrée réel depuis le revert e2e du 2026-06-30 (dashboard/Todo repointés vers `task-create` V1). Conséquence : l'écran planning (`E40Planning`) est inaccessible par navigation normale. Gate commun complété (point 7) pour détecter ce type de régression plus tôt. À traiter en V2-9.

## Dernière session (2026-07-01)

## Décisions prises
- V2-7 : test manuel formellement reporté à V2-9 (aucun point d'entrée dashboard vers `E60Lists` avant le branchement de la nav Todo/Planifier/Listes prévu en V2-9 — conforme au séquencement roadmap, pas un bug).
- V2-8 (Routines) implémentée et close mécaniquement ; TM-01 à TM-06 validés OK par l'utilisateur. TM-07/TM-08 (bloc routine visible dans le planning) reportés à V2-9.
- Cause racine de TM-07/TM-08 identifiée : régression silencieuse du 2026-06-30 (revert e2e) ayant orphelin `task-create-v2` et, transitivement, l'accès au planning. Gate commun de `roadmap_v2.md` complété (point 7) pour prévenir la récidive.

## Livrables produits ou modifiés
- `src/domain/entities/routine.ts` : ajout `scheduled_date`/`scheduled_start` optionnels
- `src/domain/rules/routineRules.ts` + `.test.ts` : `createRoutine`, `createRoutineStep`, `scheduleRoutine`, `toggleRoutineStep` (4 tests)
- `src/app/AppContext.tsx` : Screen `'routines'`/`'routine-detail'`, state + méthodes routines branchées sur `RoutineRepository`/`RoutineStepRepository` existants
- `src/ui/screens/routines/E70Routines.tsx` + `.test.tsx` : liste routines, création nom/type/durée (11 tests)
- `src/ui/screens/routines/E71RoutineDetail.tsx` + `.test.tsx` : étapes cochables/supprimables, réservation de créneau (9 tests)
- `src/ui/screens/planning/E40Planning.tsx` : rendu des routines planifiées comme bloc distinct dans la grille horaire
- `src/ui/screens/dashboard/E10Dashboard.tsx` + `.test.tsx` : segment nav "Routines" (+1 test)
- `src/test/testUtils.tsx` : mocks routines ajoutés à `makeAppContext`
- `src/App.tsx` : routes `E70Routines`/`E71RoutineDetail`
- `roadmap_v2.md` : V2-7 test manuel reporté V2-9 ; V2-8 close (mécanique + TM-01 à TM-06) ; gate commun point 7 ajouté ; angles morts "Navigation orpheline" documenté

## Hypothèses validées / invalidées
- VALIDE : repositories `RoutineRepository`/`RoutineStepRepository` du V2-2 directement utilisables sans modification
- INVALIDE : le contournement "Ajouter une tâche → Planifier" permet de tester le planning -> pivot : `task-create-v2` est orphelin depuis le 2026-06-30, TM-07/TM-08 reportés V2-9
- EN ATTENTE : ressenti de surcharge de Marie pour définir le critère `essential` exact

## Prochaine étape exacte
Démarrer V2-9 (refonte page d'accueil) : icône agenda (accès direct planning, résout aussi la navigation orpheline), nav Todo/Planifier/Listes, masquage `essential=false` en mode surcharge.

## Question bloquante pour la session suivante
Quand Marie vivra une vraie surcharge, quelle est la définition exacte du critère `essential` (quelles tâches masquer en mode surcharge) ?
