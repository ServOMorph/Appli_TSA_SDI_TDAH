# Assistant AuDHD — Planification et gestion d'énergie neuroinclusive (TSA / TDAH)

Application web progressive (PWA) et mobile neuroinclusive conçue spécifiquement pour les personnes AuDHD (Trouble du Spectre de l'Autisme sans déficience intellectuelle et Trouble du Déficit de l'Attention avec ou sans Hyperactivité, de 14 à 40 ans).

## Objectif

Agir comme un système externe de fonctions exécutives : réduire la charge mentale quotidienne, soutenir les routines régulières, maintenir les connexions sociales et gérer l'énergie au jour le jour. Ce projet est bâti sur une stack moderne en React, TypeScript, Vite et Dexie.js (IndexedDB). Il ne s'agit pas d'un outil de productivité classique.

## Lancement local

```bash
npm install
npm run dev        # serveur de développement http://localhost:5173
npm run build      # build de production
npm run preview    # prévisualisation du build
npm test               # tests unitaires (Vitest)
npm run test:coverage  # couverture (seuil 85 %)
npm run test:e2e       # tests E2E Playwright (build + 50 scénarios)
npm run test:e2e:report  # ouvrir le rapport HTML Playwright
npm run lint       # ESLint
npm run format     # Prettier
```

## État actuel

V2 quasi close sur branche `v2` (V2-0 à V2-9 closes, V2-5 retirée). Reste sur V2-10 : doc V2, déploiement Netlify (test 13.2 mode offline validé). Tag `v1.0-mvp` + `dist/v1/` archivé (rollback opérationnel), `dist/v2/` à jour.

Roadmap V3 (7 phases, V3-0 à V3-6) **intégralement close**, désormais archivée (`Archives/roadmap_v3.md`). Build de production sur `dist/v3` (`vite.config.ts`). Tests unitaires verts (374), `tsc -b` clean, `eslint` 0 erreur, e2e Playwright 44/44 — code inchangé depuis le 2026-07-09.

**Branche `v4` active. Roadmap V4 intégralement close** (V4-0 à V4-5) : sélection de plages multi-créneaux, tâche active replaçable, retrait de « Répéter demain », menu déplacer/renommer/supprimer sur une tâche planifiée, glisser (souris/tactile) avec zones de bord pour changer de jour, report unifié sur le flux « tâche en main », sous-tâches planifiables (affichage hiérarchique, parité complète d'interactions avec les tâches). Validation manuelle intégralement passée sur toutes les phases.

Module de gestion budget/comptes (E3) reste hors V4, cadrage produit requis avec Marie.

Tests unitaires verts (422), `tsc -b` clean, e2e Playwright 51/51.

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
roadmap_v4.md    — Roadmap V4 active (6 phases, pilotée par tests utilisateurs)
plan_test_manuel_v3-*.md — Plans de test manuel V3, un par phase
Archives/        — Roadmaps V1, V2 et V3 archivées
Note de réunion/ — Transcriptions de visios testeurs + documents d'analyse générés (`/analyse_visio`)
```
## Concepts d'architecture

L'application repose sur une architecture découplée stricte en couches, documentée dans les [Architecture Decision Records](docs/adr/) :
- **Logique métier pure (`src/domain/`)** : Contient les entités et les règles de gestion (calcul de planification, seuils d'énergie, mode surcharge). Elle est totalement isolée et ne possède aucune dépendance envers le framework UI (React) ou le système de stockage (Dexie.js).
- **Couche d'infrastructure (`src/data/`)** : Gère la persistance locale dans la base de données IndexedDB via Dexie.js et applique les migrations de schémas.
- **Sécurité et chiffrement (`src/crypto/`)** : Implémente le chiffrement des données sensibles (titres des tâches, notes, etc.) côté client avec AES-GCM et PBKDF2 via l'API standard Web Crypto, garantissant la confidentialité des données utilisateur en local.
- **Interface utilisateur (`src/ui/`)** : Écrans et composants React stylisés en CSS natif respectant des directives d'accessibilité cognitive pour la neurodivergence (contrastes doux, animations réduites, repères d'énergie simples via un système de "batteries").

## Prochaine étape

Cadrer E3 (module budget/comptes) avec Marie, hors V4 — voir `roadmap_v4.md` § Q à trancher et `_contexte/signals.md`. En parallèle, finaliser V2-10 sur la branche `v2` : doc V2 et déploiement Netlify.

## Licence

MIT — voir [LICENSE](LICENSE).
