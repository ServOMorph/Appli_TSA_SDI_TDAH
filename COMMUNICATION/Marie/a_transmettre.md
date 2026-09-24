# À transmettre à Marie

Ce fichier est la source unique des **commentaires de livraison** en attente pour Marie. Il est rédigé simplement, sans détails techniques. À chaque déploiement, son contenu est figé dans `livraisons/vX.Y.md`, publié sur Drive et repris dans le message WhatsApp.

Ce fichier ne contient jamais de liste de tests : l'écran « Tests à faire » n'existe plus. Un problème se signale désormais directement via « Mes retours » ; la validation se fait dans la réponse reçue là-bas, pas via une liste séparée.

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

## Création d'une tâche : les champs se replient comme sur la fiche

Sur l'écran de création d'une tâche (bouton « Ajouter une tâche »), les champs Icône, Couleur, Date, Horaire et Coût en énergie sont maintenant repliés par défaut : ils s'affichent en petites cases, comme sur la fiche d'une tâche déjà créée. Toucher une case la déplie, choisir une valeur la replie aussitôt.

## Mes retours : réponse directe dans l'application

Un retour envoyé depuis l'application ouvre maintenant un vrai échange : une fois le problème corrigé, la réponse arrive directement dans « Mes retours », en touchant le retour concerné. Il suffit de la lire et de toucher « Valider » si c'est bon, ou d'écrire un nouveau message si ce n'est pas encore satisfaisant. L'icône pour y accéder est maintenant en haut à droite de l'écran d'accueil (elle a remplacé « Tests à faire », qui n'existe plus) ; un petit cercle rouge apparaît dessus quand une réponse n'a pas encore été lue.

Si un message que vous envoyez dans cet échange n'arrive pas à partir, il est maintenant marqué « Échec d'envoi » directement dans la conversation, comme c'était déjà le cas pour le tout premier retour.

Le bouton « Valider » n'apparaît plus tant que votre retour n'a pas fini de partir (pas de réseau, ou partage désactivé) : un message indique qu'il faut attendre l'envoi avant de pouvoir le clore.

## Nouveautés : nouvel emplacement

Le bouton « Nouveautés », qui annonçait les derniers changements, a été déplacé sur l'écran « Mes retours » (il n'était plus visible nulle part depuis le retrait de « Tests à faire »). Un petit point rouge y apparaît tant qu'il y a du nouveau à lire.

## Sauvegarde autonome de vos données

Pour sauvegarder vos données vous-même : Paramètres > Export et import > « Exporter en JSON ». Le fichier téléchargé contient vos tâches, listes, budget et réglages ; il ne contient pas l'historique de vos retours déjà envoyés au développeur (ce sont des données de test, pas des données à restaurer).

## Synchronisation manuelle depuis Paramètres

Dans Paramètres, un bouton « Synchroniser maintenant » permet d'envoyer vos données de test tout de suite, sans attendre l'envoi automatique. Si l'envoi échoue, un message l'indique clairement.

## Le repère d'écran ne bloque plus les boutons

Le petit repère affiché en haut à droite de chaque écran ne gêne plus les boutons ou zones qui se trouvent juste dessous.

## Votre identifiant pendant l’accueil

Pendant la première ouverture de l'application, juste après le choix sur le partage des données, un écran permet maintenant d'indiquer votre identifiant. Pourriez-vous y écrire « marie » ? Cela nous aide à bien suivre vos données de notre côté. Ce code peut aussi être renseigné ou modifié à tout moment dans Paramètres > Profil.

## Tâches et fiche de tâche

Les sous-tâches ajoutées à la création d'une tâche répétée apparaissent maintenant sur tous les
jours concernés, pas seulement sur le premier.

Sur la fiche d'une tâche, l'icône et la couleur s'affichent maintenant normalement (avant, un texte
brut illisible apparaissait). La durée est maintenant enregistrée dès la création. La fiche permet
aussi de définir ou modifier la récurrence directement, sans repasser par la création.

Le bouton « Annuler » lors de la création d'une tâche revient maintenant à l'écran d'où vous veniez,
comme le fait déjà « Retour ».

## Accueil

Les outils restent maintenant visibles même en mode surcharge.

Une tâche se coche maintenant automatiquement quand toutes ses sous-tâches sont cochées.

Un nouveau repère affiche l'énergie totale planifiée pour la journée affichée.

Le bandeau des jours reste maintenant centré à l'écran : ce sont les jours qui défilent autour,
plutôt que la case sélectionnée qui se déplace.

## Mon énergie maintenant

Nouveau réglage dans Paramètres > Accessibilité : « Afficher mon énergie à chaque connexion ».
Activé, l'écran s'affiche à chaque ouverture de l'application et à chaque retour au premier plan.
Désactivé (réglage par défaut), rien ne change.

## Planning de la semaine

Chaque case affiche maintenant le nom complet de la tâche et sa couleur, et le planning occupe
toute la page.

## Livrets

Un livret permet maintenant de créer des catégories à l'intérieur : chacune a son propre sous-total,
qui s'ajoute au total du livret. Un mouvement peut aussi rester hors catégorie, il compte alors
seulement dans le total du livret.

## Mes retours

Le bouton « Nouveau retour » est remonté en haut de l'écran.

## Nouvel outil « Routine »

Un nouvel outil « Routine » est disponible depuis l'accueil (bouton « Ajouter un outil »). Vous
pouvez créer une routine (par exemple « Routine du matin »), lui donner un nom, une couleur, puis
lui ajouter des étapes dans l'ordre que vous voulez (avec une durée optionnelle pour chacune).

Vous planifiez ensuite la routine sur les jours de la semaine de votre choix, chacun avec son
propre horaire (un pavé numérique permet de saisir l'heure). Les jours planifiés apparaissent alors
dans votre planning, avec le nom de la routine et son horaire.

En touchant la routine dans le planning, un écran plein écran s'ouvre avec la liste de ses étapes
pour ce jour-là : cochez-les une par une. Une étape peut aussi être dépliée pour lui ajouter des
sous-tâches, comme pour une tâche classique. Une fois toutes les étapes cochées, la routine
apparaît comme terminée dans le planning.

Vous pouvez aussi modifier les étapes d'un seul jour en particulier, sans toucher aux autres jours :
depuis cet écran plein écran, le bouton « Modifier ce jour » permet de changer, ajouter, supprimer
ou réordonner (par glisser-déposer) les étapes propres à ce jour-là uniquement. Un bouton « Revenir
à la version commune » annule ce changement et remet les étapes habituelles.

## Adresse de l'application changée

L'adresse a changé : `https://appli-marie.netlify.app/`. Mettez à jour le raccourci sur votre écran d'accueil avec cette nouvelle adresse ; l'ancienne ne fonctionnera plus.
