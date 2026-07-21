# ADR-001 — Stack technique

Date : 2026-06-23  
Statut : Accepté

## Contexte

Application neuroinclusive (AuDHD, 14–40 ans) — web PWA + mobile futur, offline-first strict, confidentialité renforcée.

## Décision

| Couche | Choix | Raison |
|--------|-------|--------|
| UI | React 19 + TypeScript | Écosystème mature, composants accessibles disponibles |
| Build | Vite 8 | Démarrage rapide, HMR, support PWA natif via vite-plugin-pwa |
| Stockage local | Dexie.js (IndexedDB) | API Promise claire, support migrations, offline-first |
| Chiffrement | Web Crypto API (AES-GCM / PBKDF2) | Native navigateur, aucune dépendance externe, RGPD |
| PWA | vite-plugin-pwa + Workbox | Service worker auto, précache, installable |
| Mobile futur | Capacitor | Même codebase web, pas de réécriture |
| Tests | Vitest + Testing Library | Co-localisé Vite, globals, coverage v8 |
| Lint / format | ESLint + Prettier | Standard de l'écosystème TS |
| Sync cloud | Supabase région UE (post-MVP) | RGPD, Firebase écarté |

## Conséquences

- Aucun backend en MVP — tout fonctionne hors ligne.
- Le chiffrement local est transparent via le wrapper `src/crypto/`.
- Capacitor est introduit en Phase 14 (V2) sans modification de la base web.
