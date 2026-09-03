# Roadmap — Agent DISCORD en service permanent + livraison inter-agents en direct

Créée le 2026-09-03. Fait suite à l'analyse du système gateway (`DISCORD/discord_com/gateway.py`,
`bot.py`, `discord_loop.py`, `gateway/README.md`, `gateway/LOOP.md`) et à l'incident du même jour
(l'orchestrateur a lancé `gateway.py drain` lui-même — réservé à l'agent DISCORD).

Légende : `[TODO]` non démarrée · `[EN COURS]` en cours · `[FAIT]` terminée.
Gate commun : auto-tests `test_gateway.py` verts · vérification manuelle de la phase · doc à jour ·
critère de sortie.

## Objectif

Faire de l'agent DISCORD le **seul point de contact Discord** du projet, en service quasi-permanent,
avec quatre responsabilités :

1. **Gardien de sortie** — les autres agents lui déposent (`enqueue`) des messages destinés à Marie ;
   il juge la pertinence de chacun ; s'il rejette, il **renvoie le message à l'agent auteur avec le
   motif** (jamais sur Discord) ; s'il approuve, le message part sur Discord (encadrement `💻🤖` + tag
   inchangés).
2. **Collecteur d'entrée** — il capte **tous** les messages du canal, pas seulement ceux qui
   @-mentionnent le bot.
3. **Répartiteur** — il trie les entrants et les livre dans l'`inbox/<agent>/` du bon agent.
4. **Livraison en direct** — chaque agent lit son `inbox` au fil de l'eau, pas seulement à `/start`
   et `/close`.

## Enjeux mesurés (analyse du 2026-09-03)

| # | Constat | Preuve |
| --- | --- | --- |
| 1 | `bot.py` ne transmet que les messages qui @-mentionnent le bot ; les autres sont journalisés puis perdus | `bot.py:177` `if client.user not in message.mentions: return` |
| 2 | Toute la logique `route_inbound` (tag `@agent:`, heuristique) est quasi morte : rien ne l'alimente hors @-mention | `bot.py` n'appelle jamais `gateway.route_inbound` |
| 3 | L'agent DISCORD n'est pas permanent ; absent, le routage entrant s'arrête sans alerte | `/discord_loop` = session humaine ; angle mort `processing` orphelin (déjà P3 `signals.md`) |
| 4 | Aucun contrôle de pertinence ni renvoi à l'auteur ; `curate()` est purement mécanique | `gateway.py:136` |
| 5 | Aucune lecture en direct : les agents ne voient leur `inbox/` qu'à la demande, rien dans `start.md`/`close.md` | `grep gateway .claude/commands` = `deploy.md`, `discord_loop.md` seuls |
| 6 | `state.json.pending_reply` = un seul créneau : 2 questions concurrentes à Marie → la 1ʳᵉ réponse mal routée | `gateway.py:218-223` écrase `pending_reply` |
| 7 | `AGENTS = ("orchestrateur","design")` en dur ; pas de mapping zone→agent | `gateway.py:45` |
| 8 | Zéro verrou : `enqueue`/`drain`/`route_inbound` font read-modify-write sur `state.json` et les fichiers sans lock | tient par chance (un seul writer) |
| 9 | `drain` sur échec d'envoi : `send_fn` lève, `drain` s'interrompt, pas de statut, pas d'alerte | `gateway.py:215` non gardé |

## Décisions de cadrage (2026-09-03, tranchées avec l'utilisateur)

- **Modèle « routage mécanique dans `bot.py` »** (option 2). `bot.py` (démon Python, coût nul) fait
  tout le routage déterministe : tag `@agent:`, appariement `pending_replies[]`, heuristique, sinon
  `unrouted`. Il draine aussi les items de l'outbox marqués `approved`. La **session** agent DISCORD
  ne se réveille que pour le jugement : revue de pertinence de l'outbox, tri de `inbox/unrouted/`,
  commandes @bot. Plus personne ne lance `drain` à la main.
- **Livraison en direct par hooks** (pas de boucle de veille par session). Hook `SessionStart` →
  `poll` de rattrapage ; hook `Stop` → `poll` de l'`inbox` après chaque réponse de l'agent, messages
  réinjectés avant repos. Coût quasi nul (pas de tour modèle supplémentaire), latence = « au prochain
  passage à vide » de la session. Une session inactive depuis longtemps ne voit un message qu'au
  prochain message utilisateur ou `/start` ; pour un cas vraiment urgent, l'agent DISCORD escalade
  (réponse Discord « noté, transmis » + relance humaine).
- **Agent = zone.** `orchestrateur` est la **zone principale** (`Appli_TSA_SDI_TDAH`). `design` ↔ zone
  `design`, `discord` ↔ zone `discord`. Tout futur agent = une nouvelle zone dans `zones.md` + une
  entrée dans `gateway/agents.json`. Le nom d'agent utilisé par la gateway est le nom de zone.
- **Roadmap en 3 phases**, checkpoint `/compact` entre chaque (règle `CLAUDE.md` § Roadmap).
- Harnais de test : `unittest` de la stdlib (`test_gateway.py` existe déjà, 179 lignes) — aucune
  dépendance nouvelle.
- Transports : `queue.json` / `commands.json` restent **uniquement** le canal de contrôle
  `/discord_loop` (commandes @bot → session boucle). Tout Marie / Morphéus / inter-agents passe par
  `gateway/`. Frontière documentée.

## Critères de rejet du gardien de sortie (liste arrêtée)

Le gardien **`bounce`** (renvoi à `inbox/<source>/`, `kind:"bounce"`, motif + corps d'origine) quand :

1. **Doublon** — le même fond a déjà été envoyé récemment (`outbox/sent/` + `conversation.jsonl`) et
   rien de nouveau ne le justifie.
2. **Réponse déjà connue** — la question a déjà reçu sa réponse de Marie, ou l'info demandée figure
   déjà dans un message envoyé.
3. **Fond non figé** — la demande contient un `<placeholder>`, un choix non tranché, des options de
   réponse manquantes, ou un TODO. Le gardien ne complète pas : il renvoie.
4. **Hors périmètre canal** — message pour Marie truffé de mécanique interne (hash de commit, chemins
   de fichiers, jargon) → renvoi pour reformulation côté auteur (le gardien ne reformule pas le fond).
5. **Incohérence de version** — annonce une version / URL / fonctionnalité qui ne correspond pas à
   l'état déployé connu (`_contexte/dernier_deploiement.md`).

Le gardien **`hold`** (report au cycle suivant, pas de renvoi) quand : le fond est bon mais une
question est déjà en attente de réponse de Marie (`pending_replies` non vide pour `marie`) et le
nouveau message n'y est pas lié.

Le gardien **`merge`** quand : plusieurs `info` courtes vers le même destinataire gagnent à être
fusionnées, et le fond le permet sans réécriture.

Tout le reste → **`approve`**.

## Ordre et dépendances

Phase 1 (fondations) est prérequise pour 2 et 3. Phase 2 (gardien) et Phase 3 (hooks) sont
indépendantes entre elles mais Phase 3 se teste mieux après Phase 2 (un `bounce` visible dans
l'`inbox` de l'orchestrateur est un bon cas de livraison en direct).

---

## Phase 1 — Fondations : `bot.py` transmet tout, registre d'agents, `pending_replies[]`, verrous [FAIT]

Traite les constats 1, 2, 6, 7, 8. Réalisée le 2026-09-03 (agent DISCORD arrêté). 58 auto-tests
verts. Phase 1 éprouvée en réel : réponse de Marie du 2026-09-03 17h17 routée seule par `bot.py`
(`routing:"pending"`, `inbox/orchestrateur/20260903T171703_391686`), sans session agent DISCORD.

- [x] **`gateway/agents.json`** (neuf) : registre `{ "<zone>": { alias?, "path", "keywords" } }`
  pour `Appli_TSA_SDI_TDAH` (`alias: "orchestrateur"`), `design`, `discord`.
- [x] **`gateway.py`** : `load_registry()` / `resolve_agent()` / `_heuristique_registre()`
  remplacent le tuple `AGENTS` en dur ; `poll`/`ack`/tags acceptent nom de zone ou alias.
  Heuristique en frontières de mot `\b`, départage au nombre de mots-clés distincts (écart : `re.search`
  et non sous-chaîne — `bot` matchait `bouton`).
- [x] **`gateway.py`** : `pending_reply` (objet) → `pending_replies` (liste `{ request_id, source,
  to, since }`), migration paresseuse non destructive (`_migrer_state`). Appariement d'une réponse
  entrante à l'entrée la plus récente pour la cible de son **auteur Discord** (`_target_from_author`
  via `MARIE_USER_ID`/`MORPHEUS_USER_ID`) ; retire cette seule entrée. Écart : le pending est posé
  au `drain` (pas à `enqueue --expect-reply`) — évite un pending fantôme pour un message tenu par le
  gardien en Phase 2.
- [x] **`gateway.py`** : `_atomic_write` (`tmp` + `os.replace`) pour `state.json` et tout spool ;
  `_state_lock()` (fichier `state.lock`, `os.O_CREAT|O_EXCL`, retry 10 ms, récup périmé > 30 s,
  deadline 5 s) autour de chaque read-modify-write via `update_state(fn)`.
- [x] **`bot.py`** : `on_message` route vers `gateway.route_inbound(author_id, author_name,
  content, attachments)` tout message du canal hors @-mention (`return` sec retiré) ; `commands.json`
  réservé aux commandes @bot. Écart : `attachments` transportés (réponse de Marie faite de captures).
- [x] **`bot.py`** : `recuperer_processing_orphelin()` (appelé dans `on_ready`) — `commands.json`
  en `processing` depuis plus de `ORPHAN_PROCESSING_MINUTES = 15` → repassé `idle`.
- [x] **`test_gateway.py`** : registre, `pending_replies[]` (ajout, appariement au plus récent,
  entrées multiples, migration), routage mécanique, concurrence 12 threads, `attachments`,
  heuristique `\b`.

**Critère de sortie** : `test_gateway.py` vert (58) ; `bot.py` redémarré via `bot_manager.py
restart` (PID 82188). Test manuel dev de bout en bout (`@design:` sans @bot → `inbox/design/`)
tracé dans `tests_manuels.md` — le chemin `on_message` → gateway est par ailleurs éprouvé en réel
par la réponse de Marie du 17h17.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Gardien de sortie : approbation, `bounce`, drain automatique par `bot.py` [FAIT]

Traite les constats 4 et 9. Réalisée le 2026-09-03. 58 auto-tests verts. `bot.py` redémarré
(PID 82188).

- [x] **`gateway.py`** : `status` sur chaque fichier outbox — `pending` (défaut) → `approved` |
  `held` | `bounced` | `failed` (`_statut()` gère la compat de l'ancien booléen `hold`). Verbes :
  - `approve --id <id>` : `pending`/`held`/`failed` → `approved` (`failed` inclus — écart, permet
    de retenter un envoi échoué).
  - `hold --id <id> [--reason]` : → `held` (ignoré par `drain` jusqu'à un `approve`).
  - `bounce --id <id> --reason "<motif>"` : déplace vers `inbox/<source>/` en `{ kind:"bounce",
    reason, original_body, original_id, original_to, original_kind }` ; retiré de l'outbox.
  - `merge --ids <id,id,...>` : concatène les `body` dans le plus ancien (ordre chronologique),
    `expect_reply = any`, supprime les autres ; refuse des destinataires différents.
- [x] **`gateway.py`** : `drain` n'envoie que les `approved` (les autres → `ignoré`) ; `send_fn`
  qui lève → `_marquer(..., "failed")` + dead-letter `{ kind:"dead-letter" }` dans `inbox/discord/`
  + la boucle continue. Verrou `drain.lock` (le `drain` devient périodique).
- [x] **`bot.py`** : `boucle_polling` appelle `gateway.drain()` via `asyncio.to_thread` toutes les
  `GATEWAY_DRAIN_INTERVAL = 5.0` s (écart : throttle, pas « à chaque tour » de la boucle 0,5 s).
  Plus aucun `drain` manuel nulle part.
- [x] **`discord_loop.md`** : étape 3a-bis « gardien de sortie » ajoutée (table de décision
  `approve`/`hold`/`bounce`/`merge`), étape 3b simplifiée (routage mécanique par `bot.py`),
  flux résumé et format de démarrage mis à jour, note « ne jamais lancer `drain` ».
- [x] **`CLAUDE.md`** § Communication Discord : contrat du gardien + 5 critères de rejet ; `bot.py`
  draine les `approved` toutes les 5 s, `gateway.py drain` en direct interdit à **tous** (y compris
  l'agent DISCORD).
- [x] **`gateway/README.md`** + **`gateway/LOOP.md`** : statuts outbox, verbes du gardien,
  `bounce`/`dead-letter`, drain automatique, « ne pas lancer `drain` ».
- [x] **`test_gateway.py`** : `drain` n'envoie que les `approved` ; `bounce` → `inbox/<source>/`
  avec motif, hors outbox, rien envoyé ; `merge` ; échec d'envoi simulé → `failed` + dead-letter,
  la boucle continue ; `failed` ré-`approve` reparti ; verrous libérés.

**Critère de sortie** : tests verts (58) ; test manuel dev vérifié sur la gateway réelle sans
trafic Discord — `enqueue` d'un corps `<X.Y>` reste `pending`, `bounce --reason "fond non figé"` →
`kind:"bounce"` dans `inbox/orchestrateur/`, aucun résidu. **Non encore vérifié** : le `drain`
automatique de `bot.py` n'a pas encore envoyé de vrai message Discord (tracé dans
`tests_manuels.md` § Gateway Discord Phase 2).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Livraison en direct : hooks, `start.md`, `close.md`, docs [TODO]

Traite le constat 5.

- [ ] **`gateway.py`** : `poll` accepte `--zone <alias>` (résout le nom d'agent via `agents.json`) ;
  sortie compacte exploitable telle quelle dans un hook (liste `id — auteur — 1ʳᵉ ligne`, ou
  `RIEN`). Nouveau `poll --format hook` si besoin d'un rendu dédié.
- [ ] **`.claude/settings.json`** (via skill `update-config`) : 
  - hook `SessionStart` → `python DISCORD/discord_com/gateway.py poll --zone <zone courante>` ;
    sa sortie entre dans le contexte de démarrage (rattrapage de ce qui s'est accumulé hors-ligne).
  - hook `Stop` → même `poll` ; si l'`inbox` n'est pas vide, réinjecter les messages pour que la
    session les traite (+ `ack`) avant de se mettre au repos.
  - Les deux hooks ne bloquent jamais sur erreur (gateway absente, zone hors registre → sortie
    vide, exit 0).
- [ ] **`start.md`** : nouvelle étape (après résolution de zone) — « identité d'agent » : le nom de
  zone résolu **est** le nom d'agent gateway (`Appli_TSA_SDI_TDAH` → alias `orchestrateur`). Faire
  un `poll --zone` initial, afficher les messages en attente, rappeler que le hook `Stop` prend le
  relais en cours de session. Ne rien lancer en tâche de fond (les hooks suffisent).
- [ ] **`close.md`** : étape symétrique — `poll --zone` final, `ack` de ce qui est traité,
  signalement en une ligne de ce qui reste non traité dans l'`inbox`.
- [ ] **`discord_loop.md`** : documenter le fonctionnement en service quasi-permanent de la session
  agent DISCORD (session dédiée, cadence de revue de l'outbox, auto-récupération de l'orphelin
  `processing` déjà ajoutée en Phase 1).
- [ ] **`CLAUDE.md`** § Mémoire projet / Contrôle du contexte : documenter que les sessions
  d'agent reçoivent leur `inbox` par hook, et le rôle de `start.md` / `close.md`.
- [ ] **`test_gateway.py`** : `poll --zone` résout correctement ; `poll` sur inbox vide → `RIEN`
  exit 0 ; sur inbox non vide → liste attendue.

**Critère de sortie** : tests verts ; test manuel dev = pendant une session orchestrateur active,
un message routé vers `inbox/orchestrateur/` est vu au tour suivant (hook `Stop`) sans boucle de
polling ; un `/start` sur la zone `design` affiche l'`inbox/design/` accumulé ; `/close` signale
un message non acquitté.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact`. Roadmap close une fois les 3
phases `[FAIT]` et le test manuel de bout en bout validé.

---

## Hors périmètre (à réévaluer après)

- Fusionner `queue.json` / `commands.json` dans `gateway/` (un seul transport). Gros risque de
  régression sur `/discord_loop`, gain surtout cosmétique — laissé de côté.
- Historique append-only côté Supabase (déjà hors périmètre dans `roadmap_sav_snapshot_marie.md`).
- Escalade « message urgent » (notification push hors Discord) — dépend d'un besoin réel constaté.
