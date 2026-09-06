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

## Contexte chaud
- `pending_replies` : une entrée active pour Marie (question posée dans la livraison v5.92 — quel bouton pour l'ajout de tâche planifiée depuis l'accueil), toujours sans réponse. Tout message vers Marie non lié à cette question doit être `hold` (règle `LOOP.md`). Exception ponctuelle le 2026-09-06 : une info « série de tests techniques » orchestrateur→marie, d'abord `hold` par la règle, puis `approve` sur ordre explicite de Morphéus pour ses tests canal — décision de circonstance, la règle reste en vigueur.
- Salutation d'ouverture des messages à Marie automatisée : `curate()` (`gateway.py`) tire au hasard dans `gateway/salutations_marie.json` (10 formules) au lieu du fixe « Salut Poulette ! ». L'agent DISCORD n'a plus à taper de salutation dans le `body` — `STYLE.md` à jour. Testé et fonctionnel.
- Règle de jugement du gabarit de livraison (`LOOP.md` § 1) : N = nombre de *parcours*, les puces = numéros de modification *distincts* couverts (peuvent être moins nombreux si plusieurs parcours partagent un numéro). Ne bouncer que si N < nombre de puces. Erreur commise 3 fois de suite le 2026-09-05 avant d'être identifiée — vigilance à maintenir.
- `has_pending_reply(author_id)` route vers `inbox/<zone>/` tout message de l'auteur attendu, tagué ou non — le tag `@El Patrone#7381` n'est qu'une convention humaine, pas vérifiée par le code. Un message sans tag qui atterrit ainsi se `ack` sans traitement, `logs/conversation.jsonl` fait office de capture exhaustive.
- Hooks de zone `on_start.md`/`on_close.md` : exercés en réel le 2026-09-06. `/start discord` → `bot_manager.py restart` (ancien PID tué, nouvelle instance) + enchaînement automatique `/discord_loop` : OK. `/close discord` → section « Fin » de `on_close.md` : `bot_manager.py stop` (résultat dans le bilan du close). Le cas « échec non bloquant » n'a pas été provoqué.
- Lacune observée le 2026-09-06 : les cycles `/discord_loop` regroupés (`send` + `done` + `wait` en une commande) ont cessé de vider `inbox/discord/` et `inbox/unrouted/` à chaque tour — un message ADMIN y a stagné jusqu'au relevé du `/close`. Garder le `poll --agent unrouted` + `poll --agent discord` à chaque cycle, même regroupé.

## Dernière session (2026-09-06)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Bypass ponctuel de la règle `hold` : une info orchestrateur→marie approuvée malgré la `pending_reply` active, sur demande explicite de Morphéus, pour une série de tests techniques du canal. Décision de circonstance, la règle `LOOP.md` reste inchangée.

### Livrables produits ou modifiés
- Aucun fichier de code ou de doc modifié. Session d'exploitation de la boucle `/discord_loop` (19 cycles) et de premier exercice réel des hooks de zone.

### Hypothèses validées / invalidées
- VALIDÉ : hook `on_start.md` (Pré-synthèse) — `bot_manager.py restart` tue l'ancien PID (114400) et relance proprement (65640), enchaînement `/discord_loop` automatique.
- VALIDÉ : réveil gateway `__gateway_wake__` sort du `wait` en < 1 s et déclenche un tour de jugement d'outbox.
- VALIDÉ : règle `hold` appliquée correctement (message non lié à la `pending_reply` → `hold`), puis levée sur ordre explicite.
- INVALIDÉ : rien.
- EN ATTENTE : section `[discord-auto]` « file d'attente des commandes » — tests de ce cycle séquentiels, pas simultanés.
- EN ATTENTE : réponse de Marie sur le bouton d'ajout de tâche planifiée (`pending_reply` active).
- EN ATTENTE : photo/vidéo de Marie pour #3.

### Prochaine étape exacte
Prochain `/start discord` : re-vérifier le hook `on_start.md`. Provoquer un scénario 2-3 messages Discord simultanés pendant un traitement pour valider la section « file d'attente des commandes ». Signaler à l'orchestrateur que les hooks `on_start`/`on_close` sont exercés (purge possible de la section correspondante de `tests_manuels.md`, hors périmètre discord).

### Question bloquante pour la session suivante
Aucune.
