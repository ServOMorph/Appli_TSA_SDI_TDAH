# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7
- [P2|ouvert] Stabiliser l'orchestration `npm run test:e2e`
  - fait quand: `npm run test:e2e` lance le preview et passe 46/46 sans serveur manuel
  - réf: `playwright.config.ts`, `package.json` — première exécution: ERR_CONNECTION_REFUSED sur localhost:4173 ; `npx playwright test` passe 46/46 avec preview lancé manuellement

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- `npm run test` passe 253/253 ; Vitest limité à `src/**/*.{test,spec}.{ts,tsx}` pour exclure les specs Playwright
- E22TaskDetail corrigé : la sous-étape est vérifiée par texte visible (item dnd-kit), plus par label inexistant
- E2E Playwright validés fonctionnellement : 46/46 avec `npm run preview` manuel + `npx playwright test`
- Orchestration `npm run test:e2e` à vérifier : preview non disponible sur localhost:4173 lors de la première exécution
- run_dev.py / run_prod.py (+ --host) disponibles à la racine

## Dernière session (2026-06-25)

# Session du 2026-06-25

## Décisions prises
- Vitest doit exécuter uniquement les tests `src/` ; les specs `e2e/` restent au runner Playwright.
- Les tests énergie utilisent désormais le terme UI "souffle".

## Livrables produits ou modifiés
- `src/ui/screens/tasks/E22TaskDetail.test.tsx` : test sous-étapes corrigé
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : assertions "souffle" corrigées
- `src/ui/screens/energy/E30EnergyView.test.tsx` : assertion "souffle" corrigée
- `src/ui/screens/onboarding/E03Energy.test.tsx` : question "souffle" corrigée
- `vitest.config.ts` : collecte bornée aux tests `src/`
- `_contexte/`, `README.md`, `roadmap.md`, `CHANGELOG.md` : clôture session mise à jour
- `.claude/commands/start.md`, `.claude/commands/close.md` : glob `roadmap*.md`

## Hypothèses validées / invalidées
- VALIDE : `npm run test` passe 253/253 après correction E22 et exclusion `e2e/` de Vitest
- VALIDE : les 46 scénarios Playwright passent avec preview lancé manuellement
- EN ATTENTE : `npm run test:e2e` doit être stabilisé sans serveur manuel

## Prochaine étape exacte
1. Vérifier pourquoi `npm run test:e2e` n'a pas lancé/détecté le preview sur localhost:4173
2. Démarrer Phase 7 : tests utilisateurs AuDHD réels

## Question bloquante pour la session suivante
Aucune
