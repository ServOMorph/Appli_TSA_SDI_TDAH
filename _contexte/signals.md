# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests mobiles Phase 6 — parcours sur appareil physique réel (iOS ou Android)
  - fait quand: flux principaux validés sur mobile physique (onboarding, tâche, énergie, offline), puis `/close` Phase 6
  - réf: `roadmap.md` Phase 6, `e2e/` (protocoles automatisés comme référence des scénarios)
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 6 : 46/46 tests Playwright E2E passent en 12.7s (Chromium headless, build prod)
- Tests E2E couvrent onboarding, tâches, énergie, settings, surcharge, offline/SW/IndexedDB
- `npm run test:e2e` : build prod + playwright test (remplace les tests manuels desktop)
- Seul manquant pour clore Phase 6 : 1 session de tests sur appareil mobile physique réel
- Race condition IDB/reload : toujours attendre `waitForLoadState('networkidle')` ou visibilité avant reload dans les tests E2E

## Dernière session (2026-06-25)

# Session du 2026-06-25 — Phase 6 (tests E2E Playwright)

## Décisions prises
- Tests E2E Playwright adoptés pour automatiser les tests manuels Phase 6 (46 tests, 12.7s, Chromium)
- `npm run test:e2e` devient le standard de validation fonctionnelle avant `/close` Phase 6
- Tests mobiles physiques (1 session) restent à faire avant la clôture officielle Phase 6

## Livrables produits ou modifiés
- `playwright.config.ts` : config Playwright webServer vite preview + chromium headless
- `e2e/helpers/reset.ts` : helpers resetApp + completeFastOnboarding
- `e2e/01-onboarding.spec.ts` : 7 tests parcours onboarding
- `e2e/02-tasks.spec.ts` : 10 tests gestion tâches (création, déplacement, suppression, limite 3)
- `e2e/03-energy.spec.ts` : 7 tests check-in énergie, badges, skip
- `e2e/04-settings.spec.ts` : 11 tests accessibilité CSS, dark mode, export, suppression
- `e2e/05-overload.spec.ts` : 5 tests mode surcharge + persistance
- `e2e/06-offline.spec.ts` : 6 tests offline/SW/IndexedDB
- `package.json` : scripts test:e2e, test:e2e:headed, test:e2e:report

## Hypothèses validées / invalidées
- VALIDE : 46/46 tests Playwright passent en 12.7s
- VALIDE : Service worker enregistré en build production
- VALIDE : App accessible offline (SW cache) + données IndexedDB persistées après rechargement
- VALIDE : Mode surcharge persisté via settings.overload_mode en IDB
- EN ATTENTE : Tests sur appareil mobile physique réel (gestes, clavier iOS/Android)

## Prochaine étape exacte
Tests mobiles Phase 6 : parcourir les flux principaux sur appareil physique réel (onboarding, tâche, énergie, mode offline), puis `/close` Phase 6.

## Question bloquante pour la session suivante
Aucune
