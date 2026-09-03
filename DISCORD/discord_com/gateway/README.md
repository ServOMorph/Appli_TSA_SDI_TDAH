# Gateway DISCORD — protocole pour les autres agents

À partir du 2026-09-02, **toute communication Discord passe par l'agent DISCORD**.

## Interdits (orchestrateur, design, tout agent hors DISCORD)

- Ne pas appeler `DISCORD/discord_com/message_marie.py`.
- Ne pas appeler l'API Discord (REST, webhook) directement.
- Ne pas importer ni utiliser `DISCORD/discord_com/claude_bridge.py`
  (`envoyer` / `notifier`).
- Ne pas écrire dans `queue.json` / `commands.json`.

## Envoyer un message Discord

Déposer une demande dans `DISCORD/discord_com/gateway/outbox/`.

### En ligne de commande

```
python DISCORD/discord_com/gateway.py enqueue \
  --source orchestrateur \
  --to marie \
  --kind question \
  --expect-reply \
  --file corps_du_message.txt
```

### En Python

```python
import sys
sys.path.insert(0, "DISCORD/discord_com")
import gateway
gateway.enqueue("orchestrateur", "marie", corps, kind="question", expect_reply=True)
```

### Champs

| champ          | valeurs                          | rôle |
|----------------|----------------------------------|------|
| `source`       | `orchestrateur`, `design`, …     | agent demandeur (pour le routage de la réponse) |
| `to`           | `marie` \| `morpheus` \| `channel` | destinataire |
| `kind`         | `info` \| `question` \| `delivery` | nature du message |
| `expect_reply` | booléen                          | si vrai, la prochaine réponse Discord **de ce destinataire** est routée vers `source` |
| `body`         | texte                            | contenu **au fond définitif** : question et options de réponse figées |

Une demande naît en `status: "pending"`. **Rien ne part sur Discord tant que le gardien de
sortie ne l'a pas approuvée.**

## Le gardien de sortie (agent DISCORD)

Depuis le 2026-09-03, chaque demande de l'outbox porte un `status` :

| statut     | sens |
|------------|------|
| `pending`  | déposée, en attente de jugement (défaut) |
| `approved` | autorisée à sortir — **seul statut que `drain` envoie** |
| `held`     | fond bon, moment inopportun ; reprise au cycle suivant |
| `bounced`  | renvoyée à son auteur avec un motif ; retirée de l'outbox, jamais envoyée |
| `failed`   | envoi Discord échoué ; reste dans l'outbox, ré-approuvable pour retenter |

L'agent DISCORD relit chaque demande, ajuste **ton, format, longueur, moment d'envoi et
regroupement** pour que le fil reste lisible pour Marie et Morphéus, puis tranche :

```
python DISCORD/discord_com/gateway.py approve --id <id>
python DISCORD/discord_com/gateway.py hold    --id <id> --reason "question déjà en attente"
python DISCORD/discord_com/gateway.py bounce  --id <id> --reason "fond non figé"
python DISCORD/discord_com/gateway.py merge   --ids <id>,<id>
```

- **Ne modifie jamais le fond** : la question posée et les options de réponse restent celles
  fournies dans `body`. Si le fond doit changer, il `bounce` — le message repart dans
  `inbox/<source>/` avec le motif, **jamais sur Discord**.
- Critères de rejet arrêtés : doublon · réponse déjà connue · fond non figé
  (`<placeholder>`, choix non tranché, TODO) · hors périmètre canal (jargon, hash, chemins)
  · incohérence de version. Détail dans `roadmap_gateway_discord_service.md`.
- `marie` : encadrement `💻🤖`, tag, ton non technique, une idée par phrase, sans politesse
  (règle `CLAUDE.md`).

**L'envoi lui-même est automatique** : `bot.py` appelle `gateway.drain()` toutes les 5 s et
n'envoie que les `approved`. Il journalise dans `logs/conversation.jsonl` (`role: GATEWAY`)
et archive dans `outbox/sent/`. Plus personne ne lance `drain` à la main.

Un échec d'envoi ne coupe pas la boucle : la demande passe en `failed` et une alerte
`kind: "dead-letter"` est déposée dans `inbox/discord/`.

## Recevoir un renvoi (`bounce`)

Un message rejeté par le gardien arrive dans **ton propre `inbox/`** avec
`kind: "bounce"`, `reason` (le motif), `original_id`, `original_body`, `original_to`. Il se
lit avec le `poll` habituel. Corriger le fond, puis `enqueue` une nouvelle demande.

## Recevoir une réponse

Depuis le 2026-09-03, **`bot.py` route mécaniquement tout message du canal** qui n'est pas
une commande @bot, sans attendre que l'agent DISCORD soit en session. Les messages qui te
sont destinés arrivent dans `DISCORD/discord_com/gateway/inbox/<ton_nom>/` (un JSON par
message). Destination choisie par : tag `@<ton_nom>:` explicite en tête du message Discord,
sinon `expect_reply` de ta demande (appariée à l'auteur), sinon heuristique par mots-clés,
sinon `inbox/unrouted/` (trié par l'agent DISCORD).

Plusieurs questions peuvent attendre une réponse en même temps (`state.pending_replies`) :
une réponse entrante s'apparie à la demande **la plus récente pour ce destinataire**, les
autres restent en attente.

Lecture et acquittement :

```
python DISCORD/discord_com/gateway.py poll --agent orchestrateur
python DISCORD/discord_com/gateway.py ack  --agent orchestrateur --id <id>
```

ou en Python :

```python
import sys; sys.path.insert(0, "DISCORD/discord_com")
import gateway
for msg in gateway.poll("orchestrateur"):
    traiter(msg)                      # msg["content"], msg["from_discord"], msg["routing"]
    gateway.ack("orchestrateur", msg["id"])
```

Champs d'un message inbox : `id`, `from_discord` (`author_id`, `author_name`), `content`
(corps sans le tag), `raw_content`, `attachments` (liste `{filename, url, content_type}` —
une réponse peut n'être qu'une capture), `routing` (`tag` | `pending` | `heuristique` |
`aucune` | `bounce` | `dead-letter`), `reply_to` (le pending d'origine si
`routing == "pending"`), `received_at`. Un `bounce` ou une `dead-letter` porte en plus
`kind`, `reason` et les champs `original_*`.

## Registre d'agents

`gateway/agents.json` : **un agent = une zone** (`.claude/zones.md`). Le nom d'agent est le
nom de zone, ou son `alias` (`Appli_TSA_SDI_TDAH` → `orchestrateur`). `poll`, `ack` et les
tags `@…:` acceptent l'un ou l'autre. Les `keywords` de chaque entrée alimentent
l'heuristique de routage. Un nouvel agent = une zone dans `zones.md` + une entrée ici.

```
python DISCORD/discord_com/gateway.py agents   # registre + réponses attendues
```

## Limites connues

- Si l'agent DISCORD ne tourne pas (`/discord_loop` inactif), personne n'approuve :
  l'`outbox/` s'accumule en `pending` sans livraison. Aucun message n'est perdu, tout part
  dès la première revue du gardien. Le routage **entrant**, lui, ne dépend pas de sa
  présence (fait par `bot.py`), et l'**envoi** des `approved` non plus.
- Si `bot.py` est arrêté, rien ne sort non plus : c'est lui qui draine.
- Un message d'un auteur inconnu de la gateway (ni Marie ni Morphéus) ne peut pas s'apparier
  à une réponse attendue : il part à l'heuristique, sinon dans `inbox/unrouted/`.
