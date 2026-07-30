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

### Liens locaux

| | PC | Mobile (même réseau Wi-Fi) |
|---|---|---|
| DEV | http://localhost:5173/ | http://192.168.1.180:5173/ |
| PROD | http://localhost:4173/ | http://192.168.1.180:4173/ |

## État actuel

V2 close (V2-0 à V2-10, V2-5 retirée) : doc V2 et déploiement Netlify confirmés terminés.

Roadmap V3 (7 phases, V3-0 à V3-6) **intégralement close**, désormais archivée (`Archives/roadmap_v3.md`).

Roadmap V4 (6 phases, V4-0 à V4-5) **intégralement close**, désormais archivée (`Archives/roadmap_v4.md`).

Roadmap V4.1 (6 phases, V4.1-0 à V4.1-5) **close**, désormais archivée (`Archives/roadmap_v4.1.md`) : rubrique nav « Outils » remplaçant « Todo », listes épinglables, module Budget semaine/mois avec livrets simples, nav « + » contextuelle. Phase V4.1-6 (auto-scroll drag planning) jamais codée, reprise dans la roadmap suivante.

**Branche `v5.0` active, roadmap `roadmap_v5.0.md`** (à la racine) : refonte issue de la visio testeuse du 2026-07-28, analysée via `/analyse_visio`. Périmètre volontairement réduit au socle — 4 phases : **V5-0 `[FAIT]`** (refacto du système d'état et de navigation), **V5-1 `[EN COURS]`** (nav + écran d'accueil fusionné avec le planning), V5-2 `[TODO]` (planning et tâches refondus — logos, couleurs, durée en jours, récurrence, fiche tâche cliquable), V5-3 `[TODO]` (modèle d'outils/dossiers, listes, Budget V4.1 rebranché tel quel). Modification d'une tâche désormais exclusivement via sa fiche (plus de glisser-déposer, aligné sur l'application de référence de la testeuse). Les 5 outils spécialisés reportés en V5.1+ (Comptage, Météo du jour, Comptes à colonnes configurables, Routine, Tableau prévisions), faute de retour d'usage sur la version actuelle — ordre de priorité fixé, Comptage en premier.

Phase V5-0 codée et validée manuellement : pile de navigation paramétrée (`src/app/navigation.ts`), `AppContext.tsx` découpé de 961 à 169 lignes en 6 contextes de domaine (`src/app/contexts/*`), retours codés en dur remplacés par la pile. Deux constats non bloquants tracés dans la roadmap (réglage « Réduire les animations » quasi sans effet visible, bug d'export du chiffrement de l'énergie du jour) — non corrigés cette session.

Phase V5-1 codée : nav basse ramenée à 4 éléments (Réception, Accueil, Paramètres, +), `E40Planning` absorbé par `E10Dashboard` (écran unique replié/déplié, corps extrait dans `PlanningBoard.tsx`), énergie planifiée/disponible affichée côte à côte, pastille de surcharge cliquable vers le centre de récupération, glisser-déposer du planning supprimé par anticipation. Gate technique atteint (tests unitaires et e2e verts, build/lint/tsc clean) ; validation manuelle sur appareil tactile encore en attente.

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
scripts/     — Scripts utilitaires (lancement dev/prod, appel Ollama)
_docs/       — Documentation produit (cahier des charges, docs de dev, ADR)
_contexte/   — Contexte de session (protocole vibecoding)
Archives/        — Roadmaps V1 à V4 archivées
Note de réunion/ — Transcriptions de visios testeurs + documents d'analyse générés (`/analyse_visio`)
```
## Concepts d'architecture

L'application repose sur une architecture découplée stricte en couches, documentée dans les [Architecture Decision Records](_docs/adr/) :
- **Logique métier pure (`src/domain/`)** : Contient les entités et les règles de gestion (calcul de planification, seuils d'énergie, mode surcharge). Elle est totalement isolée et ne possède aucune dépendance envers le framework UI (React) ou le système de stockage (Dexie.js).
- **Couche d'infrastructure (`src/data/`)** : Gère la persistance locale dans la base de données IndexedDB via Dexie.js et applique les migrations de schémas.
- **Sécurité et chiffrement (`src/crypto/`)** : Implémente le chiffrement des données sensibles (titres des tâches, notes, etc.) côté client avec AES-GCM et PBKDF2 via l'API standard Web Crypto, garantissant la confidentialité des données utilisateur en local.
- **Interface utilisateur (`src/ui/`)** : Écrans et composants React stylisés en CSS natif respectant des directives d'accessibilité cognitive pour la neurodivergence (contrastes doux, animations réduites, repères d'énergie simples via un système de "batteries").

## Prochaine étape

Valider manuellement la Phase V5-1 sur appareil tactile (`tests_manuels.md`), puis démarrer la Phase V5-2 (`roadmap_v5.0.md`) : planning et tâches refondus. La communication à la testeuse (`a_communiquer_v5.md`, racine) est différée à la livraison complète de la V5.0.

## Licence

MIT — voir [LICENSE](LICENSE).
