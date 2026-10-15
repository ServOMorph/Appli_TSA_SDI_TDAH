# Tests manuels en attente

## Catégories de profil et âge (ajouté le 2026-10-11)
Sur un téléphone, `npm run dev -- --host --port 5000 --strictPort`, après suppression des données : à l'onboarding, vérifier que l'écran « Votre profil » affiche les 7 cases (dont HPI) avec un bouton « ? » de définition par case, que « Je ne sais pas » décoche les autres, que « Continuer » reste grisé sans catégorie ni âge valide, et que le clavier numérique s'ouvre sur le champ âge. Ouvrir ensuite Paramètres > Profil : modifier une catégorie et l'âge, enregistrer, quitter puis revenir pour vérifier la persistance. Relire le nouveau bloc « Données de santé et âge » de l'écran de consentement (formulation à valider par l'utilisateur). Cocher « Neurotypique » : les autres catégories se décochent.

## Sauvegarde chiffrée des fichiers sensibles (ajouté le 2026-10-10)
Lancer dans un terminal, depuis la racine : `python scripts/backup_sensitive.py --setup` (deux mots de passe distincts, à ranger dans un gestionnaire), puis `--upload` et `--check`. Attendu : « Copie chiffrée OK » puis « Contrôle OK » (108 fichiers environ), noms illisibles dans `BackUps/Appli_TSA_SDI_TDAH_chiffre` sur le Drive.

## Rendu mobile des correctifs du 2026-10-10 (ajouté le 2026-10-10)
Sur un téléphone, `npm run dev -- --host` : sur l'Accueil, déplier les outils et vérifier que le bouton « ⋯ » des petites cartes ne recouvre pas le nom ; ouvrir une nouvelle tâche et vérifier que les pavés de chiffres de l'heure et de la durée tiennent dans l'écran ; vérifier les flèches précédent/suivant et « Aujourd'hui » du planning.

## Livret : provenance d'un dépôt (ajouté le 2026-10-10)
Dans Budget > un livret : déposer une somme en choisissant « Provenance » (montant total ou une autre catégorie), vérifier que le solde de la provenance baisse du même montant, puis déplier les mouvements du livret et contrôler leur affichage sur téléphone. Contrôler aussi les refus de solde négatif (ajoutés le 2026-10-15) : avec un dépôt de 100 en catégorie A et un retrait de 60 dans A, la suppression du dépôt est refusée avec un message, abaisser le dépôt à 10 est bloqué, un retrait de 41 est refusé, puis supprimer d'abord le retrait permet de supprimer le dépôt.

## Dépense liée à une tâche (ajouté le 2026-10-10)
Créer une tâche avec la case « Dépense » cochée et la planifier ; la cocher dans le planning : la fenêtre « Dépense » s'ouvre. Enregistrer un montant et une catégorie, puis vérifier la dépense dans Budget. Refaire avec « Terminer sans dépense ». Contrôler l'affichage de la fenêtre sur téléphone.

## Rendu mobile des retours du 2026-10-12 (ajouté le 2026-10-14)
Sur un iPhone (Safari), `npm run dev -- --host --port 5000 --strictPort` : sur l'Accueil, vérifier que trois cartes d'outils dont un nom long (ex. « Administratif ») tiennent dans la largeur et que la césure du mot est correcte (non vérifié : le Chromium de test n'a pas de dictionnaire français) ; dans le planning de la semaine, vérifier le défilement vertical commun avec les jours fixés en haut.
