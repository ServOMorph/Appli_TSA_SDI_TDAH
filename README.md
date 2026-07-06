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

V2 en cours sur branche `v2` — Phases V2-0 à V2-9 closes ; V2-5 (file "À planifier") retirée le 2026-07-05. Tag `v1.0-mvp` posé, `dist/v1/` archivé (rollback V1 opérationnel), `dist/v2/` régénérable via `npm run build`. V2-10 (consolidation) en cours : dead code nettoyé, couverture ≥85 % atteinte. Écran de création de tâche revu : 4 destinations (Todo / Aujourd'hui / Planifier / Mettre dans une liste — remplace "À planifier plus tard", statut `to_plan` retiré du domaine). Fonctionnalité Routines (V2-8) retirée — non demandée par Marie. Collision de nommage V1/V2 "plus tard" résolue (système V1 retiré). Écran Todo enrichi (actions Planifier/Liste par tâche). Écran Planning revu (bouton Valider explicite, confirmation directe de la tâche choisie sans lister tout le backlog). Bug racine des sous-tâches (SubTask) corrigé : elles pouvaient être créées mais jamais marquées terminées depuis l'UI — checkbox ajoutée, affichage de la progression harmonisé entre Dashboard/Todo/Aujourd'hui. Mode surcharge du Dashboard rendu minimaliste (2026-07-05) : masquage des icônes TopBar, du bouton d'ajout, de la nav segmentée et des sections planning/tâches du jour ; bouton "Sortir du mode surcharge" ajouté. Comportement onboarding corrigé (2026-07-06) : quitter avant d'atteindre le dashboard entraîne un redémarrage complet plutôt qu'une reprise directe sur le dashboard ; bouton "Ignorer" retiré de l'écran choix de profil (sélection obligatoire). Plan de test manuel V2 (`plan_test_manuel_v2.md`) rédigé et passé intégralement : 4 bugs confirmés, 2 décisions produit, 4 fonctionnalités manquantes et 10 points à retester consolidés dans `roadmap_v2.md`. Reste : corriger ces écarts, régénérer `dist/v2/` à jour, doc V2 (README/schéma/ADR), déploiement Netlify, sessions test 2-5 avec Marie. Tests unitaires 345/345, `tsc -b` clean ; e2e à revalider (dernière confirmation 45/45 le 2026-07-05, avant les changements onboarding).

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

Phase V2-10 — Corriger les bugs et trancher les décisions produit issus du plan de test manuel (voir `roadmap_v2.md`), puis doc V2, déploiement Netlify, sessions test 2-5 avec Marie. Refacto/dead code/couverture ≥85 % traités.

## Licence

MIT — voir [LICENSE](LICENSE).
