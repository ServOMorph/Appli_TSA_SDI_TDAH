# Tests manuels en attente

## Catégories de profil et âge : retest après correction (ajouté le 2026-10-15)
Le reste du test est validé. Sur le serveur de dev (port 5000), à l'écran « Votre profil » ou dans Paramètres > Profil : cocher « SDI » puis « Avec DI » (SDI se décoche), puis l'inverse (Avec DI se décoche) ; TSA et TDAH restent cochés et la sélection persiste après enregistrement.
## Sauvegarde chiffrée des fichiers sensibles (ajouté le 2026-10-10)
Lancer dans un terminal, depuis la racine : `python scripts/backup_sensitive.py --setup` (deux mots de passe distincts, à ranger dans un gestionnaire), puis `--upload` et `--check`. Attendu : « Copie chiffrée OK » puis « Contrôle OK » (108 fichiers environ), noms illisibles dans `BackUps/Appli_TSA_SDI_TDAH_chiffre` sur le Drive.
