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
npm run test:e2e       # tests E2E Playwright (build + 47 scénarios)
npm run test:e2e:report  # ouvrir le rapport HTML Playwright
npm run lint       # ESLint
npm run format     # Prettier
```

## État actuel

V2 quasi close sur branche `v2` (V2-0 à V2-9 closes, V2-5 retirée). Reste sur V2-10 : doc V2, déploiement Netlify (test 13.2 mode offline validé). Tag `v1.0-mvp` + `dist/v1/` archivé (rollback opérationnel), `dist/v2/` à jour.

Roadmap V3 (7 phases, V3-0 à V3-6) **intégralement close**, désormais archivée (`Archives/roadmap_v3.md`). Build de production sur `dist/v3` (`vite.config.ts`). Tests unitaires verts (374), `tsc -b` clean, `eslint` 0 erreur, e2e Playwright 44/44 — code inchangé depuis le 2026-07-09.

**Branche `v4` active.** Phases V4-0 à V4-2 closes. V4-3 est codée : sélection de plages multi-créneaux, tâche active replaçable, retrait de « Répéter demain » et modale énergie/obligatoire fusionnée.

Points marquants restants de la roadmap V4 : validation manuelle V4-3, report vers un créneau choisi, déplacement tactile et sous-tâches planifiables rattachées à leur parent. Module de gestion budget/comptes (E3) reporté hors V4, cadrage produit requis.

Tests unitaires verts (386), `tsc -b` clean, e2e Playwright 47/47 ; validation manuelle V4-3 en attente.

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

## Prochaine étape

Passer intégralement la validation manuelle V4-3 dans `validation_manuelle.md`. Seule E3 (module budget) reste à trancher avec Marie, hors V4 — voir `roadmap_v4.md` § Q à trancher et `_contexte/signals.md`. En parallèle, finaliser V2-10 sur la branche `v2` : doc V2 et déploiement Netlify.

## Licence

MIT — voir [LICENSE](LICENSE).
