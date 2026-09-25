# Spécification — Outils, listes et budget

**Statut :** actuel (code consulté le 2026-09-25)  
**Sources :** `src/ui/screens/tools/E70Tools.tsx`, `src/ui/screens/tools/E72FolderDetail.tsx`, `src/ui/screens/lists/E61ListDetail.tsx`, `src/ui/screens/lists/E62ListItemDetail.tsx`, `src/ui/screens/tools/E71Budget.tsx`, `src/ui/screens/tools/E73CategoryDetail.tsx`, `src/ui/screens/tools/E74BudgetSettings.tsx`, `src/ui/screens/tools/E75BudgetAccount.tsx`, `src/ui/screens/tools/E76BudgetLivrets.tsx`, `src/ui/screens/tools/E77BudgetLivretDetail.tsx`, `src/ui/screens/tools/E78BudgetPrevisions.tsx`, `src/domain/rules/budgetRules.ts`, `src/ui/screens/tools/E79RoutineDetail.tsx`, `src/ui/screens/tools/E80RoutineSteps.tsx`, `src/domain/rules/routineRules.ts`.

## Objectif

Donner des espaces d'organisation complémentaires aux tâches et un suivi budgétaire local.

## Outils et listes

L'écran Outils ouvre les dossiers et les outils racine. Une liste est créée comme outil, peut être rangée dans un dossier et est ouverte sur `E61`.

Dans une liste, l'utilisateur crée ou supprime des catégories, puis crée, coche, supprime et planifie des éléments appartenant à une catégorie. Un élément peut ouvrir son détail dans `E62` et afficher ses sous-éléments cochables. Supprimer une liste demande une confirmation ; supprimer une catégorie met à jour la liste affichée.

La planification d'un élément de liste crée une tâche planifiée avec son titre, la date et l'heure choisies ; une règle de récurrence peut être ajoutée.

## Budget

`E71` demande d'abord un revenu avant d'afficher le budget. Une fois configuré, il montre le montant total, les prévisions et les livrets. Les revenus peuvent être ajoutés, modifiés ou supprimés.

`E75` présente « Mon compte » par colonnes hebdomadaire et mensuelle. Chaque catégorie ouvre son détail, avec les dépenses et le montant restant pour la période. Les paramètres permettent de gérer prévisions et catégories ; les écrans de livrets gèrent comptes et mouvements.

Le montant total est calculé à partir des revenus, des mouvements de livrets et des prévisions de « Mon compte ». Une jauge devient avertissement à 80 % du montant prévu et dépassement au-delà. Un retrait de livret ne peut pas dépasser le solde disponible.

## Routine

`E79` (dossier/outil) gère la routine : renommer, choisir une couleur, créer/modifier/supprimer/réordonner ses étapes communes (glisser-déposer), et la planifier sur des jours de semaine via un pavé numérique (un horaire par jour). C'est le seul point d'entrée pour cette gestion structurelle.

`E80` est l'écran plein écran quotidien : ouvert depuis le planning du jour ou de la semaine (jamais depuis `E79`), à la date du bloc cliqué. Il liste les étapes effectives de ce jour (communes ou propres au jour si détaché), cochables, chacune dépliable pour afficher, cocher, ajouter ou supprimer des sous-tâches.

Depuis `E80`, un bouton « Modifier ce jour » détache automatiquement le jour au premier appui (clone les étapes communes) puis ouvre un mode d'édition propre à ce jour (ajouter/modifier/supprimer/réordonner par glisser-déposer). Un bouton « Revenir à la version commune » supprime les étapes propres au jour et rétablit le jeu commun.

Une routine planifiée apparaît dans le planning du jour et de la semaine avec son propre logo, cochée automatiquement quand toutes ses étapes du jour sont faites (jamais si elle n'en a aucune).

## Erreurs et limites

- Un élément ou une catégorie de liste vide n'est pas créé.
- L'ajout d'un élément exige une liste et une catégorie sélectionnées.
- Sans revenu, l'écran budget limite le parcours à sa configuration.
- Les confirmations protègent la suppression de liste et les actions destructrices des écrans de données.
- Détacher un jour de routine ne recopie pas les sous-tâches des étapes communes ; les étapes propres au jour démarrent sans sous-tâche.
- La suppression d'une routine (`E79`) supprime en cascade toutes ses étapes (communes et propres à un jour) et ses plannings.

## Critères d'acceptation

- Un outil de type liste peut être créé, ouvert, puis contenir une catégorie et un élément.
- Cocher un élément rafraîchit son état affiché ; ses sous-éléments restent cochables séparément.
- Planifier un élément de liste crée une tâche planifiée portant le même titre.
- Après saisie d'un revenu, le budget expose montant total, prévisions et livrets.
- Les montants consommés sont évalués sur la période hebdomadaire ou mensuelle de la catégorie.
- Une routine planifiée un jour donné ouvre `E80` à la bonne date et affiche ses étapes effectives (communes ou détachées).
- Cocher toutes les étapes du jour dans `E80` fait passer la routine à « terminée » dans le planning.
- Détacher un jour dans `E80` ne modifie jamais les étapes communes visibles dans `E79`, ni les autres jours planifiés.

## Preuves existantes

Les écrans et calculs cités en sources portent ces parcours. La recherche des tests ciblant ces écrans n'a pas retourné de fichier dédié pour listes/budget ; la routine est couverte par `E79RoutineDetail.test.tsx`, `E80RoutineSteps.test.tsx` et `routineRules.test.ts`.
