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

## Phase 1 — Fondations : `bot.py` transmet tout, registre d'agents, `pending_replies[]`, verrous [TODO]

Traite les constats 1, 2, 6, 7, 8.

- [ ] **`gateway/agents.json`** (neuf) : registre `{ "<zone>": { "path": "...", "keywords": [...] } }`
  pour `Appli_TSA_SDI_TDAH` (alias interne `orchestrateur`), `design`, `discord`. Un champ
  `alias` optionnel porte `orchestrateur` pour la zone principale (compat des chemins `inbox/`
  existants `inbox/orchestrateur/`, `inbox/design/`).
- [ ] **`gateway.py`** : charger le registre au lieu du tuple `AGENTS` en dur ; `_HEURISTIQUE`
  construit depuis les `keywords` du registre. `route_inbound` accepte un nom d'agent = nom de zone
  ou alias.
- [ ] **`gateway.py`** : `state.json` — `pending_reply` (objet) → `pending_replies` (liste),
  chaque entrée `{ request_id, source, to, since }`. `enqueue --expect-reply` ajoute ; une réponse
  entrante s'apparie à l'entrée **la plus récente pour le même `to`** et la retire (les autres
  restent). Migration : lire un ancien `pending_reply` objet et le convertir en liste à 1 élément.
- [ ] **`gateway.py`** : écritures atomiques (`tmp` + `os.replace`) pour `state.json` et tout fichier
  de spool ; verrou fichier (`msvcrt.locking` sur Windows, ou un `.lock` par `os.O_CREAT|O_EXCL`
  avec retry court) autour de chaque read-modify-write de `state.json`.
- [ ] **`bot.py`** : dans `on_message`, après journalisation et après les commandes autonomes,
  **tout message du canal qui n'est pas une commande @bot** → `gateway.route_inbound(author_id,
  author_name, content)`. Conserver le chemin `commands.json` **uniquement** pour les messages qui
  @-mentionnent le bot (canal de contrôle `/discord_loop`). Retirer le `return` sec de `bot.py:177`
  pour la branche transmission.
- [ ] **`bot.py`** : au démarrage, si `commands.json.status == "processing"` depuis plus de N
  minutes (session `/discord_loop` tombée), le loguer et repasser `idle` (récupération orphelin).
- [ ] **`test_gateway.py`** : registre chargé depuis `agents.json` ; `pending_replies[]` (ajout,
  appariement au plus récent par `to`, entrées multiples) ; routage mécanique d'un message sans
  @bot ; deux writers concurrents sur `state.json` ne corrompent pas le fichier.

**Critère de sortie** : `test_gateway.py` vert ; test manuel dev = un message Discord **sans**
@-mention du bot, tagué `@design:`, atterrit dans `gateway/inbox/design/` ; une 2ᵉ question
`--expect-reply` n'écrase pas la 1ʳᵉ ; `bot.py` redémarré via `bot_manager.py restart`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Gardien de sortie : approbation, `bounce`, drain automatique par `bot.py` [TODO]

Traite les constats 4 et 9.

- [ ] **`gateway.py`** : statut sur chaque fichier outbox — `pending` (défaut) → `approved` |
  `held` | `bounced` | `failed`. Verbes CLI + fonctions :
  - `approve --id <id>` : `pending`/`held` → `approved`.
  - `hold --id <id> [--reason]` : → `held` (repris au cycle suivant).
  - `bounce --id <id> --reason "<motif>"` : déplace le fichier vers `inbox/<source>/` en
    `{ kind: "bounce", reason, original_body, original_id }` ; retiré de l'outbox.
  - `merge --ids <id,id,...>` : fusionne les `body` dans le plus ancien, supprime les autres.
- [ ] **`gateway.py`** : `drain` ne traite plus que les items `approved` ; sur échec d'envoi
  (`send_fn` lève), attraper → statut `failed` + dépôt `inbox/discord/` (dead-letter visible) +
  continuer la boucle au lieu de l'interrompre.
- [ ] **`bot.py`** : sa `boucle_polling` appelle `gateway.drain()` (items `approved` uniquement) à
  chaque tour. Plus aucun `drain` manuel nulle part.
- [ ] **`discord_loop.md`** (réécrit, périmètre racine — modif orchestrateur) : par cycle, avant le
  `wait`, revoir chaque `outbox/*.json` en `pending` selon la **liste de critères de rejet** ci-dessus
  → `approve` / `hold` / `bounce` / `merge`. Puis vider `inbox/unrouted/` (re-router ou répondre).
  Le routage mécanique et le `drain` ne sont plus de son ressort (faits par `bot.py`).
- [ ] **`CLAUDE.md`** § Communication Discord : contrat du gardien + liste des critères ;
  préciser que `bot.py` draine les `approved` et que `gateway.py drain` en direct reste interdit
  aux autres agents (règle déjà posée le 2026-09-03).
- [ ] **`gateway/README.md`** + **`gateway/LOOP.md`** : mise à jour (statuts outbox, `bounce`,
  drain automatique).
- [ ] **`test_gateway.py`** : `bounce` écrit bien dans `inbox/<source>/` avec motif ; un `pending`
  non `approved` n'est jamais envoyé par `drain` ; échec d'envoi simulé → `failed` + dead-letter,
  la boucle continue.

**Critère de sortie** : tests verts ; test manuel dev = un `enqueue` avec `<placeholder>` dans le
corps est `bounce` vers `inbox/orchestrateur/` avec motif « fond non figé » ; un `enqueue` propre
est `approve` puis envoyé par `bot.py` sans intervention.

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
