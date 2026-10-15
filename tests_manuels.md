# Tests manuels en attente

## Catégories de profil et âge (ajouté le 2026-10-11)
Sur un téléphone, `npm run dev -- --host --port 5000 --strictPort`, après suppression des données : à l'onboarding, vérifier que l'écran « Votre profil » affiche les 7 cases (dont HPI) avec un bouton « ? » de définition par case, que « Je ne sais pas » décoche les autres, que « Continuer » reste grisé sans catégorie ni âge valide, et que le clavier numérique s'ouvre sur le champ âge. Ouvrir ensuite Paramètres > Profil : modifier une catégorie et l'âge, enregistrer, quitter puis revenir pour vérifier la persistance. Relire le nouveau bloc « Données de santé et âge » de l'écran de consentement (formulation à valider par l'utilisateur). Cocher « Neurotypique » : les autres catégories se décochent.

## Rattrapage du profil et renouvellement du consentement (ajouté le 2026-10-11)
Sur un appareil qui a déjà un profil (ancien format) : à l'ouverture, l'écran « Votre profil » apparaît avant l'accueil et reste affiché à chaque ouverture tant qu'il n'est pas rempli. Sur un appareil qui avait accepté le partage avant ce changement (tous les utilisateurs, administrateurs ou non) : l'écran de consentement apparaît une seule fois, avant le profil. Accepter puis rouvrir l'appli : il ne revient pas. Refuser : le partage est retiré (Paramètres > Vie privée) et l'écran ne revient pas non plus. À contrôler aussi sur le serveur de dev sur le port 5000 : tout appareil dont le partage était accepté y déclenche ces écrans dès maintenant.

## Sauvegarde chiffrée des fichiers sensibles (ajouté le 2026-10-10)
Lancer dans un terminal, depuis la racine : `python scripts/backup_sensitive.py --setup` (deux mots de passe distincts, à ranger dans un gestionnaire), puis `--upload` et `--check`. Attendu : « Copie chiffrée OK » puis « Contrôle OK » (108 fichiers environ), noms illisibles dans `BackUps/Appli_TSA_SDI_TDAH_chiffre` sur le Drive.

## Sauvegarde Drive en attente (manifeste du 2026-10-15)
Lancer dans un terminal normal, depuis la racine : `python claude-vibecoding-kit/backup_project.py . --upload`. Retirer cette section après confirmation de l'upload.

## Rendu mobile des correctifs du 2026-10-10 (ajouté le 2026-10-10)
Sur un téléphone, `npm run dev -- --host` : sur l'Accueil, déplier les outils et vérifier que le bouton « ⋯ » des petites cartes ne recouvre pas le nom ; ouvrir une nouvelle tâche et vérifier que les pavés de chiffres de l'heure et de la durée tiennent dans l'écran ; vérifier les flèches précédent/suivant et « Aujourd'hui » du planning.

## Livret : provenance d'un dépôt (ajouté le 2026-10-10)
Dans Budget > un livret : déposer une somme en choisissant « Provenance » (montant total ou une autre catégorie), vérifier que le solde de la provenance baisse du même montant, puis déplier les mouvements du livret et contrôler leur affichage sur téléphone.

## Dépense liée à une tâche (ajouté le 2026-10-10)
Créer une tâche avec la case « Dépense » cochée et la planifier ; la cocher dans le planning : la fenêtre « Dépense » s'ouvre. Enregistrer un montant et une catégorie, puis vérifier la dépense dans Budget. Refaire avec « Terminer sans dépense ». Contrôler l'affichage de la fenêtre sur téléphone.

## Rendu mobile des retours du 2026-10-12 (ajouté le 2026-10-14)
Sur un iPhone (Safari), `npm run dev -- --host --port 5000 --strictPort` : sur l'Accueil, vérifier que trois cartes d'outils dont un nom long (ex. « Administratif ») tiennent dans la largeur et que la césure du mot est correcte (non vérifié : le Chromium de test n'a pas de dictionnaire français) ; dans le planning de la semaine, vérifier le défilement vertical commun avec les jours fixés en haut.
