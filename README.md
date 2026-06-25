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
npm test           # tests unitaires (Vitest)
npm run test:coverage  # couverture (seuil 85 %)
npm run lint       # ESLint
npm run format     # Prettier
```

## État actuel

Phase 6 complète — MVP consolidé. 241 tests, couverture globale 99.34 % (gate 85 %). Architecture domain/data/ui validée sans violation de couche. PWA offline-first via Vite PWA + Workbox. Export JSON RGPD, mode surcharge, accessibilité (dark mode, taille texte, reduce-motion) opérationnels.

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
roadmap.md   — Roadmap 15 phases (MVP → V1 → V2)
```

## Prochaine étape

Phase 7 — Tests utilisateurs AuDHD réels : 5 à 10 sessions avec le public cible, documentation des frictions, backlog d'ajustements pré-V1.

## Licence

MIT — voir [LICENSE](LICENSE).
