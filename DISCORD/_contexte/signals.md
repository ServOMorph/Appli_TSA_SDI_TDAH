# Signals — discord   (MAJ 2026-09-06)

## Actions ouvertes
- [P1|ouvert] #3 (débordement cadres Date/Heure) : modèle téléphone (iPhone 13) et navigateur (Safari) reçus de Marie le 2026-09-04/05, mais la photo/vidéo du débordement demandée reste manquante.
  fait quand: une pièce jointe (photo/vidéo) de Marie liée à #3 est présente dans gateway/inbox/orchestrateur/
  réf: historique_conversation_marie.md (2026-09-04/05), _contexte/marie_modifications_suivi.md (#3)
- [P1|ouvert] Appliquer réellement l'étape 3d-bis (`[discord-auto]`) à chaque cycle. Section restante : « Bot Discord — file d'attente des commandes » (scénario 2-3 messages simultanés pendant un traitement, FIFO + auteurs affichés) jamais observé — la série de tests du 2026-09-06 était séquentielle, pas simultanée. La section « Hooks de zone on_start.md/on_close.md » est désormais exerçable (on_start + on_close réels le 2026-09-06) : sa purge de tests_manuels.md revient à l'orchestrateur / session racine (fichier hors périmètre discord), le point « échec non bloquant » reste non observé.
  fait quand: la section correspondante disparaît de tests_manuels.md une fois son scénario observé en conditions réelles
  réf: tests_manuels.md, .claude/commands/discord_loop.md § 3d-bis
- [P2|ouvert] Compléter STYLE.md section `morpheus` avec les préférences de Morphéus (ton, niveau de détail).
  fait quand: la section `morpheus` n'a plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P3|ouvert] Ré-auditer le 2e et le 3e bounce historiques de la livraison v5.92 (9 tests / 8 puces, avant le 2026-09-05) : probablement erronés eux aussi (même prémisse fausse que le 4e bounce, corrigée depuis). Sans conséquence pratique — le bon message (N=12) est déjà parti.
  fait quand: audit fait, ou jugé sans intérêt (aucune répercussion sur Marie)
  réf: historique_conversation_marie.md (2026-09-05, section v5.92), gateway/LOOP.md § 1
- [P2|ouvert] Phase 5 de `roadmap_integration_onboard.md` (canaux Discord testeurs + routage gateway, visibilité asymétrique Marie/testeurs) déléguée par l'orchestrateur à cette zone. **Code + tests unitaires livrés le 2026-09-08** (channel_id mockés, 98 tests `test_gateway.py` verts) : `TARGETS` += `testeurs`, `marie_supervision` ; `curate()` (testeur = corps brut + garde-fou anti-fuite FRAME/mention Marie ; supervision = tag Marie sans cadre ni salutation) ; `_mention_ids()` (testeurs → `[]`, jamais `MARIE_USER_ID`) ; `_channel_id_for()` + `config_bot_discord.json > channels` (canal non configuré → `GatewayError`, pas de repli sur le canal principal) ; `_discord_post()`/`drain()` postent sur le canal de la cible ; `route_inbound()` : auteur dans `agents.json > testeurs.member_ids` → `inbox/testeurs/`, sinon `unrouted` (toléré). `bot.py` multi-canal entrant **hors périmètre de cette passe** (bloqué sur canaux réels). **Reste bloqué en amont** : les 2 canaux Discord n'existent pas — demande déposée à Morphéus dans la gateway le 2026-09-08 (création `#testeurs` + canal privé supervision, permissions asymétriques, `channel_id`). Gate = test de visibilité asymétrique dans les deux sens, exige canaux réels + 1 identité testeur.
  fait quand: canaux créés par Morphéus, `config_bot_discord.json > channels` + `agents.json > testeurs.member_ids` renseignés, gate de visibilité asymétrique vert dans les deux sens
  réf: DISCORD/discord_com/gateway/ONBOARD_phase5_brief.md, roadmap_integration_onboard.md Phase 5, test_gateway.py (classe VisibiliteAsymetriqueTest)

## Contexte chaud
- `pending_replies` : une entrée active pour Marie (question posée dans la livraison v5.92 — quel bouton pour l'ajout de tâche planifiée depuis l'accueil), toujours sans réponse. Tout message vers Marie non lié à cette question doit être `hold` (règle `LOOP.md`).
- Salutation d'ouverture des messages à Marie automatisée : `curate()` (`gateway.py`) tire au hasard dans `gateway/salutations_marie.json` (10 formules) au lieu du fixe « Salut Poulette ! ». L'agent DISCORD n'a plus à taper de salutation dans le `body` — `STYLE.md` à jour. Testé et fonctionnel.
- Règle de jugement du gabarit de livraison (`LOOP.md` § 1) : N = nombre de *parcours*, les puces = numéros de modification *distincts* couverts (peuvent être moins nombreux si plusieurs parcours partagent un numéro). Ne bouncer que si N < nombre de puces. Erreur commise 3 fois de suite le 2026-09-05 avant d'être identifiée — vigilance à maintenir.
- `has_pending_reply(author_id)` route vers `inbox/<zone>/` tout message de l'auteur attendu, tagué ou non — le tag `@El Patrone#7381` n'est qu'une convention humaine, pas vérifiée par le code. Un message sans tag qui atterrit ainsi se `ack` sans traitement, `logs/conversation.jsonl` fait office de capture exhaustive.
- Hooks de zone `on_start.md`/`on_close.md` : exercés en réel le 2026-09-06. `on_start.md` enrichi le même jour (2e session) : test/kill/relance `bot.py` (natif), détection/kill process `discord_loop.py wait` orphelin (PowerShell WMI, pas de PID file natif pour ce process), résumé outbox Marie affiché avant la boucle. Pas encore testé en conditions réelles — à valider au prochain `/start discord`.
- Lacune observée le 2026-09-06 : les cycles `/discord_loop` regroupés (`send` + `done` + `wait` en une commande) ont cessé de vider `inbox/discord/` et `inbox/unrouted/` à chaque tour — un message ADMIN y a stagné jusqu'au relevé du `/close`. Garder le `poll --agent unrouted` + `poll --agent discord` à chaque cycle, même regroupé.

## Dernière session (2026-09-06)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Hook `on_start.md` enrichi : test/kill/relance `bot.py` + détection/kill `discord_loop` orphelin (WMI) + résumé outbox Marie.
- Bypass ponctuel de la règle `hold` (2e occurrence) : message « Tests techniques terminés » approuvé et envoyé à Marie sur demande explicite de Morphéus, malgré la `pending_reply` v5.92 active. Décision de circonstance, la règle `LOOP.md` reste inchangée.

### Livrables produits ou modifiés
- `DISCORD/_contexte/on_start.md` : section Pré-synthèse enrichie (3 points).

### Hypothèses validées / invalidées
- VALIDÉ : réveil gateway `__gateway_wake__` et sortie `TIMEOUT` gérés correctement par la boucle native.
- VALIDÉ : arrêt propre du process `discord_loop.py wait` en tâche de fond via `TaskStop` au `/close`, `commands.json` resté `idle` (pas d'orphelin laissé par cette session).
- EN ATTENTE : hook `on_start.md` enrichi non testé en conditions réelles (prochain `/start discord`).
- EN ATTENTE : section `[discord-auto]` « file d'attente des commandes » — toujours pas de scénario simultané observé.
- EN ATTENTE : réponse de Marie sur le bouton d'ajout de tâche planifiée (`pending_reply` active).
- EN ATTENTE : photo/vidéo de Marie pour #3.

### Prochaine étape exacte
Prochain `/start discord` : vérifier les 3 points du hook enrichi (kill/relance `bot.py`, détection/kill `discord_loop` orphelin, résumé outbox Marie affiché). Provoquer un scénario 2-3 messages Discord simultanés pour valider la section « file d'attente des commandes ».

### Question bloquante pour la session suivante
Aucune.
