# Signals — discord   (MAJ 2026-09-09)

## Actions ouvertes
- [P1|ouvert] ONBOARD Phase 5 passe 3 (brief `5079c0b`) : `bot.py` `on_message` multi-canal + routage entrant PAR CANAL (contourne la collision `MORPHEUS_USER_ID` / `discord_member_id` de Satine à `null`) + balayage `inbox/testeurs/<code>/` dans la boucle `/discord_loop` + tests avec events Discord mockés. Puis franchir le checkpoint `/compact` de la Phase 5.
  fait quand: `bot.py` écoute les canaux testeurs et route les entrants par canal, la boucle `/discord_loop` balaie `inbox/testeurs/<code>/`, tests verts, checkpoint franchi
  réf: DISCORD/discord_com/gateway/ONBOARD_phase5_brief.md (§ passe 3), roadmap_integration_onboard.md Phase 5, test_gateway.py (classe VisibiliteAsymetriqueTest)
- [P2|ouvert] `discord_member_id` de Satine à câbler dans `config_bot_discord.json > channels.testeurs.satine` quand elle a rejoint le serveur (member_id provisoire = `MORPHEUS_USER_ID`, non câblé pour éviter la collision `_AUTHOR_TARGET`).
  fait quand: `channels.testeurs.satine.discord_member_id` porte l'id Discord réel de Satine
  réf: DISCORD/discord_com/gateway/ONBOARD_phase5_brief.md (§ Identifiants), DISCORD/discord_com/config_bot_discord.json
- [P1|ouvert] #3 (débordement cadres Date/Heure) : modèle téléphone (iPhone 13) et navigateur (Safari) reçus de Marie le 2026-09-04/05, mais la photo/vidéo du débordement demandée reste manquante.
  fait quand: une pièce jointe (photo/vidéo) de Marie liée à #3 est présente dans gateway/inbox/orchestrateur/
  réf: historique_conversation_marie.md (2026-09-04/05), _contexte/marie_modifications_suivi.md (#3)
- [P1|ouvert] Appliquer réellement l'étape 3d-bis (`[discord-auto]`) à chaque cycle. Section restante : « Bot Discord — file d'attente des commandes » (scénario 2-3 messages simultanés pendant un traitement, FIFO + auteurs affichés) jamais observé — les séries de tests restaient séquentielles. La section « Hooks de zone on_start.md/on_close.md » est exerçable (on_start + on_close réels depuis le 2026-09-06) : sa purge de `tests_manuels.md` revient à l'orchestrateur / session racine (fichier hors périmètre discord), le point « échec non bloquant » reste non observé.
  fait quand: la section correspondante disparaît de tests_manuels.md une fois son scénario observé en conditions réelles
  réf: tests_manuels.md, .claude/commands/discord_loop.md § 3d-bis
- [P2|ouvert] Compléter STYLE.md section `morpheus` avec les préférences de Morphéus (ton, niveau de détail).
  fait quand: la section `morpheus` n'a plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P3|ouvert] Ré-auditer le 2e et le 3e bounce historiques de la livraison v5.92 (9 tests / 8 puces, avant le 2026-09-05) : probablement erronés eux aussi (même prémisse fausse que le 4e bounce, corrigée depuis). Sans conséquence pratique — le bon message (N=12) est déjà parti.
  fait quand: audit fait, ou jugé sans intérêt (aucune répercussion sur Marie)
  réf: historique_conversation_marie.md (2026-09-05, section v5.92), gateway/LOOP.md § 1

## Contexte chaud
- `pending_replies` : une entrée active pour Marie (question posée dans la livraison v5.92 — quel bouton pour l'ajout de tâche planifiée depuis l'accueil), toujours sans réponse. Tout message vers Marie non lié à cette question doit être `hold` (règle `LOOP.md`).
- ONBOARD Phase 5 passes 1-2 livrées (commit `a40a31d`, CHANGELOG v5.111, non déployé). Câblage local `config_bot_discord.json` (gitignore) : `channels.testeurs.satine.channel_id = 1546945011340542022`, `channels.supervision = 1544665195476160512`. `channels.supervision` == `channel_id` principal : livraison et supervision de Marie sur le même salon (fusion assumée, décision Morphéus 2026-09-08). Gate de visibilité asymétrique vert (script hermétique `scratchpad/gate_phase5.py`, channel_id réels, aucun POST Discord).
- Correctif `18abee5` (2026-09-08, réponse publique non sollicitée) : l'heuristique par mots-clés ne route plus jamais vers `inbox/discord` (seuls tag `@discord:`, dead-letters, bounces y entrent) ; `discord_loop.md` § 3b — aucun `send`/`notify` en vidant un inbox. `test_gateway.py` : 104 tests verts. Message parasite `1546957730638729296` sur le canal : suppression à confirmer côté Morphéus (action bloquée par le classifier de cette session).
- `pending_reply` vers Morphéus (`sent/20260908T165439_677262.json`) : purgée (`state.json` = `pending_replies: []`).
- Salutation d'ouverture des messages à Marie automatisée : `curate()` (`gateway.py`) tire au hasard dans `gateway/salutations_marie.json` (10 formules). L'agent DISCORD n'a plus à taper de salutation dans le `body` — `STYLE.md` à jour.
- Règle de jugement du gabarit de livraison (`LOOP.md` § 1) : N = nombre de *parcours*, les puces = numéros de modification *distincts* couverts (peuvent être moins nombreux si plusieurs parcours partagent un numéro). Ne bouncer que si N < nombre de puces. Erreur commise 3 fois de suite le 2026-09-05 — vigilance à maintenir.
- `has_pending_reply(author_id)` route vers `inbox/<zone>/` tout message de l'auteur attendu, tagué ou non — le tag `@El Patrone#7381` n'est qu'une convention humaine, pas vérifiée par le code. Un message sans tag qui atterrit ainsi se `ack` sans traitement, `logs/conversation.jsonl` fait office de capture exhaustive.
- Lacune observée le 2026-09-06 : les cycles `/discord_loop` regroupés (`send` + `done` + `wait` en une commande) ont cessé de vider `inbox/discord/` et `inbox/unrouted/` à chaque tour. Garder le `poll --agent unrouted` + `poll --agent discord` à chaque cycle, même regroupé.

## Dernière session (2026-09-08 / 2026-09-09)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Correctif `18abee5` : l'heuristique par mots-clés ne route plus jamais vers l'agent `discord` (garde `if h == "discord": h = None`) ; `discord_loop.md` § 3b — aucun `send`/`notify` en vidant un inbox. Corrige une réponse publique non sollicitée.
- ONBOARD Phase 5 : modèle « un canal Discord par testeur » (cible `testeur:<code>`), remplace les 2 cibles fixes de `78733bd`. Décision Morphéus : `supervision` = canal Marie principal (fusion assumée, pas de `#supervision` dédié).

### Livrables produits ou modifiés
- `18abee5` : `gateway.py` (`route_inbound`), `.claude/commands/discord_loop.md` § 3b, `test_gateway.py` (+2), `signals.md`.
- `a40a31d` : `gateway.py` (`_testeur_code`, `_channel_id_for` par code, `curate`/`_mention_ids` sur `testeur:<code>`, `route_inbound` via `_testeur_code_pour_auteur`), `test_gateway.py` (`VisibiliteAsymetriqueTest` réécrite, 104 verts), `config_bot_discord.example.json`, `agents.json` (`member_ids` retiré), `CHANGELOG.md` v5.111.
- Câblage local `config_bot_discord.json` (gitignore) : `satine`/`supervision`.
- `scratchpad/gate_phase5.py` : gate de visibilité asymétrique (hermétique, channel_id réels) — vert.
- Note presse-papier pour l'orchestrateur (bilan Phase 5, points restants).
- `5079c0b` (par l'orchestrateur, pas cette session) : brief Phase 5 passe 3.
- `/close` : `CHANGELOG.md` v5.112 (correctif `18abee5`), `_contexte/` (signals, contexte, statut, archive_decisions).

### Hypothèses validées / invalidées
- VALIDÉ : gate de visibilité asymétrique dans les deux sens (channel_id réels, script hermétique, aucun POST) — 104 tests `test_gateway.py` verts.
- VALIDÉ : `pending_reply` vers Morphéus déjà purgée (`state.json` vide).
- EN ATTENTE : `discord_member_id` de Satine (à câbler quand elle rejoint le serveur — collision `MORPHEUS_USER_ID`).
- EN ATTENTE : `bot.py` multi-canal entrant + balayage `inbox/testeurs/<code>/` par la boucle (passe 3, actée par l'orchestrateur).
- EN ATTENTE : réponse de Marie sur le bouton d'ajout de tâche planifiée ; photo/vidéo de Marie pour #3.

### Prochaine étape exacte
Passe 3 de la Phase 5 (brief `5079c0b`) : `bot.py` `on_message` multi-canal + routage entrant par canal + balayage `inbox/testeurs/<code>/` dans `/discord_loop` + tests events mockés. Puis franchir le checkpoint `/compact` de la Phase 5.

### Question bloquante pour la session suivante
Aucune.
