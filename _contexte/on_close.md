# Hooks /close — zone Appli_TSA_SDI_TDAH

## Pré-synthèse

Sauvegarder le dernier snapshot Supabase de Marie avant de produire la synthèse (étape 3) :
```bash
( set -a; . ./.env; set +a; python scripts/backup_marie_snapshot.py )
```
Non bloquant — en cas d'échec (hors ligne, Supabase indisponible), le signaler en une ligne et
poursuivre la clôture. Symétrique du hook `/start` : sauvegarder aussi en fin de session réduit la
fenêtre pendant laquelle une perte de données locale chez Marie, suivie d'une resynchronisation,
écraserait le dernier bon snapshot côté Supabase — le schéma fait un `upsert` d'une ligne unique par
`device_id`, sans aucun historique. Le script est idempotent et écrit dans `donnees_marie/`
(gitignoré : sans effet sur le commit de l'étape 10). Ne jamais afficher le contenu de `.env` ni
celui d'un snapshot (données personnelles de Marie).

## Fin

Mettre à jour le manifeste des fichiers absents de la branche GitHub suivie puis les copier vers
Drive :
```bash
git fetch --quiet
python claude-vibecoding-kit/backup_project.py . --refresh-list --upload
```
Afficher le nombre de fichiers et le résultat de la copie dans le bilan. La liste comprend les
fichiers privés/ignorés et les différences avec la branche publique, y compris les commits locaux
non publiés. Cette sauvegarde est automatique ; une erreur rclone est non bloquante mais doit être
signalée. Le script utilise `rclone copy` et ne supprime aucun fichier distant. Les dépendances et
artefacts régénérables restent exclus.

Cette section s'exécute après l'étape 14 (`git push`) et **même si ce push a échoué** : la
sauvegarde Drive ne dépend pas du push. Le manifeste `claude-vibecoding-kit/rclone_backup_files.txt`
est réécrit à chaque passage ; il est gitignoré (aucun résidu à committer, pas de signalement à
l'étape 15).
