# Roadmap — Documentation du projet

Créée le 2026-09-16. Zone : `documentation`.

## Objectif

Construire une base de connaissances métier et technique fiable, organisée en lecture progressive,
à partir des sources actuelles du projet. La documentation ne doit ni inventer de règles ni
présenter comme courant un état seulement historique.

## Phase 1 — Socle documentaire [FAIT]

- Créer `INDEX.md` comme point d'entrée unique.
- Créer les dossiers `10_concepts/`, `20_guides/`, `30_decisions/` et `40_specs/`.
- Définir les conventions communes et les modèles minimaux de documents.
- Définir la hiérarchie des sources et la procédure de traitement des contradictions.
- Contrôler que chaque document créé est référencé dans l'index et que chaque lien est valide.

Gate : index navigable, conventions explicites, structure présente, sans contenu métier extrapolé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Cartographie du projet [FAIT]

- Documenter l'objectif du produit, ses utilisateurs et ses grands domaines fonctionnels.
- Décrire l'architecture générale : React, TypeScript, Dexie, PWA, Supabase et synchronisation.
- Distinguer les sources courantes, historiques, obsolètes ou contradictoires.
- Contrôler les affirmations contre le code, les tests et les décisions actuelles.
- Vérifier les liens, l'indexation et la cohérence des documents produits.

Gate : cartographie générale sourcée et navigable, sans ambiguïté entre état actuel et historique.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Concepts métier [FAIT]

- Documenter les tâches, la planification, l'énergie, le budget, le profil, l'appareil, le
  consentement, le partage des données et les retours conversationnels.
- Définir le vocabulaire commun et les relations entre concepts.
- Recouper chaque règle importante avec sa source actuelle.
- Ajouter des contrôles de cohérence et de liens adaptés aux documents produits.

Gate : concepts essentiels définis, sourcés et exempts de contradictions non signalées.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Spécifications fonctionnelles [FAIT]

- Documenter l'accueil et la navigation, les tâches, le planning, l'énergie, le budget, les
  paramètres, l'onboarding et le cycle complet des retours.
- Pour chaque parcours, préciser les écrans, les données, les règles, les erreurs et les critères
  d'acceptation.
- Vérifier les spécifications contre le code et les tests existants.
- Contrôler les liens et la couverture des parcours retenus.

Gate : chaque parcours prioritaire dispose d'une spécification actuelle et vérifiable.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — Guides techniques et d'exploitation [FAIT]

- Documenter l'installation locale, l'architecture du code, le stockage, la synchronisation, les
  tests, le déploiement, les retours testeurs, la sauvegarde et la restauration.
- Documenter l'exploitation de la gateway Discord sans exposer de secret ni de donnée sensible.
- Tester les commandes non destructives présentées dans les guides lorsque leur exécution locale
  est possible.
- Contrôler les liens et signaler explicitement toute procédure non testée.

Gate : guides exécutables, limites signalées, aucune donnée sensible copiée.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 6 — Décisions structurantes et migration [FAIT]

- Extraire progressivement les règles propres au projet depuis `.claude/CLAUDE.md`.
- Créer les documents de décision correspondants et remplacer uniquement les blocs migrés par des
  renvois.
- Résoudre avant toute modification le conflit de périmètre : la zone documentation peut modifier
  `CLAUDE.md`, tandis que la mémoire projet impose de synchroniser `AGENTS.md` et `GEMINI.md`.
- Contrôler l'identité des trois fichiers d'instructions après chaque migration autorisée.
- Vérifier tous les renvois créés.

Gate : migration autorisée, synchronisée et sans perte de règle.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 7 — Contrôle final et maintenance [TODO]

- Contrôler les liens, les doublons, les contradictions et l'indexation complète.
- Revalider les affirmations importantes contre leurs sources actuelles.
- Définir la règle de maintenance lors des futures évolutions du produit.
- Produire la liste résiduelle des lacunes documentaires.
- Exécuter un contrôle final reproductible de la base documentaire.

Gate : base cohérente, maintenable et utilisable depuis `INDEX.md`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
