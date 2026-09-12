# À transmettre à Marie

Ce fichier est la source unique des **commentaires de livraison** en attente pour Marie. Il est rédigé simplement, sans détails techniques. À chaque déploiement, son contenu est figé dans `livraisons/vX.Y.md`, publié sur Drive et repris dans le message WhatsApp.

Ce fichier ne contient jamais de liste de tests : tous les tests que Marie doit refaire vivent dans l'écran « Tests à faire » de l'appli.

## Retours annotés — envoi activé

Le socle serveur qui manquait pour l'envoi des retours (écran « Mes retours ») a été mis en place le 6 septembre 2026. Les retours saisis dans l'application peuvent maintenant partir. Si un retour affiche encore « Échec d'envoi », appuyer sur « Relancer ».

Un envoi qui n'aboutit pas (réseau coupé en cours de route) s'arrête maintenant tout seul au bout de 30 secondes et repasse en « Échec d'envoi », au lieu de rester bloqué. « Relancer » repart alors sans renvoyer deux fois la même image.

Si le partage des données est désactivé (Paramètres > Vie privée), les retours ne peuvent pas partir : ils restent maintenant marqués « En attente d'activation du partage », avec un bouton pour ouvrir directement l'écran Vie privée, au lieu d'un « Échec d'envoi » sans explication. Réactiver le partage envoie aussitôt les retours en attente.

## Retour annoté — le crayon est devenu optionnel

Sur l'écran de saisie d'un retour, le mode dessin au crayon n'est plus actif d'emblée : il faut toucher « Annoter l'image » pour entourer quelque chose, puis « Terminer l'annotation ». On peut ainsi faire défiler la capture sans tracer de trait par accident. « Annuler le trait » et « Effacer les traits » restent disponibles.

## Planning et séries de tâches

Les sous-tâches restent maintenant dans la carte de leur tâche sur le planning. L’heure de fin apparaît après la dernière sous-tâche.

Les nouvelles tâches répétées ne créent plus de dates trop loin dans le futur.

## Ajout d’une tâche depuis la Réception

Toucher « Ajouter une tâche » depuis la Réception ne fait plus zoomer la page. La correction s’applique à tous les champs de saisie de l’application.

## Sélection de couleur par catégorie

Sur la fiche d'une tâche, toucher une catégorie de couleur l'affiche maintenant sélectionnée tout de suite. Avant, il fallait revenir sur l'accueil et rouvrir la tâche pour le voir.

## Sauvegarde autonome de vos données

Pour sauvegarder vos données vous-même : Paramètres > Export et import > « Exporter en JSON ». Le fichier téléchargé contient vos tâches, listes, budget et réglages ; il ne contient pas l'historique de vos retours déjà envoyés au développeur (ce sont des données de test, pas des données à restaurer).
