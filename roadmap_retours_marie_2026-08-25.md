# Roadmap — Retours Marie, 25 août 2026

Sources : message de Marie du 25 août 2026 et export `export-audhd-2026-08-25-16h15.json` analysé le 25 août 2026.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.

## Périmètre

Traiter les retours nouveaux de Marie après v5.56, sans modifier « Montant total » et sans implémenter #11 avant la décision sur les catégories mensuelles.

## Analyse des retours

| Catégorie | Demande | État | Traitement |
| --- | --- | --- | --- |
| Tâches | Retirer « Terminer » de la fiche de tâche | Corrigé localement, non encore livré | Phase 1 |
| Outils : autres | Déplacer le sélecteur de couleur des outils dans Paramètres, après « Couleur d’ambiance » | À concevoir | Phase 2 |
| Énergie | Le badge énergie doit ouvrir directement la modification | Bug confirmé par le retour de test | Phase 3 |
| Outils : Budget | Montant temporaire jusqu’à la fin de semaine | Décision incomplète pour les catégories mensuelles | Décision en attente |

## Décision en attente

- **#11 — Catégories mensuelles** : confirmer avec Marie si une modification temporaire jusqu’à la fin de semaine concerne seulement les catégories hebdomadaires, ou aussi les catégories mensuelles. Aucun développement avant cette réponse.

## Ordre et dépendances

```
Phase 1 — Retrait de « Terminer »
Phase 2 — Couleur des outils dans Paramètres
Phase 3 — Badge énergie direct
Phase 4 — Validation et préparation de livraison
```

Les phases 1 à 3 sont indépendantes. La phase 4 dépend des trois premières.

## Phase 1 — Retrait de « Terminer » [x]

- [x] Retirer « Terminer » de la fiche d’une tâche.
- [x] Mettre à jour le test d’écran et le test manuel correspondant.
- [x] Exécuter les contrôles complets avec les autres changements de la roadmap (75 fichiers, 610 tests verts).

Critère de sortie : la fiche affiche uniquement Modifier, Décomposer, Dupliquer et Supprimer ; une tâche planifiée se termine par sa coche dans le planning.

**⏸ Checkpoint** — Demander à l’utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Couleur des outils dans Paramètres [x]

- [x] Déplacer le contrôle de couleur des outils dans Paramètres > Accessibilité, après « Couleur d’ambiance », sans perdre le choix ni le retrait de couleur par outil.
- [x] Retirer le contrôle de couleur des cartes d’outils.
- [x] Ajouter les tests automatisés et mettre à jour le test manuel.

Critère de sortie : la couleur de chaque outil est réglable depuis Paramètres, immédiatement après « Couleur d’ambiance », et reste persistante.

**⏸ Checkpoint** — Demander à l’utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Badge énergie direct [x]

- [x] Depuis l’accueil, faire ouvrir le badge énergie directement sur l’écran de modification.
- [x] Conserver le retour direct vers l’accueil après validation.
- [x] Ajouter les tests automatisés et mettre à jour le test manuel.

Critère de sortie : toucher le badge énergie ouvre directement la modification de l’état du jour ; valider revient à l’accueil.

**⏸ Checkpoint** — Demander à l’utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Validation et préparation de livraison [x]

- [x] Exécuter les tests ciblés, la suite complète, TypeScript et le lint.
- [x] Mettre à jour le catalogue de tests manuels, le changelog et le message à Marie.
- [x] Autorisation de déploiement reçue.

Critère de sortie : contrôles automatisés verts, documentation alignée et communication Marie prête.
