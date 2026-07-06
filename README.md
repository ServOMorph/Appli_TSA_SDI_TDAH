# Appli TSA/SDI/TDAH — AuDHD

Application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans déficience intellectuelle + TDAH, 14–40 ans).

## Objectif

Agir comme un système externe de fonctions exécutives : réduire la charge mentale quotidienne, soutenir les routines, maintenir les relations sociales, gérer l'énergie. Pas un outil de productivité classique.

## Lancement local

```bash
npm install
npm run dev        # serveur de développement http://localhost:5173
npm run build      # build de production
npm run preview    # prévisualisation du build
npm test               # tests unitaires (Vitest)
npm run test:coverage  # couverture (seuil 85 %)
npm run test:e2e       # tests E2E Playwright (build + 45 scénarios)
npm run test:e2e:report  # ouvrir le rapport HTML Playwright
npm run lint       # ESLint
npm run format     # Prettier
```

## État actuel

V2 quasi close sur branche `v2` (V2-0 à V2-9 closes, V2-5 retirée). Reste sur V2-10 : mode offline (13.2), doc V2, déploiement Netlify. Tag `v1.0-mvp` + `dist/v1/` archivé (rollback opérationnel), `dist/v2/` à jour.

Branche `v3` active. Roadmap V3 (`roadmap_v3.md`, racine), 7 phases (V3-0 à V3-6). **Phase V3-0 (refacto préalable) close** : constantes/schéma énergie (Dexie v3), composant `EnergyDisplay`, extraction `AppShell`/`BottomNav`, sélecteur pur `isOverloaded` — aucun changement de comportement visible, validé par test manuel utilisateur. Prochaine étape : Phase V3-1 (bugs + nettoyage UI).

Tests unitaires 353/353, `tsc -b` clean.

## Stack

- React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js
- Chiffrement : Web Crypto API (AES-GCM / PBKDF2)
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : post-MVP, Supabase région UE

## Structure

```
src/
  domain/    — logique métier pure (zéro import Dexie / React)
  data/      — repositories Dexie, migrations
  ui/        — composants React, écrans, hooks
  crypto/    — wrapper Web Crypto (AES-GCM, PBKDF2)
  app/       — point d'entrée, routing, providers
  test/      — setup Vitest, helpers partagés
docs/adr/    — Architecture Decision Records
_docs/       — Documentation produit (cahier des charges + 6 docs de dev)
_contexte/   — Contexte de session (protocole vibecoding)
roadmap_v2.md    — Roadmap V2 (11 phases, pilotée par tests utilisateurs)
plan_test_manuel_v2.md — Plan de test manuel V2 (pré-déploiement)
Archives/        — Roadmap V1 archivée
Note de réunion/ — Transcriptions de visios testeurs + documents d'analyse générés (`/analyse_visio`)
```

## Prochaine étape

Démarrer la Phase V3-1 (bugs + nettoyage UI) sur la branche `v3`. En parallèle, finaliser V2-10 : mode offline (13.2), doc V2, déploiement Netlify.

## Licence

MIT — voir [LICENSE](LICENSE).
