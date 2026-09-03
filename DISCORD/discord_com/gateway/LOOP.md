# Boucle de l'agent DISCORD — étapes gateway

À exécuter à chaque cycle de `/discord_loop`, en plus de `discord_loop.py wait`.

## 1. Juger l'outbox (avant le `wait`) — rôle de gardien de sortie

```
python DISCORD/discord_com/gateway.py list                # statut de chaque demande
python DISCORD/discord_com/gateway.py drain --dry-run     # rendu final, tous statuts, n'envoie rien
```

Pour chaque demande en `pending` (ou `held` repris) :
- Lire `body`. Vérifier qu'elle est lisible pour son destinataire (`to`).
- Si le ton / le format / la longueur doivent être ajustés : éditer le champ `body` du
  fichier `gateway/outbox/<id>.json` **sans changer le fond** (question, options).
- Puis trancher, par ordre de test :

| test | verdict |
|------|---------|
| Même fond déjà envoyé récemment (`outbox/sent/`, `logs/conversation.jsonl`), rien de neuf | `bounce` « doublon » |
| La question a déjà sa réponse, ou l'info figure déjà dans un message envoyé | `bounce` « réponse déjà connue » |
| `<placeholder>`, choix non tranché, options de réponse manquantes, TODO | `bounce` « fond non figé » |
| Message pour Marie truffé de mécanique interne (hash, chemins, jargon) | `bounce` « hors périmètre canal » |
| Version / URL / fonctionnalité incohérente avec `_contexte/dernier_deploiement.md` | `bounce` « incohérence de version » |
| Fond bon, mais une question est déjà en attente de réponse de Marie et celle-ci n'y est pas liée | `hold` |
| Plusieurs `info` courtes vers le même destinataire, fusionnables sans réécriture | `merge` |
| tout le reste | `approve` |

```
python DISCORD/discord_com/gateway.py approve --id <id>
python DISCORD/discord_com/gateway.py hold    --id <id> --reason "<motif>"
python DISCORD/discord_com/gateway.py bounce  --id <id> --reason "<motif>"
python DISCORD/discord_com/gateway.py merge   --ids <id>,<id>
```

**Ne jamais reformuler le fond à la place de l'auteur** : `bounce` renvoie le message dans
`inbox/<source>/` avec le motif, il ne part pas sur Discord.

**Ne pas lancer `drain`.** `bot.py` envoie les `approved` tout seul, toutes les 5 s. Une
demande qui reste en `pending` est un choix, pas une panne.

Surveiller aussi `inbox/discord/` : un `kind: "dead-letter"` signale un envoi Discord échoué,
la demande est alors en `failed` dans l'outbox. Diagnostiquer, puis `approve` pour retenter.

## 2. Trier `inbox/unrouted/` (après le `wait`)

Depuis le 2026-09-03, **le routage entrant est mécanique et fait par `bot.py`** : tout message
du canal qui n'@-mentionne pas le bot part directement dans `gateway.route_inbound`, que
l'agent DISCORD soit en session ou non. Il n'y a plus de `route_inbound` à lancer à la main
pour le trafic normal.

`route_inbound` choisit la destination par ordre de priorité :
1. tag explicite `@orchestrateur:` / `@design:` / `@<zone>:` en tête → `inbox/<agent>/` (le tag
   est retiré du corps stocké, `raw_content` conserve l'original) ;
2. réponse attendue de cet auteur (`state.json` → `pending_replies`, entrée la plus récente
   pour sa cible) → `inbox/<source>/`, cette seule entrée retirée ;
3. heuristique par mots-clés (`keywords` de `gateway/agents.json`, départage au nombre de
   mots-clés trouvés) → `inbox/<agent>/` ;
4. aucun signal → `inbox/unrouted/`.

Chaque message routé porte un champ `routing` (`tag` | `pending` | `heuristique` | `aucune`)
et ses `attachments` (captures de Marie incluses).

**Reste à ma charge à chaque cycle** : vider `inbox/unrouted/` — relire, puis re-router
(`gateway.route_inbound` après avoir préfixé le contenu du bon `@agent:`) ou répondre soi-même.

```
python DISCORD/discord_com/gateway.py poll --agent unrouted
python DISCORD/discord_com/gateway.py poll --agent discord    # bounces et dead-letters
python DISCORD/discord_com/gateway.py agents                  # registre + réponses attendues
```

Les autres agents récupèrent leurs messages via `gateway.poll("<agent>")` puis
`gateway.ack("<agent>", id)` une fois traités.

## 3. Ne jamais

- Laisser un autre agent poster en direct : si une trace `author: message_marie.py` ou
  `claude_bridge` apparaît dans `conversation.jsonl`, le signaler à l'orchestrateur.
- Lancer `gateway.py drain` à la main : c'est le travail de `bot.py`. Si une demande
  `approved` ne part pas, c'est que `bot.py` est arrêté — le signaler, pas le contourner.
- Reformuler le fond d'une demande pour la rendre approuvable : `bounce` avec le motif.
