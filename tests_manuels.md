# Tests manuels en attente

Phase V5-1 — navigation et accueil fusionné. À valider sur appareil tactile.

## 101 — Nav basse à 4 éléments (N1)
La barre du bas ne contient plus que : Réception, Accueil, Paramètres, « + ».
Les onglets Outils, Planning et Listes ont disparu. Chaque élément mène au bon écran.
La pastille rouge apparaît sur Réception quand la boîte de réception contient des tâches.

## 102 — Accueil replié (E19, Q8)
À l'ouverture, l'accueil affiche : barre du haut, planning autour de l'heure courante
(6 créneaux, le créneau courant est teinté), poignée « Déplier », Tâche du jour, zone Outils.
Vérifier que le créneau courant correspond bien à l'heure réelle.

## 103 — Dépliement et repliement (E18)
Appuyer sur la poignée « Déplier » : le planning occupe l'écran entier et défile,
la poignée passe au-dessus du planning et affiche « Replier », Tâche du jour et la zone
Outils disparaissent. Appuyer sur « Replier » : retour à l'état replié.

## 104 — Énergie planifiée / disponible (E14, Q1)
La pastille d'énergie de la barre du haut affiche deux nombres « planifié / dispo ».
Planifier une tâche avec un coût en énergie et vérifier que le premier nombre augmente.
Terminer la tâche et vérifier qu'il redescend.

## 105 — Pastille de surcharge (E21)
Hors surcharge : la pastille est claire et son appui ouvre la modale explicative.
En surcharge : la pastille est intensifiée et son appui ouvre directement le centre
de récupération.

## 106 — Zone Outils provisoire (E24)
Depuis l'accueil replié, les entrées « Outils » et « Listes » ouvrent bien leurs écrans.
Vérifier qu'aucun écran n'est devenu inatteignable : Outils, Todo, Budget, Listes,
détail de liste, boîte de réception, paramètres, ressources, énergie, récupération.

## 107 — Absence de glisser-déposer sur le planning (Q10)
Un appui long sur une tâche planifiée ne la déplace plus et ne sélectionne plus le texte.
Le déplacement passe uniquement par l'appui sur la tâche puis « Déplacer ».

## 108 — Flux entrants vers le planning
Depuis la boîte de réception, la création de tâche, la fiche d'une tâche et l'écran
Décomposer, l'action « Planifier » ouvre bien l'accueil en état déplié, bannière visible,
et la pose fonctionne. Le retour ramène à l'écran d'origine.

## 109 — Report en surcharge
En surcharge, le bouton « Reporter » d'une tâche du jour bascule le planning sur le
lendemain avec la bannière de déplacement. Depuis l'accueil replié, le report déplie
automatiquement le planning.
