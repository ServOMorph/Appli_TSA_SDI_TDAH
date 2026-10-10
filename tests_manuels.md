# Tests manuels en attente

## Sauvegarde chiffrée des fichiers sensibles (ajouté le 2026-10-10)
Lancer dans un terminal, depuis la racine : `python scripts/backup_sensitive.py --setup` (deux mots de passe distincts, à ranger dans un gestionnaire), puis `--upload` et `--check`. Attendu : « Copie chiffrée OK » puis « Contrôle OK » (108 fichiers environ), noms illisibles dans `BackUps/Appli_TSA_SDI_TDAH_chiffre` sur le Drive.

## Sauvegarde Drive en attente (manifeste du 2026-10-10)
Lancer dans un terminal normal, depuis la racine : `python claude-vibecoding-kit/backup_project.py . --upload`. Retirer cette section après confirmation de l'upload.

## Rendu mobile des correctifs du 2026-10-10 (ajouté le 2026-10-10)
Sur un téléphone, `npm run dev -- --host` : sur l'Accueil, déplier les outils et vérifier que le bouton « ⋯ » des petites cartes ne recouvre pas le nom ; ouvrir une nouvelle tâche et vérifier que les pavés de chiffres de l'heure et de la durée tiennent dans l'écran ; vérifier les flèches précédent/suivant et « Aujourd'hui » du planning.

## Livret : provenance d'un dépôt (ajouté le 2026-10-10)
Dans Budget > un livret : déposer une somme en choisissant « Provenance » (montant total ou une autre catégorie), vérifier que le solde de la provenance baisse du même montant, puis déplier les mouvements du livret et contrôler leur affichage sur téléphone.

## Dépense liée à une tâche (ajouté le 2026-10-10)
Créer une tâche avec la case « Dépense » cochée et la planifier ; la cocher dans le planning : la fenêtre « Dépense » s'ouvre. Enregistrer un montant et une catégorie, puis vérifier la dépense dans Budget. Refaire avec « Terminer sans dépense ». Contrôler l'affichage de la fenêtre sur téléphone.
