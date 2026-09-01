# Tests manuels développeur en attente

File d'attente des contrôles manuels non validés, réservés au développeur (fichiers locaux,
détails d'implémentation, régressions de protocole). Après validation d'un test, supprimer
immédiatement sa section. Quand la file est vide, vider intégralement ce fichier.

## SAV Marie branchée dans /close (étape 2) — chemin « écriture réelle »

Ajouté le 2026-09-01. L'étape 2 de `.claude/commands/close.md` lance désormais
`scripts/backup_marie_snapshot.py` en fin de session, comme l'étape 4 de `/start` le fait en début.
Elle a été exercée dès son ajout, mais seulement sur le chemin « Deja sauvegarde » : Marie n'avait
pas resynchronisé entre le `/start` et le `/close` de cette session.

À vérifier au prochain `/close` suivant une resynchronisation de Marie :
- une nouvelle sauvegarde est bien écrite dans `donnees_marie/` depuis `/close`, pas seulement
  depuis `/start` ;
- l'échec éventuel reste non bloquant : la clôture se poursuit et va jusqu'au commit ;
- le contenu de `.env` et celui du snapshot ne sont jamais affichés.

Note : le point « un échec est signalé en une ligne » ne fait plus partie de ce test — il est
mesuré comme non tenu (traceback brut sur `URLError`) et traité par la Phase 1 de
`roadmap_sav_snapshot_marie.md`.
