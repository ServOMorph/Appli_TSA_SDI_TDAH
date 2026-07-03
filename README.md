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

V2 en cours sur branche `v2` — Phases V2-0 à V2-9 closes. Tag `v1.0-mvp` posé, `dist_v1/` archivé (rollback V1 opérationnel). V2-10 (consolidation) en cours : dead code nettoyé, couverture ≥85 % atteinte. Fonctionnalité Routines (V2-8) retirée — non demandée par Marie. Collision de nommage V1/V2 "plus tard" résolue (système V1 retiré). Écran Todo enrichi (actions Planifier/Liste par tâche). Écran Planning revu (bouton Valider explicite, confirmation directe de la tâche choisie sans lister tout le backlog) ; bouton dashboard "Planifier" renommé "Planning". Bug racine des sous-tâches (SubTask) corrigé : elles pouvaient être créées mais jamais marquées terminées depuis l'UI — checkbox ajoutée, affichage de la progression harmonisé entre Dashboard/Todo/Aujourd'hui. Reste : doc V2 (README/schéma/ADR), déploiement Netlify (bascule `main`), sessions test 2-5 avec Marie, e2e à rejouer. Tests unitaires 356/356, e2e non rejoués cette session (dernier état connu 42/45, 3 échecs préexistants sans lien).

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

Phase V2-10 — Consolidation V2 & 2e vague de tests (doc V2, déploiement Netlify, sessions test 2-5 avec Marie). Refacto/dead code/couverture ≥85 % traités.

## Licence

MIT — voir [LICENSE](LICENSE).
