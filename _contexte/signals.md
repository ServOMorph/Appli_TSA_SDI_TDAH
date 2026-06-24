# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-24)

## Actions ouvertes
- [P1|✅ terminé] Phase 1 — Couche données & domaine (complétée 2026-06-24)
  - Schéma Dexie 5 entités (User, Task, SubTask, EnergyEntry, Settings) ✅
  - Repositories CRUD avec chiffrement transparent ✅
  - Domaine pur (taskRules, energyRules, actionImmediateRules) ✅
  - Couverture 98.26 % global, isolement domaine/infra validé ✅
  - 71/71 tests passent
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 0 complète et validée : socle Vite 8 + React 19 + TS6, PWA, crypto wrapper, tests, ADRs
- TS6 strict : casts `as Uint8Array<ArrayBuffer>` nécessaires aux appels Web Crypto API
- vite-plugin-pwa@1.3.0 (pas de 0.22.x sur npm)
- App tourne sur localhost:5173 (template Vite par défaut — sera remplacé Phase 2)
- `run.py` à la racine pour lancer `npm run dev`

## Dernière session (2026-06-24)

# Session du 2026-06-24

## Décisions prises
- Phase 0 complète : socle technique initialisé et validé
- TS6 strict requiert des casts `as Uint8Array<ArrayBuffer>` aux frontières de la Web Crypto API
- vite-plugin-pwa@1.3.0 adopté (0.22.x inexistant sur le registre npm)

## Livrables produits ou modifiés
- `package.json` : créé, React 19 + Vite 8 + TS6 + ESLint + Prettier + Vitest + Dexie
- `vite.config.ts` : créé, PWA (manifest, service worker Workbox, precache)
- `vitest.config.ts` : créé, seuil couverture 85 % configuré
- `eslint.config.js` + `.prettierrc` + `.prettierignore` : créés
- `src/crypto/crypto.ts` : wrapper AES-GCM + PBKDF2 fonctionnel
- `src/crypto/crypto.test.ts` : 4 tests, couverture 100 %
- `src/test/smoke.test.ts` + `src/test/setup.ts` : harness Vitest validé
- `docs/adr/ADR-001-stack.md` + `ADR-002-architecture-couches.md` : créés
- `run.py` : créé (lance `npm run dev`)
- `README.md` : mis à jour

## Hypothèses validées / invalidées
- VALIDE : build prod OK, PWA service worker généré, app tourne sur localhost:5173
- VALIDE : 5/5 tests passent, couverture 100 % sur crypto.ts

## Prochaine étape exacte
Phase 1 — Couche données & domaine : schéma Dexie des 5 entités MVP, repositories CRUD, chiffrement transparent, logique domaine pure.

## Question bloquante pour la session suivante
Aucune
