# Signals — discord   (MAJ 2026-09-05)

## Actions ouvertes
- [P1|ouvert] Livraison v5.92 vers Marie bouncée deux fois pour incohérence du nombre de tests annoncé vs puces listées (1er bounce : 9 annoncés / 13 listés ; 2e bounce : 9 annoncés / 8 listés). Toujours pas revenue corrigée dans l'outbox à la clôture de session.
  fait quand: nouvelle demande orchestrateur->marie (delivery v5.92) dans l'outbox avec nombre de tests = nombre de puces, jugée et approuvée
  réf: gateway/inbox/orchestrateur/20260905T203101_434291 (2e bounce), gateway/outbox (historique des tentatives), CLAUDE.md § Gabarit du message de livraison
- [P1|ouvert] `tests_manuels.md` (racine, hors périmètre `agent_role.md`) modifié cette session (section `[discord-auto]` « Veille /discord_loop » supprimée, validée) mais non commité depuis discord.
  fait quand: `git status --short` ne liste plus tests_manuels.md comme modifié
  réf: tests_manuels.md, .claude/commands/discord_loop.md § 3d-bis
- [P2|ouvert] `DISCORD/discord_com/gateway.py` porte des changements non commités par une autre session pendant cette session (pièce jointe locale via `enqueue(attachment_path=...)`, réveil immédiat du gardien à l'`enqueue` — explique le signal `__gateway_wake__` observé). Pas de mon fait, non commité par prudence (travail potentiellement en cours ailleurs).
  fait quand: `git status --short` ne liste plus gateway.py comme modifié, ou l'auteur confirme que c'est prêt à committer
  réf: DISCORD/discord_com/gateway.py (diff : ATTACHMENTS, MAX_ATTACHMENT_BYTES, _wake_gardien)
- [P1|ouvert] #3 (débordement cadres Date/Heure) : modèle téléphone (iPhone 13) et navigateur (Safari) reçus de Marie le 2026-09-04/05, mais la photo/vidéo du débordement demandée reste manquante. Une tentative d'envoi a probablement été perdue par le bug de pièces jointes sur @-mention (corrigé depuis, cf. contexte chaud) — pas de nouvelle tentative observée après correction.
  fait quand: une pièce jointe (photo/vidéo) de Marie liée à #3 est présente dans gateway/inbox/orchestrateur/
  réf: historique_conversation_marie.md (2026-09-04/05), _contexte/marie_modifications_suivi.md (#3), bot.py (correction has_pending_reply)
- [P1|ouvert] Appliquer réellement l'étape 3d-bis (`[discord-auto]`) à chaque cycle. Sur les deux sections historiques, une seule reste : « Bot Discord — file d'attente des commandes » (scénario 2-3 messages simultanés pendant un traitement, FIFO + auteurs affichés) jamais observé. La section « Veille /discord_loop » a été validée et supprimée cette session (les 3 sous-points enfin tous observés en conditions réelles).
  fait quand: la section « Bot Discord — file d'attente des commandes » disparaît de tests_manuels.md une fois son scénario observé en conditions réelles
  réf: tests_manuels.md, .claude/commands/discord_loop.md § 3d-bis
- [P2|ouvert] Re-soumission attendue de la zone design : message « image d'accueil ChatGPT » bouncé (trop long). Doit revenir en message court + bloc PROMPT en pièce jointe .txt. Plus de condition de `hold` liée à #3 : `pending_replies` est vide depuis le 2026-09-04.
  fait quand: nouvelle demande design->marie dans l'outbox, jugée au prochain /discord_loop
  réf: gateway/inbox/design/20260904T033440_749547 (bounce), scratchpad/msg_marie_image_accueil.txt
- [P2|ouvert] Compléter STYLE.md section `morpheus` avec les préférences de Morphéus (ton, niveau de détail). `channel` a désormais deux exceptions consignées (notify stop, message file d'attente bot.py).
  fait quand: la section `morpheus` n'a plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P2|ouvert] `DISCORD/discord_com/bot.pid` apparaît en fichier non suivi et n'est pas gitignoré (contrairement à queue.json/commands.json) — trancher : l'ajouter au .gitignore de discord_com ou le supprimer
  fait quand: `git status --short` ne liste plus bot.pid dans DISCORD/
  réf: DISCORD/discord_com/.gitignore, signals racine (action de nettoyage d'arbre déjà tracée côté racine)

## Contexte chaud
- Bug corrigé pendant cette session (par une autre session, constaté sur disque) : la branche @-mention de `on_message` (`bot.py`) perdait les pièces jointes d'une réponse à une question en attente. Désormais `gateway.has_pending_reply(author_id)` route ces réponses vers la gateway (pièces jointes incluses) même si le bot est @-mentionné — plus d'archéologie manuelle pour ce cas précis.
- STYLE.md § channel : deux exceptions de ton désormais consignées — `notify` d'arrêt (« J'en ai plein le c... je vais me faire un café et je reviens », modifié cette session sur demande explicite) et message de mise en file d'attente de `bot.py` (« j'envoie la sauce dès que j'ai fini mon café »). Les deux sont des chaînes en dur, hors jugement de l'agent DISCORD.
- Une régression de STYLE.md a été observée en cours de session (écrasement par une autre session revenant à une version antérieure à mes deux éditions) : recorrigée. À surveiller si ça se reproduit — pas d'action ouverte tant que ça reste isolé.
- `gateway/state.json` : `pending_replies` vide à la clôture (purgé plusieurs fois pendant la session par les réponses de Marie).
- Aller-retour Discord réel avec Marie désormais exercé de bout en bout, plusieurs fois : messages entrants routés vers `inbox/orchestrateur/` (réponses #3, retour sur test « ajouter depuis Réception », messages informels), gardien de sortie ayant bounced une livraison à deux reprises.
- Décision Morphéus 2026-09-02 : canal Marie = Discord via gateway (ROBERTO = secours/vocal) ; identité « Rayonne Toi » (id 1368654289584656394) = Marie.
- Presse-papier inaccessible depuis les sessions Claude Code de ce poste : livrer les messages via fichier.
- queue.json / commands.json gitignorés dans discord_com (état runtime du bot). L'outbox/inbox de la gateway aussi (non suivis).
- Un signal de réveil interne `__gateway_wake__` (auteur `gateway`) peut sortir `wait` avant le timeout pour signaler une nouvelle activité outbox — comportement observé cette session, non documenté ailleurs.

## Dernière session (2026-09-05)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Sur demande explicite de l'utilisateur, deux formulations de ton figées modifiées : message de mise en file d'attente (`bot.py`) et message d'arrêt `stop` (`discord_loop.md`), consignées dans STYLE.md § channel.
- Deux bounces de la livraison v5.92 vers Marie pour incohérence persistante entre le nombre de tests annoncé et le nombre réel de puces listées — fond non figé, jamais corrigé par l'agent DISCORD lui-même.

### Livrables produits ou modifiés
- `DISCORD/discord_com/bot.py` : message de file d'attente reformulé (ligne ~242). Corrigé par ailleurs (autre session) pour ne plus perdre les pièces jointes des réponses à une question en attente, même @-mentionnées.
- `.claude/commands/discord_loop.md` : message `notify` d'arrêt reformulé (étape 3e) — non commité depuis discord (hors périmètre).
- `DISCORD/discord_com/gateway/STYLE.md` § channel : deux exceptions de ton consignées puis recorrigées après une régression externe.
- `tests_manuels.md` : section `[discord-auto]` « Veille /discord_loop » supprimée (3 sous-points désormais tous observés en conditions réelles).

### Hypothèses validées / invalidées
- VALIDÉ : aller-retour Discord réel avec Marie exercé de bout en bout à plusieurs reprises (routage entrant, bounce sortant).
- VALIDÉ : `wait 3600` sort bien en TIMEOUT après 1h (code 1) et la boucle relance proprement ; `/close` ne déclenche aucune notification Discord.
- INVALIDÉ (partiellement) : le bug de perte d'attachments sur @-mention, documenté depuis le 2026-09-03, s'est reproduit une fois de plus le 2026-09-05 avant d'être corrigé en cours de session par une autre session.
- EN ATTENTE : re-soumission `design` de l'image d'accueil — toujours pas reçue.
- EN ATTENTE : photo/vidéo de Marie pour #3 — toujours pas reçue malgré le modèle/navigateur communiqués.

### Prochaine étape exacte
Relancer `/start discord` puis `/discord_loop`. Vérifier si la livraison v5.92 revient corrigée (nombre de tests = nombre de puces). Signaler à l'orchestrateur le commit en attente de `.claude/commands/discord_loop.md`.

### Question bloquante pour la session suivante
Aucune.
