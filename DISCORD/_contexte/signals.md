# Signals — discord   (MAJ 2026-09-04)

## Actions ouvertes
- [P1|ouvert] Adoption gateway par l'orchestrateur (hors zone discord)
  fait quand: `agent_role.md` orchestrateur + design interdisent l'écriture Discord directe, `deploy.md`/`analyser_googledoc.md` n'appellent plus message_marie.py/claude_bridge, CLAUDE.md aligné sur "canal Marie = Discord via gateway"
  réf: scratchpad message_orchestrateur.txt (livré), DISCORD/discord_com/gateway/README.md
- [P1|ouvert] Valider le chemin réel d'envoi : gateway.py drain (POST Discord réel) + réception d'une vraie réponse Marie routée vers inbox/orchestrateur/
  fait quand: un aller-retour complet Marie observé via la gateway, pending purgé
  réf: DISCORD/discord_com/gateway.py (drain, route_inbound), tests unitaires test_gateway.py
- [P1|ouvert] Réponse Marie attendue pour #3 (débordement cadres Date/Heure du formulaire de tâche) : capture + modèle téléphone + navigateur. Question approuvée et partie via bot.py le 2026-09-04.
  fait quand: réponse Marie présente dans gateway/inbox/orchestrateur/, ack après traitement
  réf: gateway/outbox/20260904T045637_240031.json, historique_conversation_marie.md (2026-09-04), _contexte/marie_modifications_suivi.md (#3)
- [P1|ouvert] Appliquer réellement l'étape 3d-bis (`[discord-auto]`) à chaque cycle, pas seulement une fois — relire `tests_manuels.md` après rafale de commandes / TIMEOUT / stop-close et supprimer les sections dont la condition vient d'être observée.
  fait quand: les sections « Bot Discord — file d'attente des commandes » et « Veille /discord_loop — wait timeout » disparaissent de tests_manuels.md une fois leur condition observée en conditions réelles
  réf: .claude/commands/discord_loop.md § 3d-bis (commit 32f3f2d), tests_manuels.md, DISCORD/_contexte/contexte.md (décision 2026-09-04)
- [P2|ouvert] Re-soumission attendue de la zone design : message « image d'accueil ChatGPT » bouncé (trop long). Doit revenir en message court + bloc PROMPT en pièce jointe .txt. À `hold` (pas `approve`) tant que #3 est dans `pending_replies` — sujet non lié.
  fait quand: nouvelle demande design->marie dans l'outbox, jugée au prochain /discord_loop
  réf: gateway/inbox/design/20260904T033440_749547 (bounce), scratchpad/msg_marie_image_accueil.txt, gateway/state.json
- [P2|ouvert] Compléter STYLE.md section `morpheus` avec les préférences de Morphéus (ton, niveau de détail). `channel` complétée (exception notify) ; emojis déjà tranché : aucun dans le corps.
  fait quand: la section `morpheus` n'a plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P2|ouvert] `DISCORD/discord_com/bot.pid` apparaît en fichier non suivi et n'est pas gitignoré (contrairement à queue.json/commands.json) — trancher : l'ajouter au .gitignore de discord_com ou le supprimer
  fait quand: `git status --short` ne liste plus bot.pid dans DISCORD/
  réf: DISCORD/discord_com/.gitignore, signals racine (action de nettoyage d'arbre déjà tracée côté racine)

## Contexte chaud
- STYLE.md (`DISCORD/discord_com/gateway/STYLE.md`) : forme des messages sortants par destinataire, relu avant chaque `approve`. Câblé dans `gateway/LOOP.md` § 1 et `.claude/commands/discord_loop.md` étape 3a-bis (les deux commités).
- Exception ton § channel (décision Morphéus 2026-09-04) : les deux `notify` fixes de `/discord_loop` (connexion étape 2, arrêt étape 3e) sont volontairement humoristiques et dérogent au ton neutre — « Allez ça y'est je me remets au taf » / « Allez, les jeunes, bonne nuit, je va me coucher » (« va » assumé). Chaînes en dur, hors jugement de l'agent DISCORD.
- Convention `[discord-auto]` (livrée par l'orchestrateur, commit `32f3f2d`) : étape 3d-bis dans `discord_loop.md`, sections courantes taguées dans `tests_manuels.md` (« Bot Discord — file d'attente des commandes », « Veille /discord_loop — wait timeout »). À appliquer à chaque cycle concerné — voir action ouverte P1 ci-dessus.
- `gateway/state.json` : `pending_replies` — une réponse Marie attendue pour #3 depuis le 2026-09-04 (routage vers inbox/orchestrateur/).
- RÈGLE (rappel Morphéus 2026-09-04) : avant tout `approve` d'une demande `to=marie`, lire `pending_replies` dans `gateway/state.json`. S'il est non vide et que la demande n'est pas liée à la question en attente → `hold`, jamais `approve`. Le contrôle mécanique de `state.json` fait foi, pas l'historique de conversation. Verdict codifié dans `gateway/LOOP.md`.
- Bot Discord : `queue.json` lu `idle` en cours de session 2026-09-04 ; non revérifié en fin de session. Veille `wait 3600` en tâche de fond arrêtée au `/close`.
- Décision Morphéus 2026-09-02 : canal Marie = Discord via gateway (ROBERTO = secours/vocal) ; identité « Rayonne Toi » (id 1368654289584656394) = Marie.
- Presse-papier inaccessible depuis les sessions Claude Code de ce poste : livrer les messages via fichier.
- queue.json / commands.json gitignorés dans discord_com (état runtime du bot). L'outbox/inbox de la gateway aussi (non suivis).
- `.claude/commands/close.md` et `start.md` modifiés hors cette session (autre session, orchestrateur) : ne pas les committer depuis discord.

## Dernière session (2026-09-04, 2e du jour)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Les deux `notify` fixes de `/discord_loop` dérogent volontairement au ton neutre de STYLE.md § channel (humour assumé, décision Morphéus) ; exception consignée dans STYLE.md plutôt que silencieusement ignorée.
- La consigne « pas de notify au démarrage/arrêt de la boucle » a été demandée puis annulée par l'utilisateur dans la même session : les deux notify restent, avec un contenu figé fourni par Morphéus.

### Livrables produits ou modifiés
- `.claude/commands/discord_loop.md` : chaînes `notify` étapes 2 et 3e remplacées par les formulations Morphéus (déjà commité par l'orchestrateur, commit `32f3f2d`, avec l'étape 3d-bis `[discord-auto]`).
- `DISCORD/discord_com/gateway/STYLE.md` § channel : exception de ton consignée pour ces deux `notify`.
- `DISCORD/_contexte/contexte.md` : décisions structurantes complétées (exception notify, convention `[discord-auto]`/3d-bis livrée par l'orchestrateur) ; État actuel réécrit.

### Hypothèses validées / invalidées
- EN ATTENTE : réponse Marie pour #3 (capture + modèle téléphone + navigateur), routée vers `inbox/orchestrateur/` — inchangé, aucune activité gateway ce tour.
- EN ATTENTE (report) : re-soumission `design` de l'image d'accueil en pièce jointe .txt — à `hold` tant que #3 est dans `pending_replies`.
- EN ATTENTE (report) : section `morpheus` de STYLE.md à compléter par Morphéus.
- EN ATTENTE (report) : aller-retour Discord réel Marie via la gateway — toujours non exercé de bout en bout.

### Prochaine étape exacte
Relancer `/start discord` puis `/discord_loop`. Juger la re-soumission `design` (hold, #3 en attente). Traiter la réponse Marie sur #3 dès réception. Appliquer réellement l'étape 3d-bis à chaque cycle concerné (voir action ouverte P1).

### Question bloquante pour la session suivante
Aucune.
