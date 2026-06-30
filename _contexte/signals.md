# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-30)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-6 (mode surcharge repensé)
  - fait quand: toggle instantané surcharge, masquage tâches non-essentielles, tests ≥ 85 %
  - réf: `roadmap_v2.md` Phase V2-6

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 336/336 ; `npm run test:e2e` : 46/46 passent
- V2-0 à V2-5 closes — prochaine phase : V2-6 (mode surcharge)
- `toPlanTasks` dans AppContext : chargé au démarrage via `loadAll()`, retiré côté client après `scheduleV2Task`
- `E50ToPlanQueue.tsx` : file séquentielle — affiche 1re tâche `to_plan`, date/heure, planifier/arrêter
- Pastille rouge "À planifier" dans E10Dashboard : visible si `toPlanTasks.length > 0`
- `E20Inbox` (Todo) utilise flux V1 : `task-create` (E21CreateTask) → V1 inboxTasks ; `task-create-v2` non exposé depuis l'inbox (décision : cohérence données V1 en attendant V2-7/V2-9)

## Dernière session (2026-06-30)

## Décisions prises
- V2-5 close : file "À planifier" séquentielle — pastille rouge dashboard, E50ToPlanQueue (traitement 1 par 1, interruption, page de fin)
- Dette e2e soldée : 46/46 passent (Commencer→Entrer, souffle→énergie, Inbox→Todo, Plus tard→À faire plus tard, revert E20Inbox add button vers task-create)
- E20Inbox add button remis sur 'task-create' (V1) — E21CreateTaskV2 non exposé depuis inbox ; sera rewired en V2-7 ou V2-9 lors de la refonte

## Livrables produits ou modifiés
- `e2e/01-onboarding.spec.ts` : Commencer → Entrer
- `e2e/helpers/reset.ts` : Commencer → Entrer dans completeFastOnboarding
- `e2e/02-tasks.spec.ts` : Inbox→Todo, Plus tard→À faire plus tard, aria-labels à jour
- `e2e/03-energy.spec.ts` : souffle → énergie
- `e2e/06-offline.spec.ts` : Inbox → Todo
- `src/ui/screens/tasks/E20Inbox.tsx` : add button goTo('task-create') au lieu de 'task-create-v2'
- `src/ui/screens/tasks/E20Inbox.test.tsx` : test mis à jour (task-create-v2 → task-create)

## Hypothèses validées / invalidées
- VALIDE : 336/336 tests unitaires après corrections
- VALIDE : 46/46 e2e passent (dette e2e V1→V2 soldée)
- CONSTATÉ : E21CreateTaskV2 crée des TaskV2 dans taskV2Repo — non visible dans E20Inbox (inboxTasks = V1) ; sera résolu en V2-7 ou V2-9

## Prochaine étape exacte
Démarrer V2-6 — mode surcharge repensé (toggle instantané, masquage tâches non-essentielles).
