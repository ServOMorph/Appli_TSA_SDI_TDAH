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
- [P2|ouvert] Re-soumission attendue de la zone design : message « image d'accueil ChatGPT » bouncé (trop long). Doit revenir en message court + bloc PROMPT en pièce jointe .txt. À `hold` (pas `approve`) tant que #3 est dans `pending_replies` — sujet non lié.
  fait quand: nouvelle demande design->marie dans l'outbox, jugée au prochain /discord_loop
  réf: gateway/inbox/design/20260904T033440_749547 (bounce), scratchpad/msg_marie_image_accueil.txt, gateway/state.json
- [P2|ouvert] Compléter STYLE.md sections `morpheus` et `channel` avec les préférences de Morphéus (ton, niveau de détail ; audience du canal). Emojis déjà tranché : aucun dans le corps.
  fait quand: les deux sections n'ont plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P2|ouvert] `DISCORD/discord_com/bot.pid` apparaît en fichier non suivi et n'est pas gitignoré (contrairement à queue.json/commands.json) — trancher : l'ajouter au .gitignore de discord_com ou le supprimer
  fait quand: `git status --short` ne liste plus bot.pid dans DISCORD/
  réf: DISCORD/discord_com/.gitignore, signals racine (action de nettoyage d'arbre déjà tracée côté racine)

## Contexte chaud
- STYLE.md (`DISCORD/discord_com/gateway/STYLE.md`) : forme des messages sortants par destinataire, relu avant chaque `approve`. Câblé dans `gateway/LOOP.md` § 1 et `.claude/commands/discord_loop.md` étape 3a-bis (les deux commités).
- Les messages système émis directement par `/discord_loop` (notify de connexion, notify d'arrêt sur `stop`) passent par STYLE.md § channel : identité « El Patrone », aucun emoji. Chaînes corrigées en dur dans `.claude/commands/discord_loop.md` étapes 2 et 3e (session 2026-09-04).
- `gateway/state.json` : `pending_replies` — une réponse Marie attendue pour #3 depuis le 2026-09-04 (routage vers inbox/orchestrateur/).
- RÈGLE (rappel Morphéus 2026-09-04) : avant tout `approve` d'une demande `to=marie`, lire `pending_replies` dans `gateway/state.json`. S'il est non vide et que la demande n'est pas liée à la question en attente → `hold`, jamais `approve`. Le contrôle mécanique de `state.json` fait foi, pas l'historique de conversation. Verdict codifié dans `gateway/LOOP.md`.
- Bot Discord : `queue.json` lu `idle` en début de session 2026-09-04 ; non revérifié en fin de session. Veille `wait 3600` en tâche de fond arrêtée au `/close`.
- Décision Morphéus 2026-09-02 : canal Marie = Discord via gateway (ROBERTO = secours/vocal) ; identité « Rayonne Toi » (id 1368654289584656394) = Marie.
- Presse-papier inaccessible depuis les sessions Claude Code de ce poste : livrer les messages via fichier.
- queue.json / commands.json gitignorés dans discord_com (état runtime du bot). L'outbox/inbox de la gateway aussi (non suivis).
- `.claude/commands/close.md` modifié hors cette session (autre session) : ne pas le committer depuis discord.

## Dernière session (2026-09-04)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Les messages système de `/discord_loop` (connexion étape 2, arrêt étape 3e) sont soumis à STYLE.md § channel : identité « El Patrone », aucun emoji dans le corps. Chaînes `notify` réécrites en dur dans la commande.

### Livrables produits ou modifiés
- `.claude/commands/discord_loop.md` : étapes 2 et 3e — chaînes `notify` réécrites (« El Patrone est connecté… » / « El Patrone se met en pause… »), suppression des emojis 🤖 / 👋 et de « Claude Code » / « Session Claude ».

### Activité `/discord_loop` de la session
- `20260903T200827_188290` (design→marie, info « image d'accueil ChatGPT ») : `bounce` — 3461 car. > limite Discord 2000, prompt à copier indivisible. Consigne : message court + bloc PROMPT en pièce jointe .txt. Renvoyé `inbox/design/`.
- `20260904T045637_240031` (orchestrateur→marie, question #3 débordement Date/Heure, `--expect-reply`) : mise en forme STYLE.md § marie (ajout « Salut Poulette ! », fond inchangé), `approve`. Parti au drain `bot.py`.
- 2 cycles TIMEOUT (aucun message entrant).

### Hypothèses validées / invalidées
- EN ATTENTE : réponse Marie pour #3 (capture + modèle téléphone + navigateur), routée vers `inbox/orchestrateur/`.
- EN ATTENTE (report) : re-soumission `design` de l'image d'accueil en pièce jointe .txt.
- EN ATTENTE (report) : sections `morpheus` / `channel` de STYLE.md à compléter par Morphéus.
- EN ATTENTE (report) : aller-retour Discord réel Marie via la gateway — toujours non exercé de bout en bout.

### Prochaine étape exacte
Relancer `/start discord` puis `/discord_loop`. Juger la re-soumission `design` (image d'accueil en pièce jointe .txt). Traiter la réponse Marie sur #3 dès qu'elle arrive dans `inbox/orchestrateur/`.

### Question bloquante pour la session suivante
Aucune.
