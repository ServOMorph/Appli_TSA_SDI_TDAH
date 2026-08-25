# À transmettre à Marie

Ce fichier est la source unique des messages en attente pour Marie. Il est rédigé simplement, sans détails techniques. À chaque déploiement, son contenu est figé dans `livraisons/vX.Y.md`, publié sur Drive et repris dans le message WhatsApp.

## Changements livrés

### Tâches

#4, #5 — Le bouton « Terminer » a été retiré de la fiche d'une tâche. Pour terminer une tâche planifiée, coche-la directement dans le planning. Les boutons « Modifier », « Décomposer », « Dupliquer » et « Supprimer » restent disponibles.

### Budget et Comptes

#6, #8, #9, #10, #12, #14 — Le Budget est repassé sur les montants prévus plutôt que les dépenses déjà faites : « Montant total » et « Mon compte » reflètent ce que tu as prévu de dépenser. « Mon compte » affiche les prévisions ; le suivi avec dépenses et jauge s'appelle maintenant « Comptes » et s'ouvre depuis l'accueil.

Le reset automatique des prévisions au 1er du mois n'a pas été ajouté : les prévisions ne bougent plus seules, donc il n'y a rien à remettre à zéro.

#13 — Sur « Comptes », le bouton « Ajouter une dépense » indépendant a été retiré. Pour ajouter une dépense, touche une sous-catégorie, puis « Ajouter une dépense » sur sa fiche : la catégorie est déjà choisie.

### Listes

#16 — Sur téléphone, quand tu ajoutes une catégorie dans une liste, le champ et les boutons restent visibles même avec le clavier ouvert.

### Énergie

#17 — Le badge énergie de l’accueil ouvre directement l’écran « Mon énergie maintenant ». Après avoir choisi ton énergie et touché « Valider », tu reviens directement à l’accueil.

### Outils

Le choix de couleur des outils est maintenant dans Paramètres > Accessibilité, juste après « Couleur d’ambiance ». Il n’apparaît plus sur les cartes d’outils.

## Tests à refaire

- Tester le menu simplifié d'une fiche de tâche.
- Tester « Utiliser le budget » et « Utiliser Comptes ».
- Sur téléphone, ajouter une catégorie dans une liste avec le clavier ouvert.
- Depuis une fiche de tâche, vérifier que « Terminer » n’apparaît plus et terminer une tâche planifiée depuis le planning.
- Dans Paramètres > Accessibilité, choisir puis retirer une couleur pour un outil.
- Toucher le badge énergie de l’accueil, choisir une valeur et vérifier le retour direct à l’accueil après validation.

## Décisions reçues

#7 — Le contenu de « Montant total » ne change pas.

#11 — Une modification de montant prévu sur une catégorie doit s'appliquer uniquement jusqu'à la fin de la semaine de la catégorie sélectionnée.

## Questions où nous avons besoin de ton choix

#11 — Cette modification temporaire doit-elle concerner seulement les catégories hebdomadaires ? Pour les catégories mensuelles, le comportement n'est pas défini : nous avons besoin de ton choix avant de le développer.

## Retour d'export déjà corrigé

Le retour « je ne trouve pas le libellé Couleur » a été pris en compte : le contrôle de couleur est désormais dans Paramètres > Accessibilité, après « Couleur d’ambiance ». Le test correspondant est à refaire.
