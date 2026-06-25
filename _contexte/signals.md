# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests manuels Phase 6 — parcours bout-en-bout hors ligne, desktop + mobile
  - fait quand: tous les tests manuels Phase 6 validés, puis `/close` Phase 6
  - réf: `roadmap.md` Phase 6 (liste des tests manuels)
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 6 code complète : audit architecture ✓, couverture 99.34% ✓, build PWA ✓, README ✓, offline testé ✓
- 241 tests passent, 99.34% couverture stmts
- PWA : sw.js + workbox générés, 9 entrées précachées (346 KiB)
- erasableSyntaxOnly : tous les repositories utilisent déclaration explicite (pas de parameter property shorthand)
- DevResetButton exclus de la couverture (composant dev-only)

## Dernière session (2026-06-25)

# Session du 2026-06-25 — Phase 6 (code)

## Décisions prises
- Phase 6 code terminée : audit ✓, couverture 99.34% ✓, build PWA propre ✓, README à jour ✓
- erasableSyntaxOnly TS 5.8+ : parameter property shorthand interdit — tous les repositories corrigés
- DevResetButton exclu de la couverture vitest (composant dev-only sans logique testable)
- Tests manuels Phase 6 reportés à prochaine session (offline desktop + mobile)

## Livrables produits ou modifiés
- `src/app/AppContext.test.tsx` : +3 describe blocks (inbox ops, sous-tâches, settings/données) — 241 tests
- `src/data/repositories/userRepository.ts` : fix erasableSyntaxOnly
- `src/data/repositories/settingsRepository.ts` : fix erasableSyntaxOnly
- `src/data/repositories/taskRepository.ts` : fix erasableSyntaxOnly
- `src/data/repositories/subTaskRepository.ts` : fix erasableSyntaxOnly
- `src/data/repositories/energyEntryRepository.ts` : fix erasableSyntaxOnly
- `src/domain/rules/taskRules.test.ts` : suppression import inutilisé TASK_TODAY_MAX
- `src/ui/screens/settings/E117Export.test.tsx` : fix act() warning
- `vitest.config.ts` : DevResetButton.tsx ajouté aux exclusions coverage
- `README.md` : Phase 6 complète, 241 tests, 99.34% couverture

## Hypothèses validées / invalidées
- VALIDE : 241/241 tests passent
- VALIDE : couverture 99.34% (gate 85% largement dépassé)
- VALIDE : build prod clean, PWA sw.js généré (9 entrées précachées)
- VALIDE : audit architecture — aucune violation cross-layer
- VALIDE : test offline navigateur — app fonctionne hors ligne
- EN ATTENTE : tests manuels complets Phase 6 (parcours bout-en-bout offline, mobile)

## Prochaine étape exacte
Tests manuels Phase 6 : parcours bout-en-bout hors ligne sur navigateur desktop + mobile, puis `/close` Phase 6.

## Question bloquante pour la session suivante
Aucune
