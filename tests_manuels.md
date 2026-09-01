# Tests manuels développeur en attente

File d'attente des contrôles manuels non validés, réservés au développeur (fichiers locaux,
détails d'implémentation, régressions de protocole). Après validation d'un test, supprimer
immédiatement sa section. Quand la file est vide, vider intégralement ce fichier.

## SAV Marie branchée dans /start (étape 4)

Ajouté le 2026-09-01. `scripts/backup_marie_snapshot.py` a été exécuté à la main avec succès
(sauvegarde `donnees_marie/snapshot-supabase-192f2411-2026-09-01-1526h26.json` produite), mais
son déclenchement automatique via l'étape 4 de `.claude/commands/start.md` n'a pas encore été
exercé en conditions réelles.

À vérifier au prochain `/start` sur la racine du projet :
- l'étape 4 lance bien la commande `( set -a; . ./.env; set +a; python scripts/backup_marie_snapshot.py )` ;
- une nouvelle sauvegarde apparaît dans `donnees_marie/` si Marie a resynchronisé depuis la dernière,
  sinon le script affiche « Deja sauvegarde » sans erreur ;
- un échec (hors ligne, Supabase indisponible) est signalé en une ligne et ne bloque pas `/start` ;
- le contenu de `.env` n'est jamais affiché.
