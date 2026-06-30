# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-30)

## Actions ouvertes

### URGENT — Dette e2e
- [P0|ouvert] Corriger les specs e2e périmées (V1 → V2)
  - fait quand: `npm run test:e2e` passe 46/46 sans timeout
  - réf: `e2e/01-onboarding.spec.ts` et suivants — cherchent "Commencer" mais le bouton dit "Entrer" depuis V2-1 ; helpers `e2e/helpers/reset.ts` à vérifier également

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
Aucun sur V2-6 — mais corriger les e2e d'abord (P0).

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 336/336 ; `npm run test:e2e` : 44/46 ÉCHOUENT (dette e2e V1 → V2, voir P0)
- V2-0 à V2-5 closes — prochaine phase : V2-6 (mode surcharge)
- `toPlanTasks` dans AppContext : chargé au démarrage via `loadAll()`, retiré côté client après `scheduleV2Task`
- `E50ToPlanQueue.tsx` : file séquentielle — affiche 1re tâche `to_plan`, date/heure, planifier/arrêter
- Pastille rouge "À planifier" dans E10Dashboard : visible si `toPlanTasks.length > 0`
- `task-create-v2` accessible uniquement depuis l'inbox (E20Inbox) — pas depuis le dashboard

## Dernière session (2026-06-30)

# Session du 2026-06-30

## Décisions prises
- V2-5 close : file "À planifier" séquentielle — pastille rouge dashboard, E50ToPlanQueue (traitement 1 par 1, interruption, page de fin)
- Specs e2e V1 périmées (cherchent "Commencer", bouton renommé "Entrer" en V2-1) — correction urgente en début de prochaine session
- DevResetButton complété : entrées manquantes 'task-create-v2', 'planning', 'to-plan-queue' ajoutées

## Livrables produits ou modifiés
- `src/ui/screens/planning/E50ToPlanQueue.tsx` : créé (écran séquentiel — tâche, date/heure, planifier/arrêter)
- `src/ui/screens/planning/E50ToPlanQueue.test.tsx` : créé (12 tests — file vide, tâche, champs, enchaînement, interruption)
- `src/app/AppContext.tsx` : screen 'to-plan-queue', state toPlanTasks, loadAll+toPlan, refresh après schedule
- `src/ui/screens/dashboard/E10Dashboard.tsx` : pastille rouge "À planifier" → goTo('to-plan-queue')
- `src/App.tsx` : route 'to-plan-queue' → E50ToPlanQueue
- `src/test/testUtils.tsx` : mock toPlanTasks: []
- `src/ui/components/DevResetButton.tsx` : entrées manquantes ajoutées (fix build)

## Hypothèses validées / invalidées
- VALIDE : 336/336 tests passent après V2-5
- VALIDE : 7/7 TM V2-5 passés (pastille, navigation, interruption, planification, page de fin)
- CONSTATÉ : specs e2e cherchent "Commencer" (V1) — le bouton dit "Entrer" depuis V2-1 — 44/46 e2e échouent

## Prochaine étape exacte
[P0 URGENT] Corriger les specs e2e (remplacer "Commencer" par "Entrer", adapter les helpers) avant de démarrer V2-6.

## Question bloquante pour la session suivante
Aucune sur V2-6 — mais la dette e2e doit être soldée en premier.
