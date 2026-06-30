# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-30)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-4 (vue Planning — calendrier en cases)
  - fait quand: vue jour avec cases par heure, scroll vertical, navigation précédent/suivant, tests ≥ 85 %
  - réf: `roadmap_v2.md` Phase V2-4 + maquettes `Note de réunion/Capture d'écran 2026-06-29 183750.png` et `184709.png`

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
Aucun — V2-4 peut démarrer immédiatement. Maquettes disponibles.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 313/313 ; `npm run test:e2e` passe 46/46
- V2-0, V2-1, V2-2, V2-3 closes — prochaine phase : V2-4 (vue Planning)
- `db.ts` version(2) : TaskV2, List, ListItem, Routine, RoutineStep créés et testés ✓ (parallèle à v1)
- Maquettes Marie : `Note de réunion/Capture d'écran 2026-06-29 183750.png` (accueil), `184709.png` (planning hebdo), `184750.png` (RM détaillée)
- "Planifier" dans E21CreateTaskV2 crée status 'planned' et navigue inbox (placeholder jusqu'à V2-4)

## Dernière session (2026-06-30)

# Session du 2026-06-30

## Décisions prises
- V2-3 close : flux d'ajout refondu avec 3 destinations obligatoires (Todo / Planifier / À planifier plus tard)
- Fieldset/legend abandonné pour les boutons de destination (bug overlay) → div/p simple

## Livrables produits ou modifiés
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : créé (écran ajout V2, 3 destinations radio-like)
- `src/app/AppContext.tsx` : createTaskV2Dest + screen 'task-create-v2' ajoutés
- `src/App.tsx` : route 'task-create-v2' → E21CreateTaskV2
- `src/ui/screens/tasks/E20Inbox.tsx` : bouton "Ajouter une tâche" → 'task-create-v2'
- `src/test/testUtils.tsx` : createTaskV2Dest ajouté au mock
- `src/ui/screens/tasks/E21CreateTaskV2.test.tsx` : créé (11 tests, 3 chemins)
- `src/ui/screens/tasks/E20Inbox.test.tsx` : test navigation mis à jour

## Hypothèses validées / invalidées
- VALIDE : fieldset/legend avec float:left cause un overlay invisible bloquant les clics — div simple suffit
- VALIDE : 313/313 tests passent après V2-3
- EN ATTENTE : "Planifier" navigue vers inbox (placeholder V2-4)

## Prochaine étape exacte
Phase V2-4 — Vue Planning (calendrier en cases par heure, scroll vertical, navigation jour précédent/suivant).
Maquettes disponibles : `Note de réunion/Capture d'écran 2026-06-29 183750.png` et `184709.png`.

## Question bloquante pour la session suivante
Aucune (V2-4 peut démarrer immédiatement)
