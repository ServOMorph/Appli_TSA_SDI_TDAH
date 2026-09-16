# Spécification — Outils, listes et budget

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/ui/screens/tools/E70Tools.tsx`, `src/ui/screens/tools/E72FolderDetail.tsx`, `src/ui/screens/lists/E61ListDetail.tsx`, `src/ui/screens/lists/E62ListItemDetail.tsx`, `src/ui/screens/tools/E71Budget.tsx`, `src/ui/screens/tools/E73CategoryDetail.tsx`, `src/ui/screens/tools/E74BudgetSettings.tsx`, `src/ui/screens/tools/E75BudgetAccount.tsx`, `src/ui/screens/tools/E76BudgetLivrets.tsx`, `src/ui/screens/tools/E77BudgetLivretDetail.tsx`, `src/ui/screens/tools/E78BudgetPrevisions.tsx`, `src/domain/rules/budgetRules.ts`.

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

## Erreurs et limites

- Un élément ou une catégorie de liste vide n'est pas créé.
- L'ajout d'un élément exige une liste et une catégorie sélectionnées.
- Sans revenu, l'écran budget limite le parcours à sa configuration.
- Les confirmations protègent la suppression de liste et les actions destructrices des écrans de données.

## Critères d'acceptation

- Un outil de type liste peut être créé, ouvert, puis contenir une catégorie et un élément.
- Cocher un élément rafraîchit son état affiché ; ses sous-éléments restent cochables séparément.
- Planifier un élément de liste crée une tâche planifiée portant le même titre.
- Après saisie d'un revenu, le budget expose montant total, prévisions et livrets.
- Les montants consommés sont évalués sur la période hebdomadaire ou mensuelle de la catégorie.

## Preuves existantes

Les écrans et calculs cités en sources portent ces parcours. La recherche des tests ciblant ces écrans n'a pas retourné de fichier dédié.
