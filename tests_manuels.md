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

## Bot Discord — file d'attente des commandes en conditions réelles

Ajouté le 2026-09-02 (commit `2b75711`). `bot.py` empile désormais dans `commands.json` → `queue[]`
tout message reçu pendant que Claude traite déjà une commande, et `boucle_polling` promeut la file
en FIFO dès le retour à `idle`. Testé seulement en isolation (script hors ligne), pas encore avec
le vrai bot et Discord.

À vérifier lors d'une session `/discord_loop` active :
- envoyer 2-3 messages au bot pendant qu'il traite une commande longue → chacun reçoit
  « 📥 En file d'attente (N) », aucun n'est rejeté ;
- à la fin du traitement, les messages sont repris un par un, dans l'ordre d'arrivée, avec le bon
  auteur affiché (`[RESTREINT Rayonne Toi]` / `[ADMIN …]`) ;
- `!ping` / `!help` répondent toujours immédiatement même file non vide ;
- cas dégradé : tuer la session pendant un traitement → `commands.json` reste en `processing`,
  la file se remplit sans être promue (angle mort connu, cf. question ouverte P3 de `signals.md`).
