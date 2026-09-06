# Signals — discord   (MAJ 2026-09-06)

## Actions ouvertes
- [P1|ouvert] #3 (débordement cadres Date/Heure) : modèle téléphone (iPhone 13) et navigateur (Safari) reçus de Marie le 2026-09-04/05, mais la photo/vidéo du débordement demandée reste manquante.
  fait quand: une pièce jointe (photo/vidéo) de Marie liée à #3 est présente dans gateway/inbox/orchestrateur/
  réf: historique_conversation_marie.md (2026-09-04/05), _contexte/marie_modifications_suivi.md (#3)
- [P1|ouvert] Appliquer réellement l'étape 3d-bis (`[discord-auto]`) à chaque cycle. Section restante : « Bot Discord — file d'attente des commandes » (scénario 2-3 messages simultanés pendant un traitement, FIFO + auteurs affichés) jamais observé. Nouvelle section ajoutée par l'orchestrateur le 2026-09-05 : « Hooks de zone on_start.md/on_close.md — jamais exercés en réel » côté discord (relance `bot_manager.py restart` + enchaînement `/discord_loop` au `/start discord` ; `bot_manager.py stop` au `/close discord`) — à observer au prochain `/start discord`/`/close discord` réel.
  fait quand: la section correspondante disparaît de tests_manuels.md une fois son scénario observé en conditions réelles
  réf: tests_manuels.md, .claude/commands/discord_loop.md § 3d-bis
- [P2|ouvert] Compléter STYLE.md section `morpheus` avec les préférences de Morphéus (ton, niveau de détail).
  fait quand: la section `morpheus` n'a plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P3|ouvert] Ré-auditer le 2e et le 3e bounce historiques de la livraison v5.92 (9 tests / 8 puces, avant le 2026-09-05) : probablement erronés eux aussi (même prémisse fausse que le 4e bounce, corrigée depuis). Sans conséquence pratique — le bon message (N=12) est déjà parti.
  fait quand: audit fait, ou jugé sans intérêt (aucune répercussion sur Marie)
  réf: historique_conversation_marie.md (2026-09-05, section v5.92), gateway/LOOP.md § 1

## Contexte chaud
- `pending_replies` : une entrée active pour Marie (question posée dans la livraison v5.92 — quel bouton pour l'ajout de tâche planifiée depuis l'accueil). Tout message vers Marie non lié à cette question doit être `hold` tant qu'elle n'a pas répondu (règle déjà dans `LOOP.md`, appliquée correctement depuis l'incident du 2026-09-05 21h32).
- Salutation d'ouverture des messages à Marie automatisée : `curate()` (`gateway.py`) tire au hasard dans `gateway/salutations_marie.json` (10 formules, copiées de `D:\ServOMorph\Roberto\com_telephone\voice-code-bridge\server\salutations.json`) au lieu du fixe « Salut Poulette ! ». L'agent DISCORD n'a plus à taper de salutation dans le `body` — `STYLE.md` mis à jour en conséquence. Testé et fonctionnel (tirages variés observés, envoi réel confirmé).
- Règle de jugement du gabarit de livraison corrigée dans `LOOP.md` § 1 : N = nombre de *parcours*, les puces = numéros de modification *distincts* couverts (peuvent être moins nombreux si plusieurs parcours partagent un numéro). Ne bouncer que si N < nombre de puces. Erreur commise 3 fois de suite le 2026-09-05 avant d'être identifiée — vigilance à maintenir, la nuance est maintenant écrite noir sur blanc dans la table de jugement.
- `contexte.md` (entrée du 2026-09-06, auteur non identifié avec certitude — probablement une session discord concurrente) : `has_pending_reply(author_id)` route vers `inbox/<zone>/` tout message de l'auteur attendu, tagué ou non — le tag `@El Patrone#7381` n'est qu'une convention humaine, pas vérifiée par le code. Un message sans tag qui atterrit ainsi (bavardage capté par effet de bord) se `ack` sans traitement, `logs/conversation.jsonl` fait office de capture exhaustive.
- L'orchestrateur a un commit large (`c7890d5`, 2026-09-05 23h54) qui a englobé plusieurs modifications faites depuis la session discord sur `gateway.py` (salutation aléatoire) en même temps que son propre travail (hooks de zone, pièce jointe Discord) — aucun résidu, vérifié (`grep _salutation_marie` présent dans le fichier committé).
- Hooks de zone `on_start.md`/`on_close.md` (mécanisme livré par l'orchestrateur suite à une délégation de cette session, note presse-papier du 2026-09-05) : `DISCORD/_contexte/on_start.md` et `on_close.md` existent, jamais exercés par un `/start discord`/`/close discord` réel avant celui-ci.
- `bot.pid` désormais gitignoré (`DISCORD/discord_com/.gitignore:10`) — action de nettoyage antérieure résolue.

## Dernière session (2026-09-06)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Salutation d'ouverture des messages à Marie automatisée (tirage aléatoire), remplace le fixe « Salut Poulette ! » tapé manuellement par le gardien.
- Règle de jugement du gabarit de livraison (N=parcours vs puces=modifications distinctes) corrigée durablement dans `LOOP.md`, après 3 bounces erronés sur la livraison v5.92.
- Refus de modifier `.claude/commands/start.md`/`close.md`/`discord_loop.md` depuis cette session (hors périmètre `agent_role.md`) : délégué à l'orchestrateur via une note presse-papier — repris et implémenté (mécanisme de hooks `on_start.md`/`on_close.md`).

### Livrables produits ou modifiés
- `DISCORD/discord_com/gateway.py` : salutation aléatoire dans `curate()` (déjà committé par l'orchestrateur, `c7890d5`).
- `DISCORD/discord_com/gateway/salutations_marie.json` : nouveau, 10 formules.
- `DISCORD/discord_com/gateway/STYLE.md` : retrait de la salutation manuelle « Salut Poulette ! », doc du nouveau mécanisme automatique.
- `DISCORD/discord_com/gateway/LOOP.md` : ligne de jugement dédiée au gabarit N/puces.
- Livraison v5.92 : approuvée et envoyée à Marie (N=12) après 5 tentatives et 4 bounces (3 erronés, identifiés et corrigés en session).
- Message correctif envoyé à Marie suite à une erreur de séquencement (message design parti pendant qu'elle attendait la livraison).

### Hypothèses validées / invalidées
- INVALIDÉ : ma compréhension du gabarit de livraison (N == nombre de puces) était fausse → corrigé dans `LOOP.md`.
- INVALIDÉ : le message design→marie envoyé pendant que Marie attendait la livraison v5.92 → erreur de jugement (règle `hold` non appliquée), corrigée par un message explicatif.
- VALIDÉ : la salutation aléatoire fonctionne en conditions réelles (plusieurs tirages distincts observés, un envoi réel confirmé).
- EN ATTENTE : réponse de Marie à la question sur le bouton d'ajout de tâche planifiée (`pending_reply` active).
- EN ATTENTE : les 2e/3e bounces historiques de v5.92 (avant cette session) n'ont pas été ré-audités.

### Prochaine étape exacte
Prochain `/start discord` : vérifier que le hook `on_start.md` (relance `bot_manager.py restart` + enchaînement `/discord_loop`) fonctionne réellement — jamais exercé jusqu'à ce `/close`. Ce `/close` exerce pour la première fois la section « Fin » de `on_close.md` (`bot_manager.py stop`) — vérifier le résultat dans le bilan.

### Question bloquante pour la session suivante
Aucune.
