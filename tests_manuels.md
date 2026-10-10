# Tests manuels en attente

## Sauvegarde chiffrée des fichiers sensibles (ajouté le 2026-10-10)
Lancer dans un terminal, depuis la racine : `python scripts/backup_sensitive.py --setup` (deux mots de passe distincts, à ranger dans un gestionnaire), puis `--upload` et `--check`. Attendu : « Copie chiffrée OK » puis « Contrôle OK » (108 fichiers environ), noms illisibles dans `BackUps/Appli_TSA_SDI_TDAH_chiffre` sur le Drive.
