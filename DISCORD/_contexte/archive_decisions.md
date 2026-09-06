# Décisions archivées — discord

Entrées retirées de `contexte.md` § Décisions structurantes (limite 10, append only). Ordre chronologique conservé.

- 2026-09-02 : Initialisation du protocole vibecoding.
- 2026-09-02 : L'agent DISCORD est l'unique passerelle entrée/sortie Discord. Les autres agents déposent dans `gateway/outbox/` via `gateway.enqueue`, lisent leurs réponses via `gateway.poll`/`ack`. Appels directs (`message_marie.py` CLI, `claude_bridge`, API REST, `queue.json`) interdits.
- 2026-09-02 : Canal unique vers Marie = Discord via la gateway ; bridge ROBERTO relégué en secours/vocal. Identité « Rayonne Toi » (id 1368654289584656394) confirmée = Marie.
- 2026-09-03 : Veille `/discord_loop` en tâche de fond — `discord_loop.py wait` prend un timeout en argument, la boucle appelle `wait 3600` via `run_in_background`. Coût : un réveil de modèle par message reçu + un de sécurité par heure. Pas de notification Discord au `/close`.
