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

V2 quasi close sur branche `v2` (V2-0 à V2-9 closes, V2-5 retirée). Reste sur V2-10 : doc V2, déploiement Netlify (test 13.2 mode offline validé). Tag `v1.0-mvp` + `dist/v1/` archivé (rollback opérationnel), `dist/v2/` à jour.

Roadmap V3 (7 phases, V3-0 à V3-6) **intégralement close**, désormais archivée (`Archives/roadmap_v3.md`). Build de production sur `dist/v3` (`vite.config.ts`). Tests unitaires verts (374), `tsc -b` clean, `eslint` 0 erreur, e2e Playwright 44/44 — code inchangé depuis le 2026-07-09.

**Branche `v4` créée et active.** Visio Marie du 2026-07-16 : a répondu aux 4 points V3 restés en attente depuis la visio précédente — check-in énergie confirmé à une fois par jour, bouton « Répéter demain » à retirer (remplacé par un ajout de tâche en continu sur le planning), bouton « Mode surcharge » à réintroduire visible/grisé hors surcharge (confirme la demande initiale de Marie, contredite par un retrait du 2026-07-07), sous-tâches planifiables souhaitées avec affichage hiérarchique. Roadmap V4 reconstruite sur cette base (`roadmap_v4.md`, racine, 6 phases V4-0 à V4-5) — **aucune phase codée à ce stade**.

Points marquants de la roadmap V4 : refacto préalable pour propager la couleur d'ambiance aux boutons primaires (`--color-accent`) et supporter les tâches sur plusieurs créneaux ; case de planning entièrement colorée avec case à cocher ; tâche « Reporter » repensée pour ouvrir un choix de créneau vide plutôt qu'avancer automatiquement au lendemain ; déplacement tactile (appui long + glisser) d'une tâche planifiée ; sous-tâches planifiables indépendamment tout en restant visuellement rattachées à leur parent. Module de gestion budget/comptes (E3) reporté hors V4, cadrage produit requis.

Tests unitaires verts (374), `tsc -b` clean, `eslint` 0 erreur, e2e Playwright 44/44 (état V3, aucun code touché en V4 pour l'instant).

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

Démarrer le codage de la Phase V4-0 (refacto préalable — span de créneaux, variable `--color-accent`) sur la branche `v4`, sous Opus. Cinq questions restent à trancher avec Marie, chacune bloquant sa phase respective sans bloquer le démarrage de V4-0 — voir `roadmap_v4.md` § Q à trancher et `_contexte/signals.md`. En parallèle, finaliser V2-10 sur la branche `v2` : mode offline (13.2), doc V2, déploiement Netlify.

## Licence

MIT — voir [LICENSE](LICENSE).
