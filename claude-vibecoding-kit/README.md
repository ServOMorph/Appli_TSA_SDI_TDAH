# rclone_backup

Sauvegarde ciblée des fichiers absents de la branche GitHub suivie du projet vers
`rayonne_toi_drive:BackUps/Appli_TSA_SDI_TDAH/`.

`/close` met à jour `rclone_backup_files.txt` après le bilan Git final puis copie automatiquement
son contenu vers Drive. La liste inclut les fichiers privés ou ignorés par Git et les différences
avec la branche GitHub suivie, y compris les commits locaux non encore publiés.

Pour lancer une sauvegarde manuelle :

```powershell
python claude-vibecoding-kit/backup_project.py . --upload
```

Le script utilise uniquement les chemins présents dans le manifeste et exécute `rclone copy` : il
ne supprime aucun fichier sur Drive. Les fichiers supprimés, `.git`, `node_modules`, environnements
virtuels et dossiers de build sont exclus ; les données métier privées ne le sont pas.
