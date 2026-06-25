## v0.15 — 2026-06-25

### Modifié
- `E10Dashboard.tsx`, `E30EnergyView.tsx`, `E31EnergyCheckIn.tsx`, `E03Energy.tsx` : "cuillères" → "souffle" (terme énergie)
- `e2e/03-energy.spec.ts` : libellés mis à jour ("cuillères" → "souffle")
- `E10Dashboard.tsx` : padding Card "Que faire maintenant?" 24px → 12px ; SortableTaskItem police 0.75rem + spacing-xs
- `src/index.css` : --spacing-12: 12px ajouté

### Corrigé
- `AppContext.tsx` : addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi après décomposition d'une tâche

---

## v0.14 — 2026-06-25

### Ajouté
- `src/ui/components/TopBar.tsx` : nouveau composant — titre « Appli pour AuDHD », pill énergie, pill surcharge, roue ⚙ paramètres
- `run_dev.py` / `run_prod.py` : scripts de lancement dev/prod avec `--host` (accès mobile réseau local)
- `SERVEURS.md` : liens localhost PC + mobile (192.168.1.180)

### Modifié
- `E10Dashboard.tsx` : refacto sans scroll — TopBar + nav segmentée (Inbox / Aujourd'hui / Plus tard) remplace 7 boutons empilés
- `E10Dashboard.test.tsx` : tests adaptés aux nouveaux libellés (26/26)
- `e2e/*.spec.ts` + `helpers/reset.ts` : libellés remappés (Tableau de bord → Appli pour AuDHD, Mon énergie → pill, Activer mode surcharge → Activer le mode surcharge)

### Corrigé
- `AppContext.tsx` : `taskId` → `_taskId` dans `reorderSubTasks` (erreur TS6133 bloquant le build prod)
- Fix scroll latéral mobile validé en build prod (overflow-x: clip, DevResetButton absent) ✅

---

## v0.13 — 2026-06-25

### Corrigé
- Scroll latéral mobile : `overflow-x: clip` sur html/body — neutralise le débordement du sr-only dnd-kit (-1px) que `overflow-x: hidden` ne bloquait pas

---

## v0.12 — 2026-06-25

### Ajouté
- `AppContext.tsx` : `taskDetailOrigin` state — mémorise l'écran d'origine pour corriger la navigation retour depuis E22
- Braille dots ⠿ sur cartes E10 et sous-tâches E22/E23 (indicateur drag)
- Drag-and-drop des sous-tâches dans E22 (dnd-kit, pattern optimiste identique E23)
- Bouton supprimer (×) sur chaque sous-tâche dans E22

### Corrigé
- E22 : sous-tâche supprimée encore visible dans E10 → `refreshDashboard()` après `deleteSubTask`
- E22 : bouton Retour naviguait vers E24 au lieu de E10 lors d'une navigation depuis le dashboard

### Modifié
- E110–E117, E30–E31 : bouton "← Retour" déplacé en haut des écrans (harmonisation pattern E22)
- Tests E110–E117 : `getByText('Retour')` → `getByRole('button', { name: 'Retour' })`

---

## v0.11 — 2026-06-25

### Corrigé
- `src/app/AppContext.tsx` : fallback UUID v4 via `crypto.getRandomValues` — `crypto.randomUUID()` indisponible hors HTTPS (accès mobile par IP locale)

### Modifié
- `roadmap.md` : Phase 6 clôturée `[x]`
- `README.md` : état actuel mis à jour (Phase 6 close, Phase 7 à démarrer)

---

## v0.10 — 2026-06-25

### Ajouté
- Suite E2E Playwright : 46 tests (onboarding, tâches, énergie, settings, surcharge, offline/SW/IndexedDB)
- `playwright.config.ts` : configuration Playwright webServer vite preview + Chromium headless
- `e2e/` : 6 fichiers de tests + helper reset/onboarding
- `package.json` : scripts `test:e2e`, `test:e2e:headed`, `test:e2e:report`

---

## v0.9 — 2026-06-25

### Ajouté
- `AppContext.test.tsx` : +3 describe blocks couvrant inbox ops, sous-tâches, settings/données (241 tests, 99.34% couverture)

### Corrigé
- Repositories (user, settings, task, subTask, energyEntry) : fix `erasableSyntaxOnly` TS 5.8+ (déclaration explicite des champs privés)
- `E117Export.test.tsx` : fix act() warning sur handleExport async
- `taskRules.test.ts` : suppression import inutilisé TASK_TODAY_MAX
- `vitest.config.ts` : DevResetButton exclus de la couverture (composant dev-only)

### Modifié
- `README.md` : Phase 6 code complète, 241 tests, 99.34% couverture

---

## v0.8 — 2026-06-25

### Ajouté
- `src/ui/screens/settings/` : E110–E114, E116, E117 + tests (paramètres, accessibilité, stimulation, export, suppression)
- `src/ui/screens/overload/E90OverloadRecovery.tsx` + tests : centre récupération, désactivation surcharge
- `AppContext.tsx` : settings state, updateSettings, exportData, deleteAllData, 8 nouveaux écrans
- `src/index.css` : dark-mode class, reduce-motion class, stimulation mode CSS (calm/dynamic)
- `E10Dashboard.tsx` : bouton "Activer mode surcharge" (nav normale) + "Centre récupération" (mode surcharge)

### Corrigé
- Font sizes : small=13px / medium=16px / large=22px (différences perceptibles)
- E90 : suppression "Retour au dashboard" — créait une boucle sans possibilité de sortir du mode surcharge

---

## v0.7 — 2026-06-25

### Ajouté
- `src/ui/screens/energy/E30EnergyView.tsx` + tests : affichage énergie du jour (3 états : null / filled / skipped)
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` + tests : check-in grille 1-10, skip, pré-sélection, 8 tests
- `AppContext.tsx` : Screen + 'energy-view'/'energy-checkin', state todayEnergyStatus ('filled'|'skipped'|null)
- `DevResetButton.tsx` : sélecteur date simulée (localStorage dev_fake_date) pour tests J+1 en DEV

### Modifié
- `src/App.tsx` : +2 routes energy-view / energy-checkin
- `src/ui/screens/dashboard/E10Dashboard.tsx` : badge énergie cliquable, encart CTA J+1, "Énergie ignorée", bouton "Mon énergie"
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : +5 cas énergie
- `src/test/testUtils.tsx` : todayEnergyStatus: null dans makeAppContext
- `roadmap.md` : Phase 4 cochée [x]

---

## v0.6 — 2026-06-24

### Ajouté
- `src/ui/screens/tasks/E20Inbox.tsx` + tests : liste inbox, déplacement today/later, modale M04
- `src/ui/screens/tasks/E21CreateTask.tsx` + tests : formulaire création tâche
- `src/ui/screens/tasks/E22TaskDetail.tsx` + tests : détail tâche, sous-tâches, terminer, supprimer
- `src/ui/screens/tasks/E23Decompose.tsx` + tests : décomposition manuelle en sous-tâches
- `src/ui/screens/tasks/E24Today.tsx` + tests : liste aujourd'hui, terminer, retirer
- `src/ui/screens/tasks/E25Later.tsx` + tests : liste plus tard, déplacer vers aujourd'hui, modale M04
- `AppContext.tsx` : inboxTasks, todayTasks, laterTasks, moveTask, completeTask, deleteTask, selectTask, getSubTasks, toggleSubTask
- `DevResetButton.tsx` : SCREEN_CODES mapping, affichage code écran (E01–E25)

### Corrigé
- `E20/E22/E25` : `backgroundColor: var(--color-bg)` inexistant → `var(--color-surface)` ; overlay 75 % opacité ; zIndex 1000
- `Button.tsx` : disabled state — opacity 0.4 + cursor not-allowed

### Modifié
- `src/App.tsx` : renderScreen() helper, DevResetButton dans AppScreens
- `roadmap.md` : Phase 3 cochée `[x]`

---

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
