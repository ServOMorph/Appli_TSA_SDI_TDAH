# Tests manuels — Budget V4.1

Date : à compléter
Testeur : à compléter

État au 2026-07-21 : points 1 à 47 validés. Test interrompu après l'action 48 : le reste mensuel reste à `1 330,00 €` au lieu de `1 380,00 €`, en raison d'un dépôt orphelin antérieur encore compté. Reprendre au point 48 après la correction d'intégrité décrite dans `roadmap_v4.1.md`.

## Préparation

1. Lancer l'application en développement : `npm run dev`.
2. Ouvrir l'adresse affichée par Vite dans le navigateur.
3. Si nécessaire, utiliser le bouton `Reset DB` visible en développement pour repartir d'une base vide.
4. Terminer l'onboarding, puis ouvrir `Outils` dans la navigation basse.
5. Ouvrir `Budget`.
6. Vérifier que les sections `À la semaine`, `Au mois` et `Mes livrets` sont visibles.
7. Vérifier qu'avant configuration, les deux sections affichent `Reste non budgétisé : Non configuré`.

## Configuration des catégories

8. Cliquer sur `Ajouter une catégorie`.
9. Créer un revenu mensuel :
   - Nom : `Salaire test`
   - Type : `Revenu`
   - Périodicité : `Au mois`
   - Montant : `1500`
10. Vérifier que `Salaire test` apparaît dans la section `Au mois` avec `Revenu` et `1 500,00 €`.
11. Créer une dépense mensuelle :
   - Nom : `Abonnement test`
   - Type : `Dépense`
   - Périodicité : `Au mois`
   - Montant : `100`
12. Créer une dépense hebdomadaire :
   - Nom : `Courses test`
   - Type : `Dépense`
   - Périodicité : `À la semaine`
   - Montant : `60`
13. Vérifier que chaque catégorie apparaît uniquement dans sa section.
14. Vérifier, dans `Au mois`, le reste non budgétisé à `1 400,00 €` avant tout dépôt : `1 500 - 100`.
15. Cliquer sur `Renommer Abonnement test`, remplacer le nom par `Box test`, puis cliquer sur `Enregistrer`.
16. Vérifier que le nouveau nom est affiché.
17. Cliquer sur `Modifier le montant de Box test`, remplacer le montant par `120`, puis cliquer sur `Enregistrer`.
18. Vérifier que le montant affiché devient `120,00 €` et que le reste mensuel devient `1 380,00 €`.

## Configuration des livrets

19. Cliquer sur `Ajouter un livret`.
20. Créer un livret nommé `Livret A test`.
21. Vérifier qu'il apparaît dans `Mes livrets` avec un solde à `0,00 €`.
22. Cliquer sur `Renommer Livret A test`, saisir `Épargne test`, puis cliquer sur `Enregistrer`.
23. Vérifier que `Épargne test` est affiché.

## Saisie d'une dépense

24. Cliquer sur `Ajouter une dépense`.
25. Sélectionner la catégorie `Courses test`.
26. Saisir le montant `20`.
27. Saisir le libellé facultatif `Intermarché test`.
28. Cliquer sur `Enregistrer`.
29. Vérifier, pour `Courses test` :
   - `Dépensé : 20,00 €` ;
   - `Restant : 40,00 €` ;
   - une ligne datée contenant `Intermarché test` et `20,00 €`.
30. Saisir une seconde dépense de `45` dans `Courses test`.
31. Vérifier que le restant devient négatif : `-5,00 €`.

## Dépôt vers un livret

32. Cliquer sur `Ajouter un dépôt`.
33. Sélectionner `Épargne test`.
34. Saisir le montant `50`, puis cliquer sur `Enregistrer`.
35. Vérifier que le solde de `Épargne test` devient `50,00 €`.
36. Vérifier que le reste non budgétisé mensuel devient `1 330,00 €` : `1 500 - 120 - 50`.
37. Vérifier qu'une ligne datée `Dépôt : 50,00 €` apparaît sous le livret.

## Historique des périodes

38. Dans `À la semaine`, cliquer sur `Semaine précédente`.
39. Vérifier que les dépenses saisies aujourd'hui ne sont plus comptées dans la période précédente.
40. Cliquer sur `Semaine suivante` pour revenir à la période courante.
41. Vérifier que les deux dépenses de `Courses test` réapparaissent et que le restant est de nouveau `-5,00 €`.
42. Dans `Au mois`, cliquer sur `Mois précédent`.
43. Vérifier que le dépôt courant n'est pas listé pour le mois précédent et que le reste mensuel ne le déduit pas.
44. Cliquer sur `Mois suivant` pour revenir au mois courant.
45. Vérifier que le dépôt de `50,00 €` et le reste mensuel à `1 330,00 €` réapparaissent.

## Correction d'une erreur de saisie

46. Cliquer sur `Supprimer la dépense Intermarché test`.
47. Vérifier que cette ligne disparaît et que le restant de `Courses test` passe de `-5,00 €` à `15,00 €`.
48. Cliquer sur `Supprimer le dépôt` dans la ligne datée `Dépôt : 50,00 €` ; ne pas cliquer sur `Supprimer le livret`.
49. Vérifier que le solde de `Épargne test` revient à `0,00 €`.
50. Vérifier que le reste mensuel revient à `1 380,00 €`.

## Suppression avec confirmation

51. Créer une catégorie hebdomadaire de test nommée `À supprimer`, avec un budget de `10 €`.
52. Saisir une dépense de `5 €` dans cette catégorie.
53. Cliquer sur `Supprimer À supprimer`.
54. Vérifier qu'une boîte de confirmation signale l'existence de dépenses.
55. Cliquer sur `Annuler` et vérifier que la catégorie reste affichée.
56. Recommencer la suppression, puis cliquer sur `Supprimer` dans la boîte de confirmation.
57. Vérifier que la catégorie disparaît.
58. Créer un livret nommé `Livret à supprimer`.
59. Ajouter un dépôt de `10 €` sur ce livret.
60. Cliquer sur `Supprimer Livret à supprimer`.
61. Vérifier qu'une boîte de confirmation signale l'existence de dépôts.
62. Cliquer sur `Annuler`, puis vérifier que le livret reste affiché.
63. Recommencer la suppression et confirmer.
64. Vérifier que le livret disparaît.

## Contrôles finaux

65. Revenir à `Outils` avec le bouton `Retour`, puis ouvrir de nouveau `Budget`.
66. Vérifier que les catégories, écritures et livrets non supprimés sont toujours présents.
67. Vérifier qu'aucune donnée de test supprimée n'est encore visible.
68. Noter le résultat global : `validé` ou `écart constaté`.
69. En cas d'écart, noter le numéro de l'étape, le résultat observé et une capture d'écran si utile.

## Hors périmètre

- Le changement de périodicité d'une catégorie existante n'est pas disponible.
- Les retraits et virements entre livrets ne sont pas disponibles.
- La saisie rapide depuis le Dashboard n'est pas disponible.
