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
npm run test:e2e       # tests E2E Playwright (build + 57 scénarios)
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

**Roadmap `Archives/roadmap_v5.0.md`** (close, archivée) : refonte issue de la visio testeuse du 2026-07-28, analysée via `/analyse_visio`. Périmètre volontairement réduit au socle — **V5-0 à V5-3 `[FAIT]`, roadmap V5.0 intégralement terminée** (modèle d'outils/dossiers, listes, Budget V4.1 rebranché tel quel, codée, testée et validée manuellement). Modification d'une tâche désormais exclusivement via sa fiche (plus de glisser-déposer, aligné sur l'application de référence de la testeuse). Les 5 outils spécialisés reportés en V5.1+ (Comptage, Météo du jour, Comptes à colonnes configurables, Routine, Tableau prévisions), faute de retour d'usage sur la version actuelle — ordre de priorité fixé, Comptage en premier.

Phase V5-2b close le 2026-08-06 : entités et migration Dexie v9 (`icon`, `color`, `description`, `duration_minutes`, récurrence, exceptions), moteur de récurrence maison, planning épuré (liste par tâche, bandeau de dates, fiche tâche comme seul point de modification), sous-tâches dépliables. E7 vérifié (aucune donnée préremplie à l'installation).

Phase V5-3 (codée et testée le 2026-08-06, close le 2026-08-07) : entités `Folder`/`Tool` (dossiers à un seul niveau, outils typés — seuls « liste » et « tableau comptage » implémentés), migration Dexie v10 (To Do et Budget créés d'office à l'installation, sans contenu). `E70Tools.tsx` refondu en écran générique + nouvel `E72FolderDetail.tsx` ; `E60Lists.tsx` et la route `lists` supprimés (les listes ne se créent plus que via le « + » des outils). `E61ListDetail.tsx` : coche intensifiée avec tri (cochés en dessous), rubriques optionnelles, icône réveil planifiant une tâche récurrente ou ponctuelle. Budget rebranché comme outil sans aucune modification de son code interne. Widget « Comptes » sur l'accueil pour la saisie de dépense en un tap.

Premier passage de validation manuelle réelle (2026-08-06, suite 3) : blocage bloquant à l'ouverture corrigé (`crypto.randomUUID()` indisponible hors contexte sécurisé dans la migration Dexie v10, reproduit en HTTP sur IP réseau), `try/catch/finally` ajouté autour de l'initialisation de l'app pour éviter tout blocage silencieux futur. 3 défauts UI corrigés sur l'accueil (carte « Outils » redondante, libellé de liste générique, bouton « + » mal placé) et un bug de navigation retour sur Budget. 500/500 tests unitaires, `tsc -b`/lint clean.

Validation manuelle des 6 points de `tests_manuels.md` (2026-08-07) : 5 points OK, point 5 (widget Comptes) en échec — bouton silencieusement désactivé sans catégorie de dépense créée dans le Budget, corrigé (bouton toujours actif, message d'invitation à créer une catégorie affiché à la place), puis revalidé par l'utilisateur le même jour. 501/501 tests unitaires, `tsc -b` clean. Phase V5-3 close, roadmap V5.0 intégralement terminée.

**Roadmap `roadmap_v5.1.md` ouverte le 2026-08-07** (successeur de V5.0, à la racine), branche `v5.1`. Phase V5.1-0 `[EN COURS]` : refonte ergonomique de l'écran Budget codée et testée le même jour. Modèle de données inchangé — trois écrans (`E71Budget` consultation, `E73CategoryDetail`, `E74BudgetSettings` configuration), chiffre-vedette « Il me reste » au lieu de « Reste non budgétisé », onglets Semaine/Mois au lieu des deux périodes empilées, jauges de progression, formulaire de dépense partagé avec le widget Comptes de l'accueil. Le backlog outils V5.1+ et les Q non tranchées y ont été reportés depuis la roadmap V5.0 close.

Retours de validation manuelle traités le 2026-08-07 : création de dossier retirée du « + » des Outils, suppression de liste ajoutée à la fiche liste, retrait d'argent sur un livret ajouté (blocage si dépassement du solde) — modèle de données toujours inchangé.

Retour vidéo de la testeuse (2026-08-13) analysé par transcription audio locale (`whisper`) + extraction d'images (`ffmpeg`), sans appel cloud. Bug identifié et corrigé : formulaire « Ajouter un élément » d'une liste (`E61ListDetail.tsx`) converti en dialogue plein écran, corrigeant une superposition transitoire avec la nav basse fixe à l'ouverture du clavier mobile. Déploiement Netlify automatisé (commande `/deploy` : build versionné `dist/<version>` + token dans `.env`, jamais lu par l'assistant) ; bouton d'accueil affiche désormais la version en production. Site officiel déployé : `https://appli-audhd.netlify.app` (distinct du site précédemment testé par la testeuse, à lui signaler).

Import de sauvegarde JSON ajouté hors phase (2026-08-14) : écran Paramètres renommé « Export et import », remplacement total des données de l'appareil après confirmation, réparation automatique des entrées `tools` manquantes pour les anciens exports (avant l'ajout de `folders`/`tools`/`task_recurrences`/`task_exceptions` à l'export). `/deploy` durci de 10 vérifications (bloquantes : arbre de travail propre, `.env` avec clés non vides, cohérence CHANGELOG/version, tests unitaires, `tsc -b`, lint ; avertissements à confirmation explicite : branche git attendue, commits locaux non poussés, version déjà présente dans `dist/`, tests manuels en attente) et d'une vérification de fumée post-déploiement. Déployé jusqu'à v5.22. 533/533 tests unitaires, `tsc -b`/lint clean ; reste la validation manuelle (`tests_manuels.md`, 5 points, dont 4 propres à la phase) avant clôture.

Modale « Nouveautés » et déploiement de test ajoutés hors phase (2026-08-14, suite 4) : l'écran d'accueil affiche une modale sur l'image (opacité réduite, fermable) listant les nouveautés simples depuis la dernière dist déployée — contenu à maintenir à la main dans `E01Welcome.tsx`. Nouvelle commande `/deploy_dev` déploie l'état courant sur un site Netlify de test dédié (`appli-audhd-dev.netlify.app`), pour tester sur un appareil hors réseau local sans passer par la prod. `/deploy` et `/deploy_dev` exécutent désormais `/close` en étape 0 — le code déployé est toujours clôturé et commité avant build.

Déploiement v5.24 effectué (2026-08-14, suite 5), avertissements tests manuels confirmés. Version dev affichée en permanence ajoutée ensuite : le panneau dev (haut à droite, `npm run dev` uniquement) lit `CHANGELOG.md` au build et affiche la version courante sans intervention manuelle. 533/533 tests unitaires, `tsc -b`/lint clean.

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

Valider les 5 points de `tests_manuels.md` sur appareil réel (dont l'import d'une sauvegarde JSON), pour clore la Phase V5.1-0 (`roadmap_v5.1.md`) sur ses 4 premiers points. En parallèle, informer la testeuse du changement d'adresse du site (`appli-audhd.netlify.app`), lui communiquer les points de `a_communiquer_v5.md` (racine), et lui demander un test réel du Budget refondu.

## Licence

MIT — voir [LICENSE](LICENSE).
