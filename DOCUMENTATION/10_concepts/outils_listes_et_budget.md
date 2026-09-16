# Outils, listes et budget

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/domain/entities/tool.ts`, `src/domain/entities/list.ts`, `src/domain/entities/listItem.ts`, `src/domain/entities/listItemSubTask.ts`, `src/domain/entities/listCategory.ts`, `src/domain/entities/folder.ts`, `src/domain/entities/budget*.ts`, `src/domain/rules/budgetRules.ts`, `src/app/contexts/useBudgetState.ts`, `src/ui/screens/tools/`.

## Organisation

Les outils sont ordonnés et peuvent être rangés dans des dossiers. Le modèle prévoit cinq types : liste, tableau de comptage, liste de comptage, routine et tableau de prévisions. À ce stade, seule la liste et le tableau de comptage sont déclarés comme implémentés.

Une liste contient des catégories ordonnées. Chaque élément appartient à une catégorie, porte un texte, une description facultative, un état coché et un ordre. Un élément peut aussi être découpé en sous-éléments cochables et ordonnés.

## Budget

Le budget réunit des prévisions par catégorie hebdomadaire ou mensuelle, des dépenses datées rattachées à ces catégories, des comptes avec mouvements signés et des revenus saisis séparément. Une prévision peut être temporairement ajustée pour une période.

La semaine budgétaire court du lundi au dimanche. Les dépenses d'une catégorie sont calculées dans sa période. La jauge passe en avertissement à 80 % du montant prévu et en dépassement au-delà du montant prévu.

Le solde d'un livret est la somme de ses mouvements. Un retrait est enregistré comme un mouvement négatif ; l'écran de détail empêche un retrait supérieur au solde disponible.

## Montant total et « Mon compte »

Le « Montant total » correspond aux revenus, moins les soldes des livrets, moins les prévisions « Mon compte ». Dans ce calcul, une catégorie mensuelle compte une fois et une catégorie hebdomadaire quatre fois. Le solde affiché de « Mon compte » diminue avec les dépenses du mois associées à ses catégories.
