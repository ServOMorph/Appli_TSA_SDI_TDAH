# Boucle de l'agent DISCORD — étapes gateway

À exécuter à chaque cycle de `/discord_loop`, en plus de `discord_loop.py wait`.

## 1. Drainer l'outbox (avant le `wait`)

```
python DISCORD/discord_com/gateway.py list
```

Pour chaque demande en attente :
- Lire `body`. Vérifier qu'elle est lisible pour son destinataire (`to`).
- Si le ton / le format / la longueur doivent être ajustés : éditer le champ `body` du
  fichier `gateway/outbox/<id>.json` **sans changer le fond** (question, options).
- Si le moment n'est pas opportun (rafale de messages, question déjà en attente de réponse) :
  mettre `"hold": true` dans le fichier ; il sera repris au cycle suivant.
- Regrouper si plusieurs `info` courtes vers le même destinataire gagnent à être fusionnées
  (fusionner les `body`, supprimer les fichiers redondants).

Puis :

```
python DISCORD/discord_com/gateway.py drain --dry-run   # contrôle du rendu final
python DISCORD/discord_com/gateway.py drain             # envoi réel
```

## 2. Router les entrants (après le `wait`)

Quand `discord_loop.py wait` renvoie un message :
- S'il m'est adressé (agent DISCORD : `@bot`, sujet Discord/communication) : traiter
  directement, répondre via `discord_loop.py send`.
- Sinon : router vers l'agent concerné.

```python
import sys; sys.path.insert(0, "DISCORD/discord_com")
import gateway
gateway.route_inbound(author_id, author_name, content)
```

ou en CLI : `python DISCORD/discord_com/gateway.py route --author-id <id> --text "..."`.

`route_inbound` choisit la destination par ordre de priorité :
1. tag explicite `@orchestrateur:` / `@design:` en tête → `inbox/<agent>/` (le tag est retiré
   du corps stocké, `raw_content` conserve l'original) ;
2. réponse attendue (`state.json` → `pending_reply`) → `inbox/<source>/`, pending purgé ;
3. heuristique par mots-clés (`_HEURISTIQUE` dans `gateway.py`) → `inbox/<agent>/` ;
4. aucun signal → `inbox/unrouted/` (à traiter manuellement au cycle suivant).

Chaque message routé porte un champ `routing` (`tag` | `pending` | `heuristique` | `aucune`).
Vider `inbox/unrouted/` à chaque cycle : relire, puis re-router à la main
(`gateway.route_inbound` après avoir préfixé le contenu du bon `@agent:`) ou répondre soi-même.

## 2 bis. Câblage `/discord_loop`

L'appel `route_inbound` s'insère à l'étape 3b de `.claude/commands/discord_loop.md` (périmètre
racine, modif par l'orchestrateur) : si le message reçu ne m'est pas adressé, le passer à
`route_inbound` au lieu de le traiter, puis reboucler sur `wait` sans `send`.
Les autres agents récupèrent leurs messages via `gateway.poll("<agent>")` puis
`gateway.ack("<agent>", id)` une fois traités.

## 3. Ne jamais

- Laisser un autre agent poster en direct : si une trace `author: message_marie.py` ou
  `claude_bridge` apparaît dans `conversation.jsonl`, le signaler à l'orchestrateur.
