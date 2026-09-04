# Tests manuels développeur en attente

File d'attente des contrôles manuels non validés, réservés au développeur (fichiers locaux,
détails d'implémentation, régressions de protocole). Après validation d'un test, supprimer
immédiatement sa section. Quand la file est vide, vider intégralement ce fichier.

Un titre de section marqué `[discord-auto]` désigne un test dont la condition se vérifie
d'elle-même au fil de l'usage normal de `/discord_loop`, sans que quiconque ait besoin de la
provoquer — la session `discord` le valide et supprime la section dès qu'elle observe la
condition décrite (`.claude/commands/discord_loop.md` § Tests manuels délégués). Un sous-point
annoté « (hors délégation, à provoquer manuellement) » à l'intérieur d'une section `[discord-auto]`
reste un test dev classique, jamais validé passivement. Ajouter un futur test `[discord-auto]` ne
demande d'éditer que ce fichier — jamais `discord_loop.md`.

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

## Bot Discord — file d'attente des commandes en conditions réelles [discord-auto]

Ajouté le 2026-09-02 (commit `2b75711`). `bot.py` empile désormais dans `commands.json` → `queue[]`
tout message reçu pendant que Claude traite déjà une commande, et `boucle_polling` promeut la file
en FIFO dès le retour à `idle`. Testé seulement en isolation (script hors ligne), pas encore avec
le vrai bot et Discord.

À observer au fil de l'usage de `/discord_loop` :
- 2-3 messages reçus pendant un traitement en cours → chacun reçoit « 📥 En file d'attente (N) »,
  aucun n'est rejeté ; à la fin du traitement, repris un par un dans l'ordre d'arrivée, avec le bon
  auteur affiché (`[RESTREINT Rayonne Toi]` / `[ADMIN …]`) ;
- `!ping` / `!help` répondent toujours immédiatement même file non vide ;
- cas dégradé (hors délégation, à provoquer manuellement) : tuer la session pendant un traitement
  → `commands.json` reste en `processing`, la file se remplit sans être promue (angle mort connu,
  cf. question ouverte P3 de `signals.md`).

## Veille /discord_loop en tâche de fond — `wait` à timeout paramétrable [discord-auto]

Ajouté le 2026-09-03. `discord_loop.py wait` accepte un timeout optionnel en argument
(`wait [secondes]`, défaut 110). `.claude/commands/discord_loop.md` étape 3a demande désormais
`wait 3600` lancé en `run_in_background`.

À observer au fil de l'usage de `/discord_loop` :
- `wait 3600` en tâche de fond ne rend pas la main tant qu'aucun message n'arrive, et sort
  sous ~1 s à la réception d'un message Discord (commande affichée, `commands.json` →
  `processing`) ;
- au bout d'une heure sans message : sortie `TIMEOUT`, code 1, la boucle relance proprement ;
- un `/close` ne déclenche aucune notification Discord.

`wait` sans argument garde le comportement d'origine (cycle ~110 s) — jamais appelé ainsi par
`discord_loop.md` en usage normal (toujours `wait 3600`), donc non observable passivement
(hors délégation, à provoquer manuellement).
