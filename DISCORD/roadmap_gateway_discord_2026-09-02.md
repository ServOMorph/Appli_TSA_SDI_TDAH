# Roadmap — Gateway DISCORD (émission/réception centralisées)

Créée le 2026-09-02. Zone : `discord`.

## Problème

Les autres agents du projet (orchestrateur racine, design) écrivent sur Discord par des
chemins directs et non coordonnés :
- `DISCORD/discord_com/message_marie.py` : POST REST Discord direct, hors `bot.py`, hors agent
  discord. Utilisé aujourd'hui par l'orchestrateur pour poser 2 questions produit à Marie.
- `DISCORD/discord_com/claude_bridge.py` (`envoyer`/`notifier`) : écrit directement dans
  `queue.json`, importable par n'importe quel agent.

Conséquence : le fil Discord devient incohérent pour Marie et Morphéus (tons mélangés,
messages non ordonnés, pas de curation), et les réponses entrantes ne sont pas routées vers
l'agent qui a posé la question.

## Cible

L'agent DISCORD est **l'unique passerelle** entrée/sortie Discord.
- Sortie : les autres agents déposent une demande dans `gateway/outbox/`. L'agent DISCORD la
  relit, ajuste ton/format/timing **sans modifier le fond** (question et options verrouillées),
  regroupe pour la lisibilité, puis envoie via un transport unique.
- Entrée : l'agent DISCORD lit les messages Discord et route ceux destinés à un autre agent
  dans `gateway/inbox/<agent>/`.
- Aucun autre agent n'appelle `message_marie.py`, l'API Discord, ni `claude_bridge`.

## Angles morts actés (hors périmètre, décision utilisateur)

- Identité « Rayonne Toi » (`rayonnetoi_59304`, id `1368654289584656394`) : supposée Marie par
  `message_marie.py`, comportement observé = compte de test. À confirmer avant tout envoi réel.
- Double canal vers Marie : bridge ROBERTO (`POST /send`, `CLAUDE.md`) vs Discord. À unifier.
- Point de défaillance unique : si l'agent DISCORD ne tourne pas, l'`outbox/` s'accumule sans
  livraison. Tradeoff assumé ; l'`outbox/` est durable et rejouée au démarrage.

---

## Phase 1 — Sortie (outbox) + transport unifié  [FAIT]

- `DISCORD/discord_com/gateway/` : `outbox/`, `outbox/sent/`, `inbox/`, `state.json`.
- `gateway.py` :
  - `enqueue(source, to, body, kind, expect_reply, meta)` -> id (API des autres agents).
  - `drain(send_fn, dry_run)` : traite `outbox/*.json` du plus ancien au plus récent, applique
    `curate`, envoie, journalise dans `conversation.jsonl` avec `source`/`to`, archive dans
    `outbox/sent/`, enregistre la réponse attendue dans `state.json`. Ignore `hold: true`.
  - `curate(to, kind, body)` : formatage mécanique par destinataire. `marie` -> encadrement
    `💻🤖` + tag (via `message_marie`). `morpheus`/`channel` -> corps inchangé.
- `message_marie.py` : refacto minimal — `_send` accepte `allowed_user_ids`, en-tête « transport
  bas niveau, appelé uniquement par la gateway ». CLI conservé.
- `gateway/LOOP.md` : étapes ajoutées à la boucle de l'agent DISCORD (revue outbox -> ajustement
  du fond conservé -> drain).
- `gateway/README.md` : protocole complet pour les autres agents (format, interdits, réception).
- `test_gateway.py` : unittest stdlib — enqueue, ordre du drain, curation Marie, `hold`,
  archivage, `state.json`.
- Seed `state.json` : réponse Marie du 2026-09-02 13:11 (2 questions orchestrateur) attendue
  -> routée vers `inbox/orchestrateur/` en Phase 2.
- Livrable annexe : message prêt à coller pour l'orchestrateur (presse-papier).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Entrée (inbox) + routage des réponses  [FAIT]

- `gateway.py` :
  - `route_inbound(author_id, author_name, content)` : si une réponse est attendue
    (`state.json`), écrit dans `inbox/<source>/<id>.json` et purge le pending ; sinon classe la
    cible (tag explicite `@agent:` en tête, sinon heuristique) et écrit dans `inbox/<agent>/`.
  - `poll(agent)` / `ack(agent, id)` : helper de lecture pour les autres agents.
- Câblage dans la boucle `/discord_loop` : chaque cycle `wait` -> `route_inbound` si le message
  ne m'est pas adressé.
- `test_gateway.py` : routage réponse, tag explicite, purge du pending, `poll`/`ack`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Adoption par les autres agents  [FAIT côté discord — adoption orchestrateur en cours]

- Message final pour l'orchestrateur : appliquer le protocole, mettre à jour son `agent_role.md`
  et celui de `design` (l'orchestrateur le fait, pas l'agent DISCORD), retirer les appels
  directs (`message_marie.py`, `claude_bridge`) de ses commandes (`deploy.md`,
  `analyser_googledoc.md`, …).
- Décision utilisateur : canal Marie unique (Discord ou ROBERTO), identité « Rayonne Toi ».
- `message_marie.py` : garde interne uniquement (refus si non appelé par la gateway).
- Nettoyage : `claude_bridge.py` déprécié ou restreint.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite.

---

## Statuts

- Phase 1 : [FAIT] (2026-09-02)
- Phase 2 : [FAIT] (2026-09-02) — 19 tests unittest verts
- Phase 3 : [FAIT côté discord] (2026-09-02) — garde `message_marie.py`, dépréciation `claude_bridge.py`,
  message final orchestrateur livré. `CLAUDE.md` aligné (sections « Communication Discord »
  et « Messages pour Marie ») et câblage `discord_loop.md` étape 3b présent (bloc « Aiguillage
  préalable », vérifié 2026-09-03). Reste hors zone (suivi dans `_contexte/signals.md`) :
  MAJ `agent_role.md` orchestrateur+design, retrait des appels directs dans `deploy.md`/
  `analyser_googledoc.md`.
- Décisions Morphéus 2026-09-02 : canal Marie = Discord via gateway ; « Rayonne Toi » = Marie.
