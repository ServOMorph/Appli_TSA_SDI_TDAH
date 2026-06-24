# Contexte — Appli_TSA_SDI_TDAH

## Objectif (immuable sauf décision explicite)
Créer une application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans DI + TDAH, 14–40 ans) : réduire la charge mentale quotidienne, soutenir les fonctions exécutives, offline-first, confidentialité renforcée.

## Stack / contraintes techniques (stable, rarement modifié)
- Frontend : React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js (source de vérité V1)
- Chiffrement local : Web Crypto API, AES-GCM, clé PBKDF2
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : reportée post-MVP — Supabase région UE envisagé, Firebase écarté
- Offline-first strict : fonctionne sans serveur ni compte en V1

## État actuel (réécrit intégralement à chaque /close)
Phase 2 complète. Onboarding (E01–E04) + Dashboard (E10 D10A/D10B) opérationnels, tests manuels validés. AppContext state machine React, composants Button/Card/DevResetButton extraits, design tokens CSS neurodivergents. 116 tests, couverture 98.9 %. Fix Rolldown : import type Table from dexie. Prêt pour Phase 3 (Gestion des tâches).

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
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
