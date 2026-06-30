# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-30)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-5 (file "À planifier" séquentielle)
  - fait quand: pastille rouge si ≥ 1 tâche en attente, traitement 1 par 1 avec choix date/heure, interruption possible, tests ≥ 85 %
  - réf: `roadmap_v2.md` Phase V2-5

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
Aucun — V2-5 peut démarrer immédiatement.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 324/324 ; `npm run test:e2e` passe 46/46
- V2-0 à V2-4 closes — prochaine phase : V2-5 (file "À planifier")
- `db.ts` version(2) : TaskV2, List, ListItem, Routine, RoutineStep créés et testés ✓ (parallèle à v1)
- `E40Planning.tsx` : grille 6h–22h, scroll auto heure courante, nav précédent/suivant, picker placement et déplacement
- `scheduleV2Task` dans AppContext : met à jour scheduled_date/start/end + status='planned' via taskRulesV2
- Maquettes Marie : `Note de réunion/Capture d'écran 2026-06-29 183750.png` (accueil), `184709.png` (planning hebdo), `184750.png` (RM détaillée)

## Dernière session (2026-06-30)

# Session du 2026-06-30

## Décisions prises
- V2-4 close : vue Planning implémentée (E40Planning) — grille 6h–22h, scroll auto, navigation jour, picker placement/déplacement
- `scrollIntoView?.()` optionnel pour compatibilité jsdom sans casser le comportement navigateur

## Livrables produits ou modifiés
- `src/ui/screens/planning/E40Planning.tsx` : créé (grille horaire, scroll auto, nav, picker tâches/heures)
- `src/ui/screens/planning/E40Planning.test.tsx` : créé (11 tests)
- `src/app/AppContext.tsx` : screen 'planning' + scheduleV2Task / getPlannedTasksForDate / getUnscheduledPlannedTasks
- `src/App.tsx` : route 'planning' → E40Planning
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : "Planifier" → goTo('planning') (placeholder corrigé)
- `src/ui/screens/tasks/E21CreateTaskV2.test.tsx` : test "navigue vers planning" mis à jour
- `src/test/testUtils.tsx` : 3 nouvelles fonctions mock ajoutées

## Hypothèses validées / invalidées
- VALIDE : 324/324 tests passent après V2-4
- VALIDE : scrollIntoView?.() optionnel évite l'erreur jsdom sans casser le comportement navigateur
- CORRIGÉ : "Planifier" dans CreateTaskV2 naviguait vers inbox (placeholder) → navigue maintenant vers planning

## Prochaine étape exacte
Phase V2-5 — File "À planifier" séquentielle : pastille rouge sur le tableau de bord si ≥ 1 tâche en `to_plan`, traitement 1 par 1 avec choix date/heure, file conservée à l'arrêt.

## Question bloquante pour la session suivante
Aucune — V2-5 peut démarrer immédiatement.
