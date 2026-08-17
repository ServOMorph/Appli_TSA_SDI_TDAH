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

La version **v5.40** est déployée en production (voir le [CHANGELOG](CHANGELOG.md)), non encore mise à jour avec les changements ci-dessous. Le parcours de tests manuels de Marie (catalogue in-app avec étapes numérotées, historique, archivage projet) est entièrement livré ; les tests déjà validés n'apparaissent plus dans la liste affichée. Les listes peuvent être organisées en catégories, avec export/import complet.

Refonte du Budget en cours (`roadmap_budget_v2.md`, 4 phases) : Phase 1 livrée — entité de revenus saisis manuellement (« Montant total ») avec son propre formulaire, non encore reliée aux catégories de dépense ni aux livrets (Phases 2-4 à venir).

Le déploiement public est disponible sur [appli-audhd.netlify.app](https://appli-audhd.netlify.app).

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
- [Roadmap des tests manuels](roadmap_tests_marie.md) : état du recueil des retours d'usage.
- [Décisions d'architecture](_docs/adr/) : choix techniques structurants.
- [Guide pour agents et IA](llms.txt) : synthèse du projet et de ses points d'entrée.

## Licence

Ce projet est distribué sous licence [MIT](LICENSE).
