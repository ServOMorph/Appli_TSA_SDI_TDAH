# Suivi des modifications demandées par Marie

Registre durable du traitement des demandes inscrites par Marie dans son Google Doc « Modifications ».
Source de vérité du suivi Marie, indépendante des roadmaps (qui sont une vue de travail éphémère,
archivée après livraison).

- Google Doc : `https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`
- Dernière revue du Doc : 2026-08-24 (date de modification analysée)
- **Doc modifié le 2026-08-28 23:28 — non encore analysé.** Marie a retiré les demandes 1 à 17 (toutes traitées) et ajouté 18 à 22 (toutes « Accueil / Planning »). À analyser via `/analyser_googledoc` en début de prochaine session.
- Dernière mise à jour de ce registre : 2026-08-29 (constat du changement du Doc, demandes 18-22 ajoutées `à analyser`)

États autorisés : `livrée vX.Y` · `en attente` · `en cours <roadmap>` · `écartée : <motif>`.

| N° | Catégorie | Demande (résumé) | État | Revue le |
| --- | --- | --- | --- | --- |
| 1 | Accueil / Planning | Hauteur de case proportionnelle à la durée de la tâche | livrée v5.45 | 2026-08-24 |
| 2 | Accueil / Planning | Couleur des cases outils réglable outil par outil, depuis Paramètres > Accessibilité après « Couleur d'ambiance » | livrée v5.58 | 2026-08-24 |
| 3 | Tâches | Le cadre Date/Heure déborde à droite ; marges à équilibrer | en attente : correctif appliqué en v5.64 (`min-width: 0` sur le `<form>`), à revalider par Marie | 2026-08-28 |
| 4 | Tâches | Retirer « Tâche du jour », « Planifier », « Liste », « Terminer » de la fiche de tâche | livrée v5.58 | 2026-08-24 |
| 5 | Tâches | Conserver « Décomposer » et « Dupliquer » | livrée v5.56 | 2026-08-24 |
| 6 | Outils : Budget | « Montant total » = revenus − prévisions « Mon compte » − transferts livrets | livrée v5.56 | 2026-08-24 |
| 7 | Outils : Budget | Sous « Montant total », n'afficher que le revenu de base ; transactions accessibles au clic sur la case | écartée : décision reçue le 25/08, aucun changement | 2026-08-24 |
| 8 | Outils : Budget | « Mon compte » = somme des montants prévus par catégorie (×4 en hebdomadaire), pas les dépenses | livrée v5.56 | 2026-08-24 |
| 9 | Outils : Budget | Prévisions remises à 0 au 1er du mois | livrée v5.56 | 2026-08-24 |
| 10 | Outils : Budget | Écran « Mon compte » : uniquement les prévisions, aucune dépense | livrée v5.56 | 2026-08-24 |
| 11 | Outils : Budget | Modifier un montant prévu depuis une case ; effet limité à la période affichée, puis retour au montant habituel | livrée v5.61 | 2026-08-24 |
| 12 | Outils : Budget | Le widget « Comptes » de l'accueil ouvre l'écran prévisions/dépenses avec jauge | livrée v5.56 | 2026-08-24 |
| 13 | Outils : Budget | Retirer le bouton « Ajouter une dépense » générique ; ajout via la fiche de catégorie sans re-sélection | livrée v5.56 | 2026-08-24 |
| 14 | Outils : Budget | Récap : « Outils : Budget » = prévisions pures ; « Outils : Comptes » = prévisions − dépenses | livrée v5.56 | 2026-08-24 |
| 15 | Outils : Listes | La croix rouge supprime seulement la catégorie visée, pas tout l'outil | livrée v5.51 | 2026-08-24 |
| 16 | Outils : Listes | Écran « Ajouter une catégorie » tronqué sur mobile | livrée v5.56 | 2026-08-24 |
| 17 | Énergie | « Valider » ferme « Mon énergie maintenant » et revient directement à l'accueil | livrée v5.56 | 2026-08-24 |
| 18 | Accueil / Planning | Fond des cases de tâches du planning coloré sur toute la hauteur ; sous-tâches dépliées incluses dans la case colorée | à analyser | 2026-08-29 |
| 19 | Accueil / Planning | Fond de la case des jours de la semaine (haut du planning) pleinement coloré de la couleur choisie, pas seulement le contour | à analyser | 2026-08-29 |
| 20 | Accueil / Planning | Retirer le plier/déplier du planning et le trait gris ; taille du planning fixe, à mi-chemin pile entre replié et déplié | à analyser | 2026-08-29 |
| 21 | Accueil / Planning | Glissement des jours à l'intérieur (les jours défilent par rapport au fond de la case) + effet de grossissement sur le jour au niveau du sélecteur | à analyser | 2026-08-29 |
| 22 | Accueil / Planning | À gauche de la sélection du mois, logo planning cliquable ouvrant le planning complet en pleine page (vue semaine, cases en logos, même navigation que l'accueil) | à analyser | 2026-08-29 |

> Note : les demandes 1 à 17 ont été retirées du Google Doc par Marie le 28/08 (elles étaient toutes livrées ou écartées). Leurs lignes restent ici comme historique du traitement. État « à analyser » = pas encore passé par `/analyser_googledoc` (à faire prochaine session).

## Précisions

- **#7** — Décision reçue de Marie le 25/08 : ne rien changer, le modal « Montant total » conserve son contenu actuel. Demande close sans développement.
- **#9** — Satisfaite sans mécanisme dédié : les montants prévus sont des valeurs statiques par catégorie, recalculées à chaque affichage, sans accumulation dans le temps — il n'y a rien à remettre à zéro.
- **#11** — Décision de portée reçue le 25/08 : la modification s'applique jusqu'à la fin de la semaine (catégorie hebdomadaire) ou du mois (catégorie mensuelle) affiché ; livrée en v5.61. Parcours « Suivre ses dépenses avec Comptes » (`utiliser-comptes` rev 2) validé par Marie le 27/08 (export du 28/08).
- **#3** — Rouverte le 28/08 après un `nok` de Marie (« ça dépasse toujours »). Capture du Google Doc analysée (image4.jpg à côté de la demande 3) : les cadres « Date » et « Heure de début » débordent à droite alors que la grille d'énergie et les sélecteurs Durée respectent la marge. Cause identifiée : le `<form>` de `E21CreateTaskV2.tsx` / `E24EditTask.tsx` est un enfant flex de `<main>` sans `min-width: 0` — il ne peut donc pas rétrécir sous la largeur intrinsèque des `<input type="date">` / `<input type="time">` natifs sur mobile, et déborde `<main>`. Correctif v5.64 : `min-width: 0` ajouté au `<form>` des deux écrans. Test de non-régression sur les contraintes de largeur. À revalider par Marie sur son appareil.

## Historique des revues

- 2026-08-24 : analyse initiale du Doc (`Archives/roadmap_demandes_marie_2026-08-24.md`) — 17 demandes numérotées.
- 2026-08-28 : création de ce registre, réconciliation des états avec le code après les livraisons v5.56, v5.58, v5.60, v5.61, v5.62.
- 2026-08-28 : #3 réévaluée à partir du code et marquée `livrée v5.45` (cadre Date/Heure déjà contraint) ; à reconfirmer visuellement par Marie.
- 2026-08-28 : export de Marie du 28/08 (export_date 2026-08-28 09:42) traité — aucune perte, aucune friction nouvelle ; 2 validations (`utiliser-comptes` rev 2 le 27/08, `pastille-nouveaux-tests` le 28/08). Revue du Google Doc : inchangé depuis le 24/08, registre non modifié sur ce point.
- 2026-08-28 : export de Marie du 28/08 20:34 traité — aucune perte. 1 nouveau résultat : `cadre-date-heure-dans-l-ecran` **nok** (« ça dépasse toujours »). #3 rouverte. Capture du Doc (image4.jpg) analysée, cause identifiée (`<form>` flex sans `min-width: 0`), correctif appliqué en v5.64.
- 2026-08-29 : constaté après le déploiement v5.64 que le Google Doc avait été modifié à 23h28 le 28/08 (l'étape 0.4 de `/deploy` a été sautée par erreur). Marie a retiré 1-17 et ajouté 18-22 (toutes « Accueil / Planning »). Lignes 18-22 ajoutées au registre à l'état `à analyser`. **À faire prochaine session : `/analyser_googledoc` pour analyser 18-22 et bâtir la roadmap.**
- 2026-08-28 : re-vérification complète des 17 demandes contre le code courant (voir ancres ci-dessous). Aucun écart au moment de la revue : 16 livrées, #7 écartée. Preuves — #1 `PlanningBoard.tsx:131-149,472` (hauteur ∝ durée) ; #2 `E112Accessibility.tsx:105-138` ; #3 `E21CreateTaskV2.tsx:291-321` + `E24EditTask.tsx:250-271` ; #4-#5 `E22TaskDetail.tsx:504-513` (Modifier/Décomposer/Dupliquer/Supprimer seulement) ; #6/#8/#10 `budgetRules.ts:100,110` (`getMonComptePrevisions`, `getMontantTotal` = revenus − livrets − prévisions) ; #9 sans mécanisme (prévisions statiques) ; #11 `budgetRules.ts:41-49` (`temporary_amount`) ; #12 `E10Dashboard.tsx:223` (widget « Comptes » → `budget-account`) ; #13 `E75BudgetAccount.tsx` (plus de bouton générique) + `E73CategoryDetail.tsx:118,195` ; #14 architecture Budget/Comptes ; #15 `E61ListDetail.tsx:38,142` (`deleteListCategory`) ; #16 `E61ListDetail.tsx:179-180` (largeur contrainte) ; #17 `E31EnergyCheckIn.tsx:28` (`goTo('dashboard')`).
