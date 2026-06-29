# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-29)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P1|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-3 (flux d'ajout de tâche refondu)
  - fait quand: écran ajout avec 3 destinations (Todo/Planifier/À planifier plus tard), validation bloquée si non choisie, tests ≥ 85 %
  - réf: `roadmap_v2.md` Phase V2-3

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
Aucun — V2-3 peut démarrer immédiatement. V2-4 et V2-9 disposent des maquettes.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 301/301 ; `npm run test:e2e` passe 46/46
- V2-0, V2-1, V2-2 closes — prochaine phase : V2-3 (flux d'ajout refondu)
- `db.ts` version(2) : TaskV2, List, ListItem, Routine, RoutineStep créés et testés ✓ (parallèle à v1)
- Maquettes Marie : `Note de réunion/Capture d'écran 2026-06-29 183750.png` (accueil), `184709.png` (planning hebdo), `184750.png` (RM détaillée)
- run_dev.py lance Vite via `npm run dev --host` (attention : encodage emoji Python sur Windows cp1252 — lancer `npm run dev` directement si besoin)

## Dernière session (2026-06-29)

# Session du 2026-06-29

## Décisions prises
- Maquettes de Marie reconnues comme reçues et localisées (`Note de réunion/` — 3 captures)
- Phase V2-2 close : schéma Dexie v2 parallèle à v1, sans breaking change

## Livrables produits ou modifiés
- `src/domain/entities/taskV2.ts` : entité TaskV2 (status v2, essential, scheduled_*)
- `src/domain/entities/list.ts`, `listItem.ts`, `routine.ts`, `routineStep.ts` : squelettes
- `src/data/db.ts` : version(2) + tables v2 en parallèle
- `src/data/repositories/taskV2Repository.ts` + test : CRUD, filtres date/status/essential
- `src/data/repositories/listRepository.ts`, `listItemRepository.ts` + tests : CRUD + reorder
- `src/data/repositories/routineRepository.ts`, `routineStepRepository.ts` + tests : CRUD + reorder
- `src/domain/rules/taskRulesV2.ts` + test : createTaskV2, completeTaskV2, scheduleTaskV2, moveTaskToLaterV2, toggleEssentialV2
- `_contexte/signals.md` : mis à jour (blocage maquettes levé, V2-2 close)

## Hypothèses validées / invalidées
- VALIDE : schéma v2 livrable en parallèle de v1, sans casser les 259 tests existants (→ 301/301)
- VALIDE : maquettes Marie disponibles — V2-4 et V2-9 peuvent être lancées quand le schéma est prêt
- EN ATTENTE : Marie doit décrire son ressenti de surcharge (V2-6)

## Prochaine étape exacte
Phase V2-3 — Écran ajout refondu : 3 destinations obligatoires (Todo / Planifier / À planifier plus tard), validation bloquée tant que non choisie.

## Question bloquante pour la session suivante
Aucune (V2-3 peut démarrer immédiatement)
