# Tests manuels en attente

## Sauvegarde chiffrée des fichiers sensibles (ajouté le 2026-10-10)
Lancer dans un terminal, depuis la racine : `python scripts/backup_sensitive.py --setup` (deux mots de passe distincts, à ranger dans un gestionnaire), puis `--upload` et `--check`. Attendu : « Copie chiffrée OK » puis « Contrôle OK » (108 fichiers environ), noms illisibles dans `BackUps/Appli_TSA_SDI_TDAH_chiffre` sur le Drive.

## Sauvegarde Drive en attente (manifeste du 2026-10-10)
Lancer dans un terminal normal, depuis la racine : `python claude-vibecoding-kit/backup_project.py . --upload`. Retirer cette section après confirmation de l'upload.

## Rendu mobile des correctifs du 2026-10-10 (ajouté le 2026-10-10)
Sur un téléphone, `npm run dev -- --host` : sur l'Accueil, déplier les outils et vérifier que le bouton « ⋯ » des petites cartes ne recouvre pas le nom ; ouvrir une nouvelle tâche et vérifier que les pavés de chiffres de l'heure et de la durée tiennent dans l'écran ; vérifier les flèches précédent/suivant et « Aujourd'hui » du planning.

## T58 en échec (e2e, retours réservés aux admins)
`e2e/10-feedback.spec.ts` attend le bouton « Signaler un retour », désormais réservé aux administrateurs (mot de passe admin). Décider comment fournir une identité admin aux tests sans y écrire le mot de passe, ou adapter le test.
