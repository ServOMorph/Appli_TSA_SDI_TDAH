# Analyse des prototypes abandonnés

Date : 2026-10-10
Statut : implémentations retirées à la demande de l'utilisateur ; garder cette analyse pour concevoir les prochains jeux.

## Tri calme

- Boucle : déplacer des formes dans l'un de deux bacs selon une règle visible (couleur ou forme).
- Réglages : 4, 6, 8 ou 10 éléments ; déplacement par glisser-déposer ou sélection puis choix du bac.
- Résultat : prototype fonctionnel, jugé « trop simple » par l'utilisateur.
- Analyse : le tri était l'activité elle-même ; peu de décisions s'accumulaient et la maîtrise n'ouvrait pas sur de nouveaux états de jeu. La variation du nombre d'éléments ne créait pas une progression de mécanique.

## Planning d'énergie

- Boucle : répartir des tâches sur cinq jours sans dépasser la capacité d'énergie, en respectant les échéances et dépendances.
- Réglages : trois niveaux de 6, 8 ou 11 tâches ; vérificateur de faisabilité, indice, glisser-déposer ou sélection.
- Résultat : solveur et générateur produisant une solution valide ; prototype fonctionnel, jugé « pas assez ludique » par l'utilisateur.
- Analyse : l'habillage en semaine et en énergie conservait une tâche d'organisation ressemblant à l'usage quotidien de l'application. Le solveur garantissait la cohérence des niveaux, mais ne rendait pas à lui seul les décisions excitantes ni leurs conséquences immédiatement satisfaisantes.

## Fruits en cascade

- Boucle : lâcher un fruit dans une grille à colonnes ; fusionner les fruits identiques voisins ; effacer les rangées complètes ; charger une vague spéciale après trois fusions.
- Réglages et retours : grille de 6 colonnes par 8 rangées, six fruits, aperçu du fruit suivant, score et fin de partie lorsque la rangée haute est atteinte.
- Résultat : prototype fonctionnel, puis rejeté par l'utilisateur parce qu'il ressemblait trop à Fruit Merge.
- Analyse : ajouter une grille, des effacements de rangées ou un pouvoir spécial n'a pas assez différencié l'expérience lorsque le geste et le résultat centraux restaient « lâcher puis fusionner des fruits ». Une variation secondaire ne compense pas une boucle reconnaissable comme celle du jeu de référence.

## Résonance

- Boucle : orienter des pétales, lancer un écho, regarder son trajet et atteindre les carillons dans l'ordre.
- Progression : huit niveaux ; cases de rotation de l'écho et case inversant temporairement les pétales.
- Résultat : l'utilisateur juge le jeu insuffisamment intéressant et demande sa suppression.
- Analyse : les nouvelles cases compliquaient le trajet à résoudre, mais le geste principal restait « régler puis regarder ». Les ajouts de niveaux n'ont pas créé assez d'action ou de décisions pendant l'exécution. Le prochain concept doit faire agir le joueur pendant que le système réagit, puis produire des conséquences visibles et variables.

## Leçons à appliquer aux prochains concepts

1. Différencier d'abord le verbe central et la boucle de jeu ; ne pas compter sur le thème, les bonus ou la progression pour rendre originale une boucle imitée.
2. Concevoir à partir de l'expérience recherchée, puis relier règles, réactions du système et ressenti ; tester le noyau jouable avant d'investir dans beaucoup de niveaux ou de contenu.
3. Faire tester tôt les commandes et le plaisir réel. Une implémentation fonctionnelle, des tests techniques réussis ou une interface soignée ne prouvent pas que le jeu est amusant.
4. Hypothèse à vérifier, pas préférence déjà confirmée : les jeux cités par l'utilisateur peuvent indiquer un intérêt pour l'action lisible, la maîtrise spatiale et les enchaînements gratifiants. Demander ce qui lui plaît précisément avant le prochain prototype.
5. Pour éviter une nouvelle progression purement quantitative, éprouver d'abord une boucle avec des décisions pendant l'action et une réaction immédiate aux commandes.

## Historique technique conservé

Les trois jeux utilisaient le banc d'essai React séparé, sans branchement dans l'application. L'ancien catalogue ne faisait que monter leurs composants sur l'accueil de test. Le Planning d'énergie avait un générateur, un solveur borné, un validateur et un indice ; Tri calme avait un générateur d'items, des règles couleur/forme et des contrôles souris/clavier ; Fruits en cascade avait une logique pure pour dépôt, fusion, rangées, vague et fin de partie.

Au dernier contrôle avant suppression, l'ensemble des trois zones de tests passait (35 tests), ainsi que TypeScript et ESLint. Ces résultats décrivent l'état testé alors et ne qualifient pas la valeur ludique.

Sources de méthode : Hunicke, LeBlanc et Zubek, [MDA: A Formal Approach to Game Design and Game Research](https://www.cs.northwestern.edu/~hunicke/MDA.pdf) ; Ryan, Rigby et Przybylski, [The Motivational Pull of Video Games](https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf) ; Eladhari et Ollila, [Design for Research Results: Experimental Prototyping and Play Testing](https://doi.org/10.1177/1046878111434255).
