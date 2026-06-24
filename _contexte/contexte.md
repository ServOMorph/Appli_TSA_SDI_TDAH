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
Phase 0 complète. Socle technique opérationnel : Vite 8 + React 19 + TypeScript 6, ESLint, Prettier, Vitest (couverture 85 % configurée), PWA (service worker Workbox), wrapper crypto AES-GCM/PBKDF2, structure découplée (domain/data/ui/crypto/app), ADR-001 et ADR-002 créés. 5/5 tests passent. Build prod validé. App tourne sur localhost:5173. Prêt pour Phase 1 (couche données & domaine).

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-23 : Initialisation du protocole vibecoding.
- 2026-06-23 : Stack arrêtée — React/TS PWA, Dexie, Web Crypto, Capacitor pour mobile futur.
- 2026-06-23 : Sync cloud reportée post-MVP (Supabase UE), Firebase écarté (RGPD).
- 2026-06-23 : Entité Event hors MVP, documentée pour V1 post-validation.
- 2026-06-23 : Cascade "Action immédiate" formalisée (déterministe, 4 étapes MVP).
- 2026-06-23 : Distinction notification push (max 2/j) vs suggestion in-app (illimitée/passive).
- 2026-06-23 : Roadmap créée (15 phases MVP→V1→V2), licence MIT, repo public GitHub configuré.
- 2026-06-24 : Phase 0 complète — socle Vite/React/TS, PWA, crypto wrapper, Vitest, ADRs.
- 2026-06-24 : TS6 strict — casts `as Uint8Array<ArrayBuffer>` aux appels Web Crypto API.
