# Outils, listes et budget

**Statut :** actuel (code consulté le 2026-09-25)  
**Sources :** `src/domain/entities/tool.ts`, `src/domain/entities/list.ts`, `src/domain/entities/listItem.ts`, `src/domain/entities/listItemSubTask.ts`, `src/domain/entities/listCategory.ts`, `src/domain/entities/folder.ts`, `src/domain/entities/budget*.ts`, `src/domain/rules/budgetRules.ts`, `src/app/contexts/useBudgetState.ts`, `src/domain/entities/routine*.ts`, `src/domain/rules/routineRules.ts`, `src/app/contexts/useRoutineState.ts`, `src/ui/screens/tools/`.

## Organisation

Les outils sont ordonnés et peuvent être rangés dans des dossiers. Le modèle prévoit cinq types : liste, tableau de comptage, liste de comptage, routine et tableau de prévisions. À ce stade, la liste, le tableau de comptage et la routine sont déclarés comme implémentés.

Une liste contient des catégories ordonnées. Chaque élément appartient à une catégorie, porte un texte, une description facultative, un état coché et un ordre. Un élément peut aussi être découpé en sous-éléments cochables et ordonnés.

## Routine

Une routine est, comme une liste, un objet 1:1 avec son outil (pas un module à entrées multiples comme le budget) : pas d'écran « liste des routines » séparé. Elle porte un nom, une couleur et des étapes ordonnées (titre, durée optionnelle).

Une étape a un champ `weekday` : `null` signifie qu'elle appartient au jeu d'étapes commun, partagé par tous les jours planifiés qui n'ont pas été détachés ; un numéro de jour signifie qu'elle est propre à ce jour de semaine, indépendante du jeu commun.

La planification associe la routine à un ou plusieurs jours de semaine récurrents (pas des dates), chacun avec son propre horaire. Une planification peut être détachée (`steps_overridden`) : ses étapes cessent alors de suivre le jeu commun et deviennent modifiables sans affecter les autres jours. Revenir à la version commune supprime les étapes propres au jour et efface le détachement.

La complétion d'une étape est datée (une ligne par étape cochée à une date donnée), car un jour de semaine récurrent doit pouvoir être coché ou non indépendamment d'une semaine à l'autre. Une routine planifiée un jour donné n'est jamais considérée terminée si elle n'a aucune étape ce jour-là. Les sous-tâches d'une étape réutilisent le mécanisme `Task`/`parent_id` déjà existant : leur complétion n'est pas datée, contrairement à celle de l'étape elle-même.

## Budget

Le budget réunit des prévisions par catégorie hebdomadaire ou mensuelle, des dépenses datées rattachées à ces catégories, des comptes avec mouvements signés et des revenus saisis séparément. Une prévision peut être temporairement ajustée pour une période.

La semaine budgétaire court du lundi au dimanche. Les dépenses d'une catégorie sont calculées dans sa période. La jauge passe en avertissement à 80 % du montant prévu et en dépassement au-delà du montant prévu.

Le solde d'un livret est la somme de ses mouvements. Un retrait est enregistré comme un mouvement négatif ; l'écran de détail empêche un retrait supérieur au solde disponible.

## Montant total et « Mon compte »

Le « Montant total » correspond aux revenus, moins les soldes des livrets, moins les prévisions « Mon compte ». Dans ce calcul, une catégorie mensuelle compte une fois et une catégorie hebdomadaire quatre fois. Le solde affiché de « Mon compte » diminue avec les dépenses du mois associées à ses catégories.
