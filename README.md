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

V2 en cours sur branche `v2` — Phases V2-0 à V2-9 closes ; V2-5 (file "À planifier") retirée le 2026-07-05. Tag `v1.0-mvp` posé, `dist/v1/` archivé (rollback V1 opérationnel), `dist/v2/` régénérable via `npm run build`. V2-10 (consolidation) en cours. Plan de test manuel V2 (`plan_test_manuel_v2.md`) rédigé et passé intégralement le 2026-07-06 ; les 4 bugs confirmés sont corrigés (tri "Planning du jour" par `scheduled_start`, rattachement de tâche à une liste créée à la volée, détection de conflit de créneau dans Planning avec refus + message, avertissement avant perte de sous-tâches à la conversion Todo→Planifier/Liste — retest manuel restant). La planification indépendante des sous-tâches est explicitement reportée en chantier séparé. Reste consolidé dans `roadmap_v2.md` : 2 décisions produit (usage de l'énergie, écran Planning sans tâche planifiable), 4 fonctionnalités manquantes, 2 demandes de nettoyage UI, 10 points à retester. Comportement onboarding corrigé (2026-07-06) : quitter avant d'atteindre le dashboard entraîne un redémarrage complet plutôt qu'une reprise directe sur le dashboard ; bouton "Ignorer" retiré de l'écran choix de profil (sélection obligatoire). Reste : retester les 4 corrections, trancher les décisions produit restantes, régénérer `dist/v2/` à jour, doc V2 (README/schéma/ADR), déploiement Netlify, sessions test 2-5 avec Marie. Tests unitaires 346/346, `tsc -b` clean ; e2e à revalider (dernière confirmation 45/45 le 2026-07-05, avant les changements onboarding).

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

Phase V2-10 — Retester manuellement les 4 corrections de bugs, trancher les décisions produit restantes issues du plan de test manuel (voir `roadmap_v2.md`), puis doc V2, déploiement Netlify, sessions test 2-5 avec Marie.

## Licence

MIT — voir [LICENSE](LICENSE).
