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
Gateway Discord livrée (`DISCORD/discord_com/gateway.py` + `gateway/`) : passerelle unique entrée/sortie (`enqueue`/`drain`/`curate` en sortie, `route_inbound` + `poll`/`ack` en entrée, 19 tests verts). `message_marie.py` sous garde `--force`, `claude_bridge.py` déprécié. Bot configuré (`enabled: true`, `channel_id`) et actif (PID 79532). Veille `/discord_loop` optimisée : `wait` à timeout paramétrable lancé en tâche de fond. Adoption gateway par l'orchestrateur toujours en cours.

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-09-02 : Initialisation du protocole vibecoding.
- 2026-09-02 : L'agent DISCORD est l'unique passerelle entrée/sortie Discord. Les autres agents déposent dans `gateway/outbox/` via `gateway.enqueue`, lisent leurs réponses via `gateway.poll`/`ack`. Appels directs (`message_marie.py` CLI, `claude_bridge`, API REST, `queue.json`) interdits.
- 2026-09-02 : Canal unique vers Marie = Discord via la gateway ; bridge ROBERTO relégué en secours/vocal. Identité « Rayonne Toi » (id 1368654289584656394) confirmée = Marie.
- 2026-09-03 : Veille `/discord_loop` en tâche de fond — `discord_loop.py wait` prend un timeout en argument, la boucle appelle `wait 3600` via `run_in_background`. Coût : un réveil de modèle par message reçu + un de sécurité par heure. Pas de notification Discord au `/close`.
