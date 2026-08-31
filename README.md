# Assistant AuDHD — planification et gestion d'énergie neuroinclusive

Assistant AuDHD est une application web progressive (PWA) conçue pour aider les personnes AuDHD (TSA et TDAH) à alléger leur charge mentale. Construite avec React, TypeScript, Vite et Dexie.js, elle fournit un système local de soutien aux fonctions exécutives : tâches, planification, énergie, outils personnels et tests manuels.

**English summary.** Assistant AuDHD is a neuroinclusive React and TypeScript PWA for autistic and ADHD people. It stores data locally with IndexedDB and helps users manage tasks, daily planning, energy, and personal tools without a cloud account.

![Écran d'accueil de l'application Assistant AuDHD](_docs/images/onboarding.png)

## Fonctionnalités

- Réception et gestion de tâches, avec sous-étapes, durée, récurrence et exceptions.
- Planification quotidienne et suivi d'énergie, avec un mode de récupération en cas de surcharge.
- Listes, dossiers et outil Budget, organisés pour réduire les frictions de l'usage quotidien.
- Export et import local des données ; le stockage applicatif repose sur IndexedDB.
- Catalogue de tests manuels en langage clair, destiné à recueillir et archiver les retours d'usage.

## État actuel

La version **v5.69** est en production (déployée le 31 août 2026) : la synchronisation automatique des données de test vers Supabase est en ligne. Les données de chaque appareil sont sauvegardées toutes seules (au démarrage et au retour dans l'appli, au plus une fois par heure), sans export ni envoi manuel ; une carte dans les Paramètres l'indique. Ce déploiement rattrape aussi en production les versions v5.65 à v5.68. Le mécanisme est vérifié côté développeur ; la première synchronisation réelle de Marie reste à confirmer.

Les branches Git obsolètes ont été supprimées le 31 août 2026 et `main` a été vérifié (build, tests et lint verts, arbre propre, synchronisé avec le distant). La roadmap `roadmap_bundle_2026-08-31.md` (créée, non lancée) planifie en cinq phases la réduction de la taille du bundle JavaScript, aujourd'hui au-dessus du seuil d'alerte : la première phase, mesurée, retire la bibliothèque cliente Supabase du navigateur (−208 ko) sans changer la synchronisation des données.

Les demandes 18-22 du Google Doc « Modifications » de Marie (toutes « Accueil / Planning ») sont regroupées dans `roadmap_planning_accueil_2026-08-29.md` (5 phases) : hauteur de planning fixe sans plier/déplier, cases de tâches colorées sur toute leur hauteur, bandeau des jours coloré, défilement interne des jours et vue planning de la semaine en pleine page. Les phases 1 et 2 sont déployées avec v5.69 ; la phase 3 est en cours. Marie a tranché la navigation de la vue semaine (par semaine si les sept jours tiennent à l'écran, sinon par jour). Le débordement du cadre Date/Heure du formulaire de tâche (retour #3) attend toujours la revalidation de Marie.

La version **v5.63** ajoute un registre de suivi des demandes du Google Doc de Marie réconcilié par `/analyser_googledoc`, `/deploy` et `/traiter_export_marie`, plus le champ `docRefs` du catalogue de tests.

La version **v5.62** rallume le point rouge de l’icône « Tests à faire » dès qu’un test reste à valider (révision comprise), en suivant exactement la liste de l’écran « Tests à faire ».

La version **v5.61** ajoute les montants temporaires par catégorie et période ; le parcours « Suivre ses dépenses avec Comptes » a été validé par Marie le 27 août.

Les roadmaps des 23 et 24 août sont archivées ; la roadmap du 25 août est livrée : retrait de « Terminer », couleur des outils dans Paramètres et accès direct à la modification d’énergie. La décision #11 reste à confirmer avec Marie pour les catégories mensuelles.

La version **v5.60** est déployée en production (voir le [CHANGELOG](CHANGELOG.md), HTTP 200 vérifié le 27 août 2026). Le parcours de tests manuels de Marie réaffiche désormais chaque test dont les étapes ont changé ; une validation est associée à la révision testée. Les tests sont regroupés en 7 catégories, repliées par défaut.

`roadmap_demandes_marie_2026-08-24.md` (17 demandes numérotées) est livrée avec v5.56 : menu de fiche de tâche simplifié, Budget repassé sur les montants prévus, ajout de dépense via la fiche de catégorie, formulaire de catégorie de liste corrigé sur mobile et retour direct à l’accueil après validation de l’énergie. Les décisions #7 (contenu de « Montant total ») et #11 (prévision limitée à une semaine) restent à clarifier avec Marie.

Le déploiement public est disponible sur [appli-audhd.netlify.app](https://appli-audhd.netlify.app).

Les éléments à transmettre à Marie sont centralisés dans [COMMUNICATION/Marie/a_transmettre.md](COMMUNICATION/Marie/a_transmettre.md) ; chaque déploiement en conserve une copie versionnée et la publie sur Drive.

## Prérequis

- Node.js et npm.
- Un navigateur récent pour utiliser ou tester la PWA.

## Installation et lancement

```bash
git clone https://github.com/ServOMorph/Appli_TSA_SDI_TDAH.git
cd Appli_TSA_SDI_TDAH
npm install
npm run dev
```

Ouvrez ensuite l'URL affichée par Vite, habituellement `http://localhost:5173`.

## Commandes utiles

```bash
npm run build          # vérification TypeScript et build de production
npm run preview        # prévisualisation du build
npm run lint           # ESLint sans avertissement accepté
npm test               # tests unitaires et d'intégration Vitest
npm run test:coverage  # couverture de tests
npm run test:e2e       # scénarios Playwright
```

## Architecture

```text
src/
  domain/    Logique métier pure : entités et règles de gestion
  data/      Persistance Dexie.js, IndexedDB et migrations
  ui/        Composants et écrans React accessibles
  app/       Navigation, providers et état applicatif
  test/      Utilitaires et configuration de tests partagés
scripts/     Scripts de développement et d'ingestion des retours de test
_docs/       Documentation produit, technique et ADR
_contexte/  Contexte et journal de suivi du projet
```

L'interface React reste séparée des règles métier et de la persistance. Les données utilisateur sont stockées localement dans IndexedDB ; la synchronisation cloud est un sujet post-MVP.

## Documentation

- [Changelog](CHANGELOG.md) : historique versionné des évolutions.
- [Roadmap des tests manuels](Archives/roadmap_tests_marie.md) : état du recueil des retours d'usage.
- [Décisions d'architecture](_docs/adr/) : choix techniques structurants.
- [Guide pour agents et IA](llms.txt) : synthèse du projet et de ses points d'entrée.

## Licence

Ce projet est distribué sous licence [MIT](LICENSE).
