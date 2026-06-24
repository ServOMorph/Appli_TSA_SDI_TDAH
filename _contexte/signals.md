# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-24)

## Actions ouvertes
- [P1|ouvert] Démarrer Phase 3 (Gestion des tâches)
  - fait quand: écrans E20–E25 créés, modales M01/M04, cycle de vie tâche complet, tests ≥ 85 %, test manuel validé
  - réf: `roadmap.md` Phase 3, `_docs/docs de dev/3- ARCHITECTURE DES ÉCRANS.md`
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 2 complète : 116 tests, couverture 98.9 %, tests manuels onboarding validés
- AppContext = state machine React useState (Screen), pas de react-router
- import type { Table } from 'dexie' — Rolldown/Vite 8 refuse l'import valeur (fix appliqué)
- DevResetButton : bouton rouge fixe en DEV uniquement — reset IndexedDB + reload
- Routing : Screen = 'welcome' | 'profile' | 'energy' | 'first-task' | 'dashboard'
- testUtils.tsx : makeAppContext + renderWithApp pour mocker AppContext dans les tests UI
- Singletons module-level dans AppContext.tsx : db, userRepo, taskRepo, energyRepo, settingsRepo

## Dernière session (2026-06-24)

# Session du 2026-06-24

## Décisions prises
- Phase 2 complète : onboarding + dashboard opérationnels, tests manuels validés
- AppContext comme state machine React (pas de react-router) — suffisant pour la Phase 2
- import type { Table } from 'dexie' — Rolldown/Vite 8 refuse les imports de valeurs inexistantes à l'exécution
- DevResetButton uniquement en import.meta.env.DEV (reset IndexedDB en un clic, absent du build prod)

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : state machine, repositories, logique onboarding
- `src/app/AppContext.test.tsx` : 9 tests intégration (real DB via fake-indexeddb)
- `src/ui/components/Button.tsx` + `Card.tsx` + `DevResetButton.tsx` : composants réutilisables
- `src/ui/screens/onboarding/E01–E04.tsx` + tests : parcours onboarding complet
- `src/ui/screens/dashboard/E10Dashboard.tsx` + tests : D10A / D10B, action immédiate, cuillères
- `src/test/testUtils.tsx` : makeAppContext + renderWithApp pour tests UI
- `src/index.css` : design tokens neurodivergents (palette, grille 8px, dark mode)
- `src/App.tsx` : router principal + DevResetButton
- `src/data/db.ts` : fix import type Table (Rolldown compat)
- `vitest.config.ts` : exclusion src/domain/entities/** de la couverture

## Hypothèses validées / invalidées
- VALIDE : state machine React useState suffit pour Phase 2 (pas besoin de react-router)
- VALIDE : 116/116 tests passent, couverture 98.9 % global
- VALIDE : parcours onboarding complet → dashboard (tests manuels ok)
- INVALIDE : import { Table } from 'dexie' → Rolldown crash en build prod (fix : import type)

## Prochaine étape exacte
Phase 3 — Gestion des tâches : écrans E20 (inbox) → E25 (plus tard), modales M01/M04, décomposition SubTasks, états limite 3 tâches.

## Question bloquante pour la session suivante
Aucune
