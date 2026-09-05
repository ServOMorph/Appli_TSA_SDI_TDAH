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

## Hooks de zone `on_start.md`/`on_close.md` — jamais exercés en réel

Ajouté le 2026-09-05. `start.md`/`close.md` chargent désormais `<dossier>/_contexte/on_start.md`
et `on_close.md` s'ils existent (étapes 4-ter/6-bis et 2-ter/11bis). Fichiers créés pour `discord`
(relance/arrêt de `bot.py` via `bot_manager.py`, enchaînement `/discord_loop`) et pour la racine
(snapshot Supabase, backup Drive) — jamais exercés par un `/start`/`/close` réel depuis leur
création.

À vérifier au prochain `/start discord` puis `/close discord` :
- `/start discord` relance `bot.py` proprement (`bot_manager.py restart`, ancien PID tué) puis
  enchaîne `/discord_loop` automatiquement ;
- `/close discord` arrête `bot.py` (`bot_manager.py stop`) ;
- un échec de l'un ou l'autre reste non bloquant (message affiché, session poursuit).

Racine : hook `on_start.md` (Pré-synthèse, snapshot Supabase) et hook `on_close.md` (Pré-synthèse
+ Fin, snapshot + backup Drive) désormais exercés par un `/start` puis un `/close` réels de la
zone racine (session du 2026-09-06) — les deux échecs possibles restent non bloquants comme prévu.
Reste à vérifier côté `discord` : `/start discord` (relance `bot_manager.py restart` + enchaînement
`/discord_loop`) et `/close discord` (`bot_manager.py stop`), jamais exercés.

