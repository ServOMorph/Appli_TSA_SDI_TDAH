# Statut — discord

Remonte à : Appli_TSA_SDI_TDAH (orchestrateur), cf. `agent_role.md`.

## Objectif
Point de contact unique Discord du projet : gardien de sortie de la gateway (approve/hold/bounce/merge), routage entrant, boucle `/discord_loop` quasi-permanente.

## Avancement
Session 2026-09-08 / 2026-09-09. Deux livrables :
- `18abee5` : correctif d'une réponse publique non sollicitée — `route_inbound()` : l'heuristique par mots-clés ne route plus jamais vers `inbox/discord` (garde `if h == "discord": h = None`) ; `discord_loop.md` § 3b : aucun `send`/`notify` en vidant un inbox.
- `a40a31d` (ONBOARD Phase 5, passes 1-2) : modèle « un canal Discord par testeur ». Cible `testeur:<code>` (`_TESTEUR_TARGET_RE`, `_testeur_code`) ; `config_bot_discord.json > channels` = `{ testeurs: { <code>: { channel_id, discord_member_id } }, supervision }` ; `_channel_id_for()` résout par code ; `curate`/`_mention_ids` sur `testeur:<code>` (corps brut + garde-fou anti-fuite) ; `route_inbound` via `_testeur_code_pour_auteur()` → `inbox/testeurs/<code>/`. `agents.json > testeurs.member_ids` retiré. `VisibiliteAsymetriqueTest` réécrite (104 tests verts). Gate de visibilité asymétrique vert (script hermétique, channel_id réels, aucun POST). Câblage local `config_bot_discord.json` (gitignore) : `satine` → `1546945011340542022`, `supervision` → `1544665195476160512`.

## Blocages
- `discord_member_id` de Satine non câblé (member_id provisoire = `MORPHEUS_USER_ID`, collision) — à faire quand elle rejoint le serveur.
- `pending_reply` Marie active (bouton d'ajout de tâche planifiée) — toujours sans réponse.
- Photo/vidéo de Marie pour #3 (débordement Date/Heure) toujours manquante.

## Prochain pas
Phase 5 passe 3 (brief `5079c0b`, décisions Morphéus) : `bot.py` `on_message` multi-canal + routage entrant PAR CANAL (contourne la collision) + balayage `inbox/testeurs/<code>/` dans `/discord_loop` + tests events mockés. Puis franchir le checkpoint `/compact` de la Phase 5.

## Commit proposé
`close(discord): session 2026-09-09 — Phase 5 passes 1-2 (un canal par testeur, gate vert), correctif heuristique inbox/discord`

## Fichiers modifiés
- Session : `DISCORD/discord_com/gateway.py`, `test_gateway.py`, `gateway/agents.json`, `config_bot_discord.example.json`, `.claude/commands/discord_loop.md`, `CHANGELOG.md` (v5.111), `DISCORD/_contexte/signals.md` (commits `18abee5`, `a40a31d`).
- `/close` : `DISCORD/_contexte/` (signals, contexte, statut, archive_decisions, memory), `CHANGELOG.md` (v5.112).

Hors périmètre `DISCORD/`+`scripts/`, touché sur instruction explicite (commande `/close` / demande utilisateur) et signalé dans les messages de commit : `.claude/commands/discord_loop.md`, `CHANGELOG.md`.

## Tests et migrations
Aucune migration. `python -m unittest test_gateway` (depuis `DISCORD/discord_com/`) : 104 tests verts. Gate Phase 5 (`scratchpad/gate_phase5.py`) : vert. Comportements observés en conditions réelles : réveil `__gateway_wake__`, sortie `TIMEOUT`, jugement de l'outbox.
