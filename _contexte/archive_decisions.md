# Archive — Décisions structurantes

- 2026-06-23 : Initialisation du protocole vibecoding.
- 2026-06-23 : Stack arrêtée — React/TS PWA, Dexie, Web Crypto, Capacitor pour mobile futur.
- 2026-06-23 : Sync cloud reportée post-MVP (Supabase UE), Firebase écarté (RGPD).
- 2026-06-23 : Entité Event hors MVP, documentée pour V1 post-validation.
- 2026-06-23 : Cascade "Action immédiate" formalisée (déterministe, 4 étapes MVP).
- 2026-06-23 : Distinction notification push (max 2/j) vs suggestion in-app (illimitée/passive).
- 2026-06-23 : Roadmap créée (15 phases MVP→V1→V2), licence MIT, repo public GitHub configuré.
- 2026-06-24 : Phase 0 complète — socle Vite/React/TS, PWA, crypto wrapper, Vitest, ADRs.
- 2026-06-24 : TS6 strict — casts `as Uint8Array<ArrayBuffer>` aux appels Web Crypto API.
- 2026-06-24 : Phase 1 complète — schéma Dexie, repositories CRUD, domaine pur isolé, 71 tests 98.26 %.
- 2026-06-24 : fake-indexeddb via import auto + AppDatabase name optionnel pour isoler les tests.
- 2026-06-24 : Phase 2 complète — AppContext state machine React, E01–E04 + E10, 116 tests 98.9 %.
- 2026-06-24 : import type { Table } from 'dexie' — Rolldown/Vite 8 refuse les imports valeurs inexistants à l'exécution.
- 2026-06-24 : Phase 3 complète — E20–E25, modales M01/M04, cycle vie tâche, 168 tests 94.17 %, 31 tests manuels ok.
- 2026-06-24 : var(--color-bg) inexistant — toujours utiliser var(--color-surface) pour les fonds opaques.
- 2026-06-25 : Phase 4 complète — E30/E31, todayEnergyStatus, sélecteur date DEV, 190 tests, 17 tests manuels ok.
- 2026-06-25 : liaison énergie ↔ Action immédiate reportée en V2 (doc User Flows §9). Génération auto sous-tâches post-V1.
