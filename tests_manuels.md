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

## Gateway Discord Phase 1 — routage mécanique de tout le canal par `bot.py`

Ajouté le 2026-09-03 (`roadmap_gateway_discord_service.md` Phase 1). `bot.py` route désormais vers
`gateway.route_inbound` **tout** message du canal qui n'@-mentionne pas le bot, sans attendre une
session agent DISCORD. 38 auto-tests verts, mais le chemin réel `on_message` → gateway n'a jamais
vu de message Discord : le bot a été redémarré (PID 51768) après un `import gateway` réussi, rien
de plus. Les `print` du bot partent dans `DEVNULL` (`bot_manager.cmd_start`) : la seule preuve
observable est le fichier déposé dans `inbox/`.

À vérifier en postant dans le canal Discord, **sans taguer le bot** :
- `@design: test phase 1` → un JSON apparaît dans `gateway/inbox/design/`, `routing: "tag"`,
  `content` sans le tag, `raw_content` complet
  (`python DISCORD/discord_com/gateway.py poll --agent design`) ;
- un message quelconque sans tag ni mot-clé → `inbox/unrouted/`, `routing: "aucune"` ;
- un message avec une image jointe → le champ `attachments` porte `filename` / `url` /
  `content_type` (chemin critique : la réponse attendue de Marie est faite de 2 captures) ;
- un message @-mentionnant le bot → comportement inchangé (`commands.json`, « Bien reçu » /
  « 📥 En file d'attente »), rien dans `inbox/` ;
- ~~la réponse de Marie à la demande de captures atterrit dans `inbox/orchestrateur/` avec
  `routing: "pending"` et retire la seule entrée `20260903T042325_687674` de
  `state.pending_replies`.~~ **Confirmé en réel le 2026-09-03 17h17** : réponse de Marie
  (« 1) c'est dans la rubrique accessibilité… ») routée par `bot.py` sans session agent
  DISCORD, `gateway/inbox/orchestrateur/20260903T171703_391686`, `pending_replies` vidé.

À vérifier aussi (item 6 de la phase, corrige l'angle mort P3) : laisser `commands.json` en
`processing` avec un `timestamp` de plus de 15 min, puis `python bot_manager.py restart` →
le statut repasse `idle` et la file est promue.

## Gateway Discord Phase 2 — gardien de sortie + drain automatique par `bot.py`

Ajouté le 2026-09-03 (`roadmap_gateway_discord_service.md` Phase 2). Chaque demande outbox
porte un `status` (`pending` → `approved` | `held` | `bounced` | `failed`) ; `drain` n'envoie
que les `approved` ; `bot.py` appelle `gateway.drain()` toutes les 5 s (plus aucun `drain`
manuel). 58 auto-tests verts. `approve` / `hold` / `bounce` / `merge` et le refus d'envoi d'un
`pending` ont été exercés sur la gateway réelle sans trafic Discord ; le `drain` automatique
par le bot (PID 82188 après restart) n'a pas encore envoyé de vrai message.

À vérifier lors d'une session `/discord_loop` active, bot tournant :
- `enqueue` d'une demande propre (`--to channel`, corps figé) → elle reste en `pending`,
  `bot.py` ne l'envoie pas ; après `gateway.py approve --id <id>`, elle part sur Discord dans
  les ~5 s **sans autre intervention**, archivée dans `outbox/sent/`, tracée dans
  `logs/conversation.jsonl` (`role: GATEWAY`) ;
- `enqueue` avec un `<placeholder>` dans le corps → `gateway.py bounce --id <id> --reason
  "fond non figé"` : le fichier quitte l'outbox, rien ne part sur Discord, un JSON
  `kind: "bounce"` apparaît dans `inbox/orchestrateur/` avec `reason` et `original_body` ;
- `hold --id <id>` → la demande est ignorée par les `drain` suivants jusqu'à `approve` ;
- `merge --ids a,b` (deux `info` vers le même `--to`) → corps concaténés dans la plus
  ancienne, la seconde supprimée, `merged_from` renseigné ;
- échec d'envoi réel (couper le réseau ou un token invalide le temps d'un `drain`) → la
  demande passe `failed`, un `kind: "dead-letter"` atterrit dans `inbox/discord/`, les
  demandes suivantes de la même passe partent quand même ; `approve` sur la `failed` la
  renvoie en file.

## Veille /discord_loop en tâche de fond — `wait` à timeout paramétrable

Ajouté le 2026-09-03. `discord_loop.py wait` accepte un timeout optionnel en argument
(`wait [secondes]`, défaut 110). `.claude/commands/discord_loop.md` étape 3a demande désormais
`wait 3600` lancé en `run_in_background`.

À vérifier lors d'une session `/discord_loop` active :
- `wait 3600` en tâche de fond ne rend pas la main tant qu'aucun message n'arrive, et sort
  sous ~1 s à la réception d'un message Discord (commande affichée, `commands.json` →
  `processing`) ;
- au bout d'une heure sans message : sortie `TIMEOUT`, code 1, la boucle relance proprement ;
- `wait` sans argument garde le comportement d'origine (cycle ~110 s) ;
- un `/close` ne déclenche aucune notification Discord.
