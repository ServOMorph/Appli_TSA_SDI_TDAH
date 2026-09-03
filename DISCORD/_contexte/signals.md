# Signals — discord   (MAJ 2026-09-03)

## Actions ouvertes
- [P1|ouvert] Adoption gateway par l'orchestrateur (hors zone discord)
  fait quand: `agent_role.md` orchestrateur + design interdisent l'écriture Discord directe, `deploy.md`/`analyser_googledoc.md` n'appellent plus message_marie.py/claude_bridge, CLAUDE.md aligné sur "canal Marie = Discord via gateway"
  réf: scratchpad message_orchestrateur.txt (livré), DISCORD/discord_com/gateway/README.md
- [P1|ouvert] Valider le chemin réel d'envoi : gateway.py drain (POST Discord réel) + réception d'une vraie réponse Marie routée vers inbox/orchestrateur/ (le bot est maintenant configuré et actif)
  fait quand: un aller-retour complet Marie observé via la gateway, pending purgé
  réf: DISCORD/discord_com/gateway.py (drain, route_inbound), tests unitaires test_gateway.py
- [P2|ouvert] `DISCORD/discord_com/bot.pid` apparaît en fichier non suivi et n'est pas gitignoré (contrairement à queue.json/commands.json) — trancher : l'ajouter au .gitignore de discord_com ou le supprimer
  fait quand: `git status --short` ne liste plus bot.pid dans DISCORD/
  réf: DISCORD/discord_com/.gitignore, signals racine (action de nettoyage d'arbre déjà tracée côté racine)

## Contexte chaud
- Bot Discord configuré et actif : `config_bot_discord.json` a `enabled: true` + `channel_id`, process `python bot.py` en cours (PID 79532, démarré 2026-09-02 19:30), `queue.json` à `idle`. La config restante via `/init_discord_mode` n'est plus nécessaire.
- Veille `/discord_loop` : `discord_loop.py wait` accepte désormais un timeout en argument ; la boucle tourne en `run_in_background` avec `wait 3600` — un réveil de modèle par message reçu + un de sécurité par heure, au lieu d'un cycle toutes les ~110 s.
- `state.json` (gitigноré) : source de vérité du `pending_reply` de la gateway. Un pending de 2 questions produit de l'orchestrateur du 2026-09-02 y était seedé ; Marie a répondu depuis (décisions 1 et 6 tranchées, cf. CHANGELOG v5.79) — vérifier l'état réel avant de s'y fier.
- Décision Morphéus 2026-09-02 : canal Marie = Discord via gateway (ROBERTO = secours/vocal) ; identité « Rayonne Toi » (id 1368654289584656394) = Marie.
- Presse-papier inaccessible depuis les sessions Claude Code de ce poste : livrer les messages via fichier.
- queue.json / commands.json gitignorés dans discord_com (état runtime du bot).

## Dernière session (2026-09-03)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Réduire le coût token de la veille `/discord_loop` : `wait` avec timeout paramétrable, lancé en tâche de fond ; réveil de modèle par message Discord reçu (+ sécurité horaire) au lieu d'un cycle toutes les ~110 s.

### Livrables produits ou modifiés
- DISCORD/discord_com/discord_loop.py : `wait` accepte un timeout optionnel en argument (`wait [secondes]`, défaut 110). CLI existant inchangé. Doc d'en-tête mise à jour.
- .claude/commands/discord_loop.md : étape 3a et format de démarrage réécrits pour le mode veille `wait 3600` en `run_in_background`.

### Hypothèses validées / invalidées
- VALIDE : bot Discord configuré (`enabled: true`, `channel_id` présent) et process actif (PID 79532), `queue.json` à `idle` — constaté par lecture config + Get-Process cette session.
- VALIDE : câblage gateway route_inbound déjà présent dans `.claude/commands/discord_loop.md` étape 3b (bloc « Aiguillage préalable »).
- EN ATTENTE : aller-retour Discord réel avec Marie via la gateway (drain + réponse routée) — non exercé cette session.

### Prochaine étape exacte
Hors zone discord : l'orchestrateur applique le protocole gateway (MAJ agent_role.md orchestrateur+design, retrait des appels directs dans deploy.md/analyser_googledoc.md). Zone discord : au prochain `/discord_loop`, valider le chemin réel d'envoi (drain + réponse Marie).

### Question bloquante pour la session suivante
Aucune.
