## v0.5 — 2026-06-24

### Ajouté
- `src/app/AppContext.tsx` : state machine React (Screen), repositories, logique onboarding complète
- `src/app/AppContext.test.tsx` : 9 tests intégration avec real DB (fake-indexeddb)
- `src/ui/components/Button.tsx` + `Card.tsx` : composants UI réutilisables
- `src/ui/components/DevResetButton.tsx` : reset IndexedDB en DEV uniquement (import.meta.env.DEV)
- `src/ui/screens/onboarding/E01Welcome.tsx` + `E02Profile.tsx` + `E03Energy.tsx` + `E04FirstTask.tsx` + tests
- `src/ui/screens/dashboard/E10Dashboard.tsx` + tests : D10A (normal) / D10B (surcharge)
- `src/test/testUtils.tsx` : makeAppContext + renderWithApp pour tests UI découplés
- Design tokens CSS neurodivergents dans `src/index.css` (palette, grille 8px, dark mode)

### Corrigé
- `src/data/db.ts` : `import type { Table }` — Rolldown/Vite 8 refuse l'import valeur

### Modifié
- `src/App.tsx` : router principal via AppContext + DevResetButton
- `vitest.config.ts` : exclusion `src/domain/entities/**` de la couverture
- `roadmap.md` : Phase 2 cochée `[x]`

---

## v0.4 — 2026-06-24

### Ajouté
- `src/domain/entities/` : types purs User, Task, SubTask, EnergyEntry, Settings
- `src/domain/rules/taskRules.ts` : canAddToToday (max 3), sortByPosition, nextPosition, completeTask
- `src/domain/rules/energyRules.ts` : hasCheckedInToday, getLatestFilledValue, getTodayEntry
- `src/domain/rules/actionImmediateRules.ts` : cascade Action immédiate MVP (déterministe)
- `src/data/db.ts` : schéma Dexie v1, 5 tables indexées, name optionnel pour tests isolés
- `src/data/repositories/` : 5 repositories CRUD (User, Task, SubTask, EnergyEntry, Settings)
- Chiffrement transparent des champs sensibles : Task.title, SubTask.title, EnergyEntry.value
- `docs/adr/ADR-003-domaine-infra.md` : règle d'isolement domaine/infra
- 71 tests, couverture globale 98.26 %, isolement domaine/infra validé par grep

### Modifié
- `src/test/setup.ts` : ajout `import 'fake-indexeddb/auto'`
- `package.json` : devDependency `fake-indexeddb`
- `roadmap.md` : Phase 1 cochée `[x]`
- `README.md` : état actuel et prochaine étape mis à jour

---

## v0.3 — 2026-06-24

### Ajouté
- `package.json` : React 19, Vite 8, TypeScript 6, ESLint, Prettier, Vitest + coverage v8, Dexie, vite-plugin-pwa
- `vite.config.ts` + `vitest.config.ts` : PWA (manifest, service worker Workbox), couverture 85 %
- `src/crypto/crypto.ts` : wrapper AES-GCM + PBKDF2 (Web Crypto API)
- `src/crypto/crypto.test.ts` + `src/test/smoke.test.ts` : 5 tests, couverture 100 % crypto
- `docs/adr/ADR-001-stack.md` + `ADR-002-architecture-couches.md` : décisions d'architecture
- `run.py` : script Python pour lancer `npm run dev` sur Windows

### Modifié
- `roadmap.md` : Phase 0 cochée `[x]`
- `README.md` : lancement local, structure des dossiers src/, état actuel

---

## v0.2 — 2026-06-23

### Ajouté
- `roadmap.md` : 15 phases (MVP 0–7, V1 8–12, V2 13–14), coches de suivi `[ ]`/`[~]`/`[x]`
- `LICENSE` : MIT, copyright ServOMorph 2026
- `.gitignore` : Node/Vite/Capacitor/coverage

### Modifié
- `_contexte/signals.md` : actions P1/P2 alignées sur la roadmap
- `README.md` : état actuel et prochaine étape mis à jour

---

## v0.1 — 2026-06-23

### Ajouté
- Documentation produit complète (6 docs de dev + cahier des charges) révisée et cohérente
- Stack technique arrêtée : React/TS PWA, Dexie.js, Web Crypto AES-GCM, Capacitor
- Cascade "Action immédiate" formalisée dans User Flows et Architecture des écrans
- Entité Event documentée (hors MVP, prévue V1 post-validation)
- Critères d'acceptation MVP étendus dans le PRD
- Distinction notification push / suggestion in-app établie dans Design System et User Flows
- Règle de skip du check-in énergie (statut `skipped`) dans Modèle de données
- Sync cloud définie comme post-MVP (Supabase région UE)
