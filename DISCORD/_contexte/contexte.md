# Contexte — discord

## Objectif (immuable sauf décision explicite)
Spécialiste de l'automation et de la communication Discord : conception et maintenance du bot, scripts d'automation, intégrations (webhooks, API) et contenus de communication diffusés sur Discord pour le projet.

## Stack / contraintes techniques (stable, rarement modifié)
- Bot : template `discord_com/` du kit inséré dans `DISCORD/discord_com/` (Python, `discord.py>=2.0.0`, `python-dotenv`). `bot.py`, `bot_manager.py`, `discord_loop.py`, `claude_bridge.py`.
- Projet parent : PWA React/TypeScript/Vite, sans backend applicatif (données locales IndexedDB, synchronisation des données de test vers Supabase via scripts Python).
- Scripts utilitaires du projet en Python (`scripts/`). Délégation de tâches templated possible via Ollama (`python ollama_call.py "<prompt>"`).
- Secrets (token Discord) : jamais en dur, jamais lu par Claude, vit uniquement dans `DISCORD/discord_com/.env` (couvert par `.gitignore`). Config publique dans `DISCORD/discord_com/config_bot_discord.json` (`enabled: false` tant que non configuré).
- Configuration restante (token, Application ID, invitation OAuth2, Message Content Intent, channel_id, `pip install -r requirements.txt`) : via `/init_discord_mode` depuis le kit.
- Commande `/discord_loop` livrée dans le template sous `DISCORD/discord_com/.claude/commands/` : inactive tant que non copiée dans `.claude/commands/` à la racine du projet (décision utilisateur en attente).
- Dossiers cibles : `DISCORD/`, `scripts/`.

## État actuel (réécrit intégralement à chaque /close)
Gateway Discord opérationnelle. ONBOARD Phase 5 (canaux testeurs) : passes 1-2 livrées le 2026-09-08 (commit `a40a31d`, v5.111) — modèle « un canal Discord par testeur » (cible `testeur:<code>`, `config_bot_discord.json > channels` = registre par code + `supervision`), gate de visibilité asymétrique vert (104 tests `test_gateway.py`). Câblage local (gitignore) : `satine` → `1546945011340542022`, `supervision` → `1544665195476160512` ; `discord_member_id` de Satine à `null` (collision `MORPHEUS_USER_ID`). Passe 3 restante (brief `5079c0b`) : `bot.py` `on_message` multi-canal + routage entrant par canal + balayage `inbox/testeurs/<code>/` dans `/discord_loop`. Correctif `18abee5` : l'heuristique par mots-clés ne route plus jamais vers `inbox/discord`. `enqueue()` accepte `--reply-to-agent` depuis le 2026-09-15 (commit `826dc54`) : sans lui, la réponse à une demande `expect_reply` part vers l'agent `source`, pas forcément celui qui doit la traiter. Salutations amusantes désactivées pour Marie (`salutations_marie.json` vidé, commit `740d8d8`). En attente : photo/vidéo de Marie pour #3, section `morpheus` de `STYLE.md`, scénario « messages simultanés » pour la section `[discord-auto]` file d'attente, Phase 5 passe 3, `discord_member_id` Satine.

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-09-06 : `has_pending_reply(author_id)` route vers `inbox/<zone>/` tout message de l'auteur attendu, tagué ou non — le tag `@El Patrone#7381` n'est pas vérifié par le code. Convention humaine (utilisateur/Marie) : ce tag signifie qu'un message s'adresse au bot et attend un traitement. Un message sans tag est du trafic de canal capté par effet de bord — SAV déjà assuré par `logs/conversation.jsonl` (capture tout), à `ack` sans traitement.
- 2026-09-06 : salutation d'ouverture des messages à Marie automatisée dans `curate()` (`gateway.py`) — tirage aléatoire dans `gateway/salutations_marie.json` (10 formules, copiées du projet Roberto), remplace le fixe « Salut Poulette ! » tapé manuellement par le gardien. `STYLE.md` mis à jour en conséquence.
- 2026-09-06 : règle de jugement du gabarit de livraison (`LOOP.md` § 1) précisée après 3 bounces erronés sur la livraison v5.92 — N = nombre de parcours, les puces = numéros de modification distincts couverts, N > puces est normal (plusieurs parcours peuvent partager un numéro). Bounce seulement si N < puces.
- 2026-09-06 : modification de `.claude/commands/start.md`/`close.md`/`discord_loop.md` refusée depuis la session discord (hors périmètre `agent_role.md` — DISCORD/ et scripts/ uniquement) ; déléguée à l'orchestrateur via une note presse-papier. Reprise et implémentée : mécanisme générique de hooks `on_start.md`/`on_close.md` par zone.
- 2026-09-06 : hook `on_start.md` (zone discord) enrichi — `bot.py` géré nativement par `bot_manager.py restart` (pas de changement) ; `discord_loop.py wait` n'a pas de PID file natif (lancé par Claude via le tool Bash, pas par un manager), donc détection d'orphelin par recherche PowerShell WMI (`Get-CimInstance Win32_Process`, filtre sur la ligne de commande) plutôt que `pkill`/`ps aux` (peu fiables sous Windows) ; ajout d'un résumé de l'outbox Marie affiché avant la boucle.
- 2026-09-08 : `route_inbound()` — l'heuristique par mots-clés ne route plus jamais vers l'agent `discord` (garde `if h == "discord": h = None`). Seuls le tag `@discord:` explicite, les dead-letters et les bounces entrent dans `inbox/discord/`. `discord_loop.md` § 3b : aucun `send`/`notify` en vidant un inbox (seuls 3c et 3e postent). Corrige une réponse publique non sollicitée à un message de canal contenant « discord ». Commit `18abee5`.
- 2026-09-08 : ONBOARD Phase 5 — modèle « un canal Discord par testeur » retenu (remplace les 2 cibles fixes de `78733bd`). Cible gateway `testeur:<code>` ; `config_bot_discord.json > channels` = `{ testeurs: { <code>: { channel_id, discord_member_id } }, supervision }`. Décision Morphéus : `supervision` = canal Marie principal (fusion assumée, pas de `#supervision` dédié). Câblage local `satine`/`supervision`, `discord_member_id` Satine à `null` (collision `MORPHEUS_USER_ID`). Commit `a40a31d`, brief passe 3 `5079c0b`.
- 2026-09-15 : le routage d'une réponse à une demande `expect_reply` visait toujours l'agent
  `source` de la demande — faux quand une demande urgente est créée avec `--source discord` mais
  que c'est l'orchestrateur qui doit traiter la réponse (cas vécu le 2026-09-13, routage manuel
  nécessaire). `enqueue()` accepte désormais `--reply-to-agent <agent>` ; `route_inbound()` (ligne
  ~842) utilise `pending.get("reply_to_agent") or pending["source"]`. Commit `826dc54`.
- 2026-09-15 : sur demande explicite de l'utilisateur, salutations amusantes retirées des messages
  à Marie (`gateway/salutations_marie.json` vidé, `curate()` gère la liste vide sans crash). Un
  message part directement au tag puis au corps, sans ligne de salutation. Commit `740d8d8`.
