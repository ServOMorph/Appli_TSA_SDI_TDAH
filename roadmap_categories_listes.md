# Roadmap — Catégories de listes

## Contexte
Actuellement, la "rubrique" d'un item de liste est un texte libre saisi item par item, sans
entité dédiée. Demande : à la création d'une liste, définir des sous-catégories ; au clic sur la
liste, choisir d'abord une catégorie avant de voir ses éléments (plutôt que tout afficher à plat).

## Décisions actées
- Catégories modifiables après la création de la liste (pas seulement à la création).
- Catégorie obligatoire pour chaque item (pas d'item "sans catégorie").
- Le champ "Rubrique" texte libre disparaît au profit d'un choix parmi les catégories de la liste.

## Phase 1 — Modèle de données [FAIT]
- Entité `ListCategory` (`id`, `list_id`, `name`, `position`, `created_at`).
- `ListItem.section: string | null` → `ListItem.category_id: string`.
- Migration Dexie (v12) : table `listCategories` ; pour chaque liste ayant des items, une
  catégorie par valeur de `section` distincte (dont `null` → catégorie "Général") ; les items
  reçoivent le `category_id` correspondant.
- Repository `listCategoryRepository`, règles domaine, méthodes `useListsState`
  (créer/renommer/supprimer catégorie, lister par liste).
- Tests unitaires (repository, règles, migration).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Création de liste avec sous-catégories [FAIT]
- `ToolCreateModal` : après le nom de la liste, ajouter/retirer les catégories initiales
  (pattern identique aux sous-tâches de `E21CreateTaskV2`).
- Au moins une catégorie doit exister à la création (contrainte "catégorie obligatoire").

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Écran de sélection de catégorie [FAIT]
- `E61ListDetail` : au clic sur la liste, afficher d'abord les catégories (plus l'affichage direct
  des items groupés) ; clic sur une catégorie → écran des items de cette catégorie.
- Bouton "Ajouter une catégorie" depuis cet écran.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Ajout d'élément via catégorie [FAIT]
- Le formulaire "Ajouter un élément" (déclenché depuis l'écran d'une catégorie) fixe
  `category_id` à la catégorie courante ; suppression du champ "Rubrique" texte libre.
