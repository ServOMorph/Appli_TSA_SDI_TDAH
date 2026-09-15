# Signals — discord   (MAJ 2026-09-15)

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
- [P2|ouvert] Appliquer réellement l'étape 3d-bis (`[discord-auto]`) à chaque cycle. Appliquée à chaque `TIMEOUT` de la session 2026-09-09/10 (rien à valider). Section restante : « Bot Discord — file d'attente des commandes » (scénario 2-3 messages simultanés pendant un traitement, FIFO + auteurs affichés) jamais observé — les messages arrivent un par un. La section « Hooks de zone on_start.md/on_close.md » est exerçable (on_start + on_close réels) : sa purge de `tests_manuels.md` revient à l'orchestrateur / session racine (fichier hors périmètre discord), le point « échec non bloquant » reste non observé.
  fait quand: la section correspondante disparaît de tests_manuels.md une fois son scénario observé en conditions réelles
  réf: tests_manuels.md, .claude/commands/discord_loop.md § 3d-bis
- [P2|ouvert] Compléter STYLE.md section `morpheus` avec les préférences de Morphéus (ton, niveau de détail).
  fait quand: la section `morpheus` n'a plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md

## Contexte chaud
- **Routage des réponses attendues corrigé (2026-09-15, commit `826dc54`)** : `enqueue()` accepte
  désormais `--reply-to-agent <agent>`. Sans lui, une réponse à une demande `expect_reply` part vers
  l'agent `source` de la demande (comportement historique, inchangé par défaut) — pas forcément
  l'agent qui doit la traiter. Découvert le 2026-09-13 : un message urgent créé avec `--source
  discord` a fait router la réponse de Marie vers `inbox/discord/` au lieu d'`inbox/orchestrateur/`,
  nécessitant un routage manuel (`route --author-id ... --text "@orchestrateur: ..."`). Toute
  demande `expect_reply` dont la réponse doit atterrir ailleurs que chez son `source` doit
  désormais passer `--reply-to-agent`.
- **Salutations amusantes désactivées pour Marie (2026-09-15, commit `740d8d8`, demande explicite
  utilisateur)** : `gateway/salutations_marie.json` vidé (`[]`). `_salutation_marie()` et `curate()`
  gèrent la liste vide sans crash — un message à Marie part directement à `<@1368654289584656394>`
  suivi du corps, sans plus de ligne de salutation. `STYLE.md` § marie mis à jour en conséquence.
- `state.json` = `pending_replies: []` (vérifié 2026-09-09). L'entrée que ce fichier annonçait « active pour Marie » (bouton d'ajout de tâche planifiée, livraison v5.92) était périmée. Aucune réponse Marie n'est routée automatiquement tant qu'un `enqueue --expect-reply` ne recrée pas d'entrée.
- Relance des 12 tests v5.92 (demande `20260909T100248_019203`, orchestrateur -> marie, `kind: info`) : jugée `approve` par le gardien le 2026-09-09 (pas de doublon — dernière relance = 2026-09-01 pour v5.69 ; version cohérente avec `_contexte/dernier_deploiement.md` = v5.92 / 2026-09-05 ; `pending_replies` vide). Deux retouches de forme STYLE.md § marie sans changement de fond : retrait de l'étiquette « Relance : », « déployer » -> « mettre en ligne ». Envoyée par `bot.py` (Discord `1547194409135644723`, 2026-09-09 10:38 UTC).
- Réponse de Marie à cette relance (2026-09-09) : « oui j'y ai accès mais je les ai déjà fait ces tests, donc dans le navigateur avec mes données les tests n'apparaissent pas car déjà validé ». Relance sans `--expect-reply` -> pas de routage auto, tombée en commande `/discord_loop`, routée à la main vers `inbox/orchestrateur/20260909T160323_961174`, orchestrateur notifié (session parallèle). Écran « Tests à faire » vide côté Marie = mécanisme normal (un parcours disparaît dès qu'un résultat `ok`/`nok` est enregistré). Décalage côté dév = retard d'ingestion : `_contexte/marie_tests_journal.json` s'arrête au 2026-09-04, ~9 résultats v5.92 jamais ingérés. Traitement produit à la charge de l'orchestrateur (`/deploy` étape 0.4).
- ONBOARD Phase 5 passes 1-2 livrées (commit `a40a31d`, CHANGELOG v5.111, non déployé). Câblage local `config_bot_discord.json` (gitignore) : `channels.testeurs.satine.channel_id = 1546945011340542022`, `channels.supervision = 1544665195476160512`. `channels.supervision` == `channel_id` principal : livraison et supervision de Marie sur le même salon (fusion assumée, décision Morphéus 2026-09-08). Gate de visibilité asymétrique vert (script hermétique `scratchpad/gate_phase5.py`, channel_id réels, aucun POST Discord).
- Correctif `18abee5` (2026-09-08, réponse publique non sollicitée) : l'heuristique par mots-clés ne route plus jamais vers `inbox/discord` (seuls tag `@discord:`, dead-letters, bounces y entrent) ; `discord_loop.md` § 3b — aucun `send`/`notify` en vidant un inbox. `test_gateway.py` : 104 tests verts. Message parasite `1546957730638729296` sur le canal : suppression toujours à confirmer côté Morphéus (action bloquée par le classifier).
- `pending_reply` vers Morphéus (`sent/20260908T165439_677262.json`) : purgée (`state.json` = `pending_replies: []`).
- Salutation d'ouverture des messages à Marie automatisée : `curate()` (`gateway.py`) tire au hasard dans `gateway/salutations_marie.json` (10 formules). L'agent DISCORD n'a plus à taper de salutation dans le `body` — `STYLE.md` à jour.
- Règle de jugement du gabarit de livraison (`LOOP.md` § 1) : N = nombre de *parcours*, les puces = numéros de modification *distincts* couverts (peuvent être moins nombreux si plusieurs parcours partagent un numéro). Ne bouncer que si N < nombre de puces. Erreur commise 3 fois de suite le 2026-09-05 — vigilance à maintenir.
- `has_pending_reply(author_id)` route vers `inbox/<zone>/` tout message de l'auteur attendu, tagué ou non — le tag `@El Patrone#7381` n'est qu'une convention humaine, pas vérifiée par le code. Un message sans tag qui atterrit ainsi se `ack` sans traitement, `logs/conversation.jsonl` fait office de capture exhaustive.
- Lacune observée le 2026-09-06 : les cycles `/discord_loop` regroupés (`send` + `done` + `wait` en une commande) ont cessé de vider `inbox/discord/` et `inbox/unrouted/` à chaque tour. Garder le `poll --agent unrouted` + `poll --agent discord` à chaque cycle, même regroupé. Corollaire vérifié le 2026-09-09 : un `wait` lancé via `&` dans une commande groupée se détache (process orphelin non suivi, aucun réveil) — toujours lancer `discord_loop.py wait` seul en tâche de fond.
- `on_close.md` § Fin (2026-09-09, demande Morphéus) : le `/close` discord poste un message de pause sur le canal de supervision (chaîne figée = celle de l'arrêt `stop`), tue le process `discord_loop.py wait`, puis `bot.py`. Ordre imposé : message d'abord (`bot.py` doit être vivant pour flusher `queue.json`). Cible = `config.channel_id` (== `channels.supervision` tant que la fusion tient).

## Dernière session (2026-09-12 / 2026-09-15)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Salutations amusantes désactivées pour Marie (demande explicite utilisateur).
- Bug de routage des réponses attendues corrigé (`reply_to_agent`), cf. Contexte chaud.

### Livrables produits ou modifiés
- `DISCORD/discord_com/gateway.py` : `reply_to_agent` (enqueue + CLI + `route_inbound`), gestion
  liste de salutations vide (commits `826dc54`, `740d8d8`).
- `DISCORD/discord_com/gateway/salutations_marie.json` : vidé.
- `DISCORD/discord_com/gateway/STYLE.md` : sections salutation/livraison mises à jour.
- `COMMUNICATION/Marie/historique_conversation_marie.md` : message correctif incident v5.124,
  réponses #37 et incident consignées (commits `f3eb63e`, `c2e0a31`).
- Jugement gardien : relance #37 (`20260912T061449_057883`) -> `approve` ; confirmation architecture
  #37 (`20260912T061902_354912`) -> `hold` puis `approve` après réponse ; livraison v5.124
  (`20260912T091855_376439`) -> `approve`.

### Hypothèses validées / invalidées
- VALIDÉ : le routage par défaut vers l'agent `source` d'une demande `expect_reply` (au lieu de
  l'agent qui doit traiter la réponse) a causé un routage manuel le 2026-09-13 — corrigé.
- VALIDÉ : le signalement de Marie du 13/09 (« toujours pas mes données ») était un second
  incident distinct du diagnostic initial (deux installations) — pris en charge et résolu par
  l'orchestrateur (mauvais import côté Marie), hors périmètre discord.
- EN ATTENTE (inchangé depuis 2026-09-10) : Phase 5 passe 3 ; `discord_member_id` Satine ;
  photo/vidéo #3 ; section `morpheus` STYLE.md.

### Prochaine étape exacte
Passe 3 de la Phase 5 (brief `5079c0b`) : `bot.py` `on_message` multi-canal + routage entrant par canal + balayage `inbox/testeurs/<code>/` dans `/discord_loop` + tests events mockés. Puis franchir le checkpoint `/compact` de la Phase 5.

### Question bloquante pour la session suivante
Aucune.
