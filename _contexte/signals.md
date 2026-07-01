# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-01)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Test manuel V2-7 (Listes) : créer liste, ajouter élément, suggestion
  - fait quand: parcours manuel créer liste + ajouter élément validé par l'utilisateur
  - réf: `roadmap_v2.md` Phase V2-7
- [P2|ouvert] Raccorder la suggestion de liste au flux d'ajout de tâche
  - fait quand: bouton "Ajouter" dans le flux de tâche propose une liste existante
  - réf: `roadmap_v2.md` Phase V2-7 (reporté V2-9) + `src/ui/screens/tasks/E21CreateTaskV2.tsx`
- [P1|ouvert] Démarrer Phase V2-8 (Routines matin/soir)
  - fait quand: routine créable comme bloc de temps réservé, intégrée au planning, étapes cochables
  - réf: `roadmap_v2.md` Phase V2-8

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour définir le critère "essentiel" exact (masquage tâches non-essentielles V2-9)

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 365/365 (28 tests V2-7 ajoutés) ; `npm run test:e2e` non relancé cette session (dernier état connu : 46/46)
- `npm run test` en local sature la mémoire par défaut de Node — utiliser `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` avec `NODE_OPTIONS=--max-old-space-size=4096`
- V2-0 à V2-7 closes (V2-7 : test manuel restant) — prochaine phase : V2-8 (Routines)
- `AppContext.tsx` : ajout state/méthodes listes (`lists`, `selectedListId`, `selectList`, `createList`, `deleteList`, `getListItems`, `addListItem`, `deleteListItem`)
- Nouveaux écrans : `src/ui/screens/lists/E60Lists.tsx` (page listes) + `E61ListDetail.tsx` (détail liste, ajout/suppression élément)
- `src/domain/rules/listRules.ts` : `createList`, `createListItem`

## Dernière session (2026-07-01)

## Décisions prises
- V2-7 close (mécanique) : page Listes + écran détail liste livrés. Suggestion de liste depuis le flux d'ajout de tâche explicitement reportée à V2-9 (non demandée dans cette itération).

## Livrables produits ou modifiés
- `src/domain/rules/listRules.ts` + `listRules.test.ts` : règles pures `createList`/`createListItem` (5 tests)
- `src/ui/screens/lists/E60Lists.tsx` + `.test.tsx` : page listes, création à la volée (10 tests)
- `src/ui/screens/lists/E61ListDetail.tsx` + `.test.tsx` : détail liste, ajout/suppression d'élément (11 tests)
- `src/app/AppContext.tsx` : Screen `'lists'`/`'list-detail'`, state + méthodes listes branchées sur `ListRepository`/`ListItemRepository` existants
- `src/test/testUtils.tsx` : mocks listes ajoutés à `makeAppContext`
- `src/App.tsx` : routes `E60Lists`/`E61ListDetail`
- `roadmap_v2.md` : Phase V2-7 mise à jour (mécaniques [x], suggestion liste reportée V2-9, test manuel restant)

## Hypothèses validées / invalidées
- VALIDE : repositories `ListRepository`/`ListItemRepository` du V2-2 directement utilisables sans modification
- EN ATTENTE : test manuel du parcours (créer liste, ajouter élément) non exécuté cette session

## Prochaine étape exacte
Test manuel V2-7 (créer liste, ajouter élément) puis démarrer V2-8 — Routines (matin/soir) : bloc de temps réservé, intégration planning, étapes cochables.

## Question bloquante pour la session suivante
Quand Marie vivra une vraie surcharge, quelle est la définition exacte du critère `essential` (quelles tâches masquer en mode surcharge) ?
