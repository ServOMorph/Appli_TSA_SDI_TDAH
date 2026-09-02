# Signals — discord   (MAJ 2026-09-02)

## Actions ouvertes
- [P1|ouvert] Configurer le bot via /init_discord_mode (token, Application ID, OAuth2, Message Content Intent, channel_id, pip install)
  fait quand: `config_bot_discord.json` a `enabled: true` et `python bot.py` se connecte sans erreur
  réf: DISCORD/discord_com/SETUP.md, DISCORD/discord_com/ACCES.md
- [P1|ouvert] Adoption gateway par l'orchestrateur (hors zone discord)
  fait quand: `agent_role.md` orchestrateur + design interdisent l'écriture Discord directe, `deploy.md`/`analyser_googledoc.md` n'appellent plus message_marie.py/claude_bridge, CLAUDE.md aligné sur "canal Marie = Discord via gateway"
  réf: scratchpad message_orchestrateur.txt (livré), DISCORD/discord_com/gateway/README.md
- [P1|ouvert] Câblage route_inbound dans .claude/commands/discord_loop.md étape 3b (périmètre racine, orchestrateur)
  fait quand: le loop passe tout message non adressé à l'agent DISCORD à gateway.route_inbound puis reboucle sur wait
  réf: DISCORD/discord_com/gateway/LOOP.md section "2 bis"
- [P2|ouvert] Valider le chemin réel d'envoi une fois le bot configuré : gateway.py drain (POST Discord réel) + réception d'une vraie réponse Marie routée vers inbox/orchestrateur/
  fait quand: un aller-retour complet Marie observé via la gateway, pending purgé
  réf: DISCORD/discord_com/gateway.py (drain, route_inbound), tests unitaires test_gateway.py
- [P2|ouvert] Décider si /discord_loop est copié dans .claude/commands/ à la racine
  fait quand: fichier présent (ou décision explicite de ne pas le faire, tracée ici)
  réf: DISCORD/discord_com/.claude/commands/discord_loop.md

## Contexte chaud
- Décisions Morphéus 2026-09-02 : canal Marie = Discord via gateway (ROBERTO = secours/vocal) ; identité « Rayonne Toi » (id 1368654289584656394) = bien Marie -> pending_reply exploitable.
- pending_reply seedé dans gateway/state.json (gitignoré) : 2 questions produit de l'orchestrateur à Marie, en attente de sa réponse Discord.
- Presse-papier inaccessible depuis les sessions Claude Code de ce poste : livrer les messages via fichier.
- queue.json / commands.json ajoutés au .gitignore de discord_com (état runtime du bot).

## Dernière session (2026-09-02)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Canal Marie unique = Discord via la gateway ; bridge ROBERTO relégué en secours/vocal.
- Identité « Rayonne Toi » confirmée = Marie ; l'id en dur de message_marie.py est correct.

### Livrables produits ou modifiés
- DISCORD/discord_com/gateway.py : route_inbound (4 priorités : tag @agent: / pending / heuristique / unrouted), poll(agent), ack(agent,id), CLI poll/ack/route. (Phase 2)
- DISCORD/discord_com/test_gateway.py : 19 tests, verts.
- DISCORD/discord_com/message_marie.py : garde CLI (envoi réel refusé sans --force ; --dry-run libre).
- DISCORD/discord_com/claude_bridge.py : déprécié (envoyer/notifier lèvent RuntimeError).
- DISCORD/discord_com/gateway/LOOP.md, README.md : doc routage + poll/ack + câblage 3b.
- Message final orchestrateur : livré (scratchpad message_orchestrateur.txt).

### Hypothèses validées / invalidées
- VALIDE : routage 4 priorités testé unitairement (tag prioritaire sur pending sans purge ; pending purgé sur match).
- EN ATTENTE : chemin réel (POST Discord, vraie réponse Marie) non validé — bot non configuré.

### Prochaine étape exacte
Zone discord : configurer le bot (/init_discord_mode). Hors zone : l'orchestrateur applique le protocole gateway (message livré).

### Question bloquante pour la session suivante
Aucune côté discord. En suspens hors zone : l'orchestrateur doit trancher l'alignement de CLAUDE.md (sections « Messages pour Marie » / « Bridge ROBERTO ») sur la décision « canal Marie = Discord via gateway ».
