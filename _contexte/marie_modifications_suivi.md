# Suivi des modifications demandées par Marie

Registre durable du traitement des demandes inscrites par Marie dans son Google Doc « Modifications ».
Source de vérité du suivi Marie, indépendante des roadmaps (qui sont une vue de travail éphémère,
archivée après livraison).

- Google Doc : `https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`
- Dernière revue du Doc : 2026-08-24 (date de modification du Doc au moment de l'analyse)
- Dernière mise à jour de ce registre : 2026-08-28 (réévaluation de #3)

États autorisés : `livrée vX.Y` · `en attente` · `en cours <roadmap>` · `écartée : <motif>`.

| N° | Catégorie | Demande (résumé) | État | Revue le |
| --- | --- | --- | --- | --- |
| 1 | Accueil / Planning | Hauteur de case proportionnelle à la durée de la tâche | livrée v5.45 | 2026-08-24 |
| 2 | Accueil / Planning | Couleur des cases outils réglable outil par outil, depuis Paramètres > Accessibilité après « Couleur d'ambiance » | livrée v5.58 | 2026-08-24 |
| 3 | Tâches | Le cadre Date/Heure déborde à droite ; marges à équilibrer | livrée v5.45 | 2026-08-28 |
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

## Précisions

- **#7** — Décision reçue de Marie le 25/08 : ne rien changer, le modal « Montant total » conserve son contenu actuel. Demande close sans développement.
- **#9** — Satisfaite sans mécanisme dédié : les montants prévus sont des valeurs statiques par catégorie, recalculées à chaque affichage, sans accumulation dans le temps — il n'y a rien à remettre à zéro.
- **#11** — Décision de portée reçue le 25/08 : la modification s'applique jusqu'à la fin de la semaine (catégorie hebdomadaire) ou du mois (catégorie mensuelle) affiché ; livrée en v5.61, parcours « Suivre ses dépenses avec Comptes » encore à rejouer par Marie.
- **#3** — Réévaluée le 28/08 : les formulaires de tâche (création `E21CreateTaskV2.tsx`, modification `E24EditTask.tsx`) contraignent déjà le cadre Date/Heure (padding symétrique, `box-sizing: border-box`, `width: 100%`, `min-width: 0`, `max-width: 100%` sur les champs). Correctif de largeur introduit en v5.45. Marquée `livrée v5.45` sur décision de l'utilisateur ; reste à reconfirmer visuellement par Marie. Si le débordement persiste sur son appareil, rouvrir avec une capture récente (rendu natif des sélecteurs date/heure).

## Historique des revues

- 2026-08-24 : analyse initiale du Doc (`Archives/roadmap_demandes_marie_2026-08-24.md`) — 17 demandes numérotées.
- 2026-08-28 : création de ce registre, réconciliation des états avec le code après les livraisons v5.56, v5.58, v5.60, v5.61, v5.62.
- 2026-08-28 : #3 réévaluée à partir du code et marquée `livrée v5.45` (cadre Date/Heure déjà contraint) ; à reconfirmer visuellement par Marie.
