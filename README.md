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

V2 en cours sur branche `v2` — Phases V2-0 à V2-9 closes ; V2-5 retirée le 2026-07-05. Tag `v1.0-mvp` posé, `dist/v1/` archivé (rollback V1 opérationnel), `dist/v2/` régénérable via `npm run build` (périmé, daté du 2026-07-02). V2-10 (consolidation) en cours. Plan de test manuel V2 passé intégralement le 2026-07-06 ; tous les bugs confirmés corrigés et retestés en app réelle (13 points de confirmation validés) : conflit de créneau Planning (modale de refus), actions Aujourd'hui/Planifier/Liste depuis le détail tâche, navigation directe vers le détail de liste après ajout, bouton "Ajouter une tâche" sur Aujourd'hui, bouton "Terminer" sur Planning du jour (Dashboard), retrait icône Planning TopBar, grille Planning 24h (0h-23h), message "Rien à faire aujourd'hui", renommer/supprimer une liste, section Organisation supprimée, bug libellé profil corrigé. Restent 2 décisions produit ouvertes (usage de l'énergie, modification du profil) et 2 chantiers reportés (planification indépendante des sous-tâches, créneaux Planning en demi-heure). Reste avant déploiement : trancher les décisions restantes, relancer les e2e, régénérer `dist/v2/`, doc V2, déploiement Netlify, sessions test 2-5 avec Marie. Tests unitaires 344/344, `tsc -b` clean.

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
```

## Prochaine étape

Phase V2-10 — Trancher les décisions produit restantes (usage énergie, modification du profil — voir `roadmap_v2.md`), relancer les e2e, puis doc V2, déploiement Netlify, sessions test 2-5 avec Marie.

## Licence

MIT — voir [LICENSE](LICENSE).
