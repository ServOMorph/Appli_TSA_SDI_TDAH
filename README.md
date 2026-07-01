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

V2 en cours sur branche `v2` — Phases V2-0 à V2-8 closes (mécaniques). Tag `v1.0-mvp` posé, `dist_v1/` archivé (rollback V1 opérationnel). Listes et Routines (référentiel personnel) livrées : pages Listes + détail, Routines + détail (étapes cochables, réservation de créneau, bloc visible dans le planning). Régression identifiée : l'accès au planning n'est plus navigable depuis un revert e2e antérieur — correction prévue en V2-9. Tests unitaires 390/390, e2e 46/46 (dernier run connu). Prochaine étape : V2-9 (refonte page d'accueil).

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

Phase V2-9 — Refonte page d'accueil (icône agenda, nav Todo/Planifier/Listes, masquage `essential=false`).

## Licence

MIT — voir [LICENSE](LICENSE).
