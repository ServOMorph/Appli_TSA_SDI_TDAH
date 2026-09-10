# Hooks /close — zone Appli_TSA_SDI_TDAH

## Pré-synthèse

Sauvegarder le dernier snapshot Supabase de Marie avant de produire la synthèse (étape 3) :
```bash
python scripts/backup_marie_snapshot.py
```
Non bloquant — en cas d'échec (hors ligne, Supabase indisponible), le signaler en une ligne et
poursuivre la clôture. Symétrique du hook `/start` : sauvegarder aussi en fin de session réduit la
fenêtre pendant laquelle une perte de données locale chez Marie, suivie d'une resynchronisation,
écraserait le dernier bon snapshot côté Supabase — le schéma fait un `upsert` d'une ligne unique par
`device_id`, sans aucun historique. Le script lit `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` dans
l'environnement, sinon dans le `.env` à la racine (aucun sourcing shell). Il est idempotent et écrit
dans `donnees_marie/` (gitignoré : sans effet sur le commit de l'étape 10). Ne jamais afficher le
contenu de `.env` ni celui d'un snapshot (données personnelles de Marie).

## Fin

Mettre à jour le manifeste des fichiers absents de la branche GitHub suivie, **sans upload** :
```bash
git fetch --quiet
python claude-vibecoding-kit/backup_project.py . --refresh-list
```
L'upload vers Drive (`--upload`) n'est pas lancé ici : sous auto-mode, le classifieur refuse
systématiquement `rclone copy` vers un cloud (secrets dans le lot). Le manifeste est tenu à jour
pour un upload différé, à faire hors session.

Afficher dans le bilan le nombre de fichiers du manifeste, puis la commande exacte à lancer
manuellement, dans un terminal normal, depuis la racine du projet :
```
python claude-vibecoding-kit/backup_project.py . --upload
```
La liste comprend les fichiers privés/ignorés et les différences avec la branche publique, y compris
les commits locaux non publiés. `--upload` seul lit le manifeste existant, utilise `rclone copy` et
ne supprime aucun fichier distant.

Garantir la trace : si `tests_manuels.md` (racine du projet) ne contient pas déjà une section
« Sauvegarde Drive en attente », l'ajouter avec la commande ci-dessus et la date du jour ; sinon
mettre à jour la date, sans dupliquer. Son retrait suit la règle générale de `tests_manuels.md` :
supprimée après confirmation que l'upload a été effectué.

Cette section s'exécute après l'étape 14 (`git push`) et **même si ce push a échoué**. Le manifeste
`claude-vibecoding-kit/rclone_backup_files.txt` est réécrit à chaque passage ; il est gitignoré
(aucun résidu à committer, pas de signalement à l'étape 15). Non bloquant : signaler tout échec en
une ligne et poursuivre.
