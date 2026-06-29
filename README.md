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
npm run test:e2e       # tests E2E Playwright (build + 46 scénarios)
npm run test:e2e:report  # ouvrir le rapport HTML Playwright
npm run lint       # ESLint
npm run format     # Prettier
```

## État actuel

Phase 7 en cours — Première session test utilisateur réelle complétée avec Marie (2026-06-29, AuDHD). Netlify déployé et fonctionnel. Retours positifs et détaillés documentés dans `Note de réunion/`. `roadmap_v2.md` créée (11 phases pilotées par les retours Marie). V2 prête à démarrer (Phase V2-0 : tag + branche + archive dist). MVP V1 archivé dans `Archives/`.

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
Archives/        — Roadmap V1 archivée
```

## Prochaine étape

Phase V2-0 — Poser le tag `v1.0-mvp`, créer la branche `v2`, archiver `dist/` V1. Puis démarrer V2-1 (vocabulaire : "Batterie", "Todo") dès réception des maquettes de Marie.

## Licence

MIT — voir [LICENSE](LICENSE).
