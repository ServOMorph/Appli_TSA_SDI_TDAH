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
| `expect_reply` | booléen                          | si vrai, la prochaine réponse Discord du destinataire est routée vers `source` |
| `body`         | texte                            | contenu **au fond définitif** : question et options de réponse figées |

## Ce que fait l'agent DISCORD

- Relit chaque demande, ajuste **ton, format, longueur, moment d'envoi et regroupement**
  pour que le fil reste lisible pour Marie et Morphéus.
- **Ne modifie pas le fond** : la question posée et les options de réponse restent celles
  fournies dans `body`. Si le fond doit changer, l'agent DISCORD renvoie la demande à `source`.
- `marie` : encadrement `💻🤖`, tag, ton non technique, une idée par phrase, sans politesse
  (règle `CLAUDE.md`).
- Envoie, journalise dans `logs/conversation.jsonl` (`role: GATEWAY`), archive dans
  `outbox/sent/`.

## Recevoir une réponse

L'agent DISCORD dépose les messages entrants qui te sont destinés dans
`DISCORD/discord_com/gateway/inbox/<ton_nom>/` (un JSON par message). Destination choisie
par : tag `@<ton_nom>:` explicite en tête du message Discord, sinon `expect_reply` de ta
demande, sinon heuristique par mots-clés.

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
(corps sans le tag), `raw_content`, `routing` (`tag` | `pending` | `heuristique` | `aucune`),
`reply_to` (le pending d'origine si `routing == "pending"`), `received_at`.

## Limites connues

- Si l'agent DISCORD ne tourne pas (`/discord_loop` inactif), l'`outbox/` s'accumule sans
  livraison ; elle est rejouée au prochain démarrage. Aucun message n'est perdu.
