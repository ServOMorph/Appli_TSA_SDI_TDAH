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
npm run test:e2e       # tests E2E Playwright (build + 53 scénarios)
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

**Branche `v5.0` active, roadmap `roadmap_v5.0.md`** (à la racine) : refonte issue de la visio testeuse du 2026-07-28, analysée via `/analyse_visio`. Périmètre volontairement réduit au socle — **V5-0, V5-1 et V5-2a `[FAIT]`**, V5-2b `[EN COURS]` (planning et tâches refondus — logos, couleurs, durée en jours, récurrence, fiche tâche cliquable), V5-3 `[TODO]` (modèle d'outils/dossiers, listes, Budget V4.1 rebranché tel quel). Modification d'une tâche désormais exclusivement via sa fiche (plus de glisser-déposer, aligné sur l'application de référence de la testeuse). Les 5 outils spécialisés reportés en V5.1+ (Comptage, Météo du jour, Comptes à colonnes configurables, Routine, Tableau prévisions), faute de retour d'usage sur la version actuelle — ordre de priorité fixé, Comptage en premier.

Phase V5-2b en cours : entités et migration Dexie v9 (`icon`, `color`, `description`, `duration_minutes`, récurrence, exceptions), moteur de récurrence maison (quotidien/hebdo/mensuel/annuel, sans librairie RRULE), écran de création et fiche tâche entièrement redessinés (icône, couleur, durée par rouleaux, récurrence type Google Agenda, choix occurrence/série à chaque modification d'une tâche récurrente, action dupliquer). Planning épuré (M5) : quadrillage horaire et flux de déplacement tap-based retirés, remplacés par une liste par tâche (icône/horaire/nom/énergie/pastille), un bandeau de dates (navigation par appui/glissement tactile/sélecteur de date) et la fiche tâche comme seul point de modification ; sous-tâches dépliables avec compteur n/N tout en conservant un horaire propre indépendant. Écran « Aujourd'hui » retiré (redondant avec la section « Tâche du jour » de l'accueil). M5 codé et testé (validation manuelle en cours). Reste à faire : audit E7 (aucune donnée préremplie à l'installation), gate de phase.

Phase V5-0 codée et validée manuellement : pile de navigation paramétrée (`src/app/navigation.ts`), `AppContext.tsx` découpé de 961 à 169 lignes en 6 contextes de domaine (`src/app/contexts/*`), retours codés en dur remplacés par la pile. Deux constats non bloquants tracés dans la roadmap (réglage « Réduire les animations » quasi sans effet visible, bug d'export du chiffrement de l'énergie du jour) — non corrigés cette session.

Phase V5-1 close le 2026-08-02 après validation manuelle intégrale sur appareil tactile : nav basse ramenée à 4 éléments (Réception, Accueil, Paramètres, +), `E40Planning` absorbé par `E10Dashboard` (écran unique replié/déplié, corps extrait dans `PlanningBoard.tsx`), énergie planifiée/disponible affichée côte à côte, pastille de surcharge cliquable vers le centre de récupération, glisser-déposer du planning supprimé par anticipation. 3 défauts trouvés et corrigés en validation manuelle : titre `<h1>` de l'écran Réception resté « Todo » ; `index.html` déclarait `lang="en"` sur une UI française, déclenchant la traduction automatique de Chrome (corruption des nœuds texte du DOM, cassant la réconciliation React).

Phase V5-2a close le 2026-08-04 après validation manuelle intégrale : `Task`/`SubTask`/`TaskV2` — deux systèmes de tâches parallèles — fusionnés en une entité `Task` unique avec `parent_id` pour les sous-étapes, un seul repository et un seul jeu de règles (`taskRules.ts`), migration Dexie v7/v8. Nécessaire avant V5-2b, qui suppose des sous-étapes sur les tâches planifiées. Régression trouvée en validation manuelle et corrigée : le « + » de l'accueil rouvrait l'écran de choix de destination au lieu de créer directement la tâche (`FORCED_DESTINATION_BY_ORIGIN` sans entrée pour l'écran `dashboard` depuis la fusion V5-1).

Session 2026-08-05 hors roadmap : deux constats hérités d'une session antérieure se sont révélés faux en vérification. Destination de création de tâche (`E21CreateTaskV2.tsx`) désormais toujours forcée automatiquement — le bloc de choix libre, cru mort, était en réalité atteignable depuis une dizaine d'écrans non mappés via le « + » de la nav basse. Chiffrement local retiré entièrement (`src/crypto/`, `Settings.local_encryption`) plutôt que corrigé : il n'a jamais été activable ni actif en production.

## Stack

- React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : post-MVP, Supabase région UE

## Structure

```
src/
  domain/    — logique métier pure (zéro import Dexie / React)
  data/      — repositories Dexie, migrations
  ui/        — composants React, écrans, hooks
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
- **Interface utilisateur (`src/ui/`)** : Écrans et composants React stylisés en CSS natif respectant des directives d'accessibilité cognitive pour la neurodivergence (contrastes doux, animations réduites, repères d'énergie simples via un système de "batteries").

## Prochaine étape

Valider manuellement M5 de la Phase V5-2b (`tests_manuels.md`), puis M6 (audit E7) et M7 (gate de phase). La communication à la testeuse (`a_communiquer_v5.md`, racine) est différée à la livraison complète de la V5.0.

## Licence

MIT — voir [LICENSE](LICENSE).
