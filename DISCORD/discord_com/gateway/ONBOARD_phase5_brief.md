De : orchestrateur (roadmap_integration_onboard.md, Phase 5)
Objet : Canaux Discord testeurs + routage gateway — chantier délégué à la zone discord

## Pourquoi ce brief

La Phase 5 de `roadmap_integration_onboard.md` touche `agents.json`, `curate()` et `bot.py`.
Invariant de la roadmap : la coordination passe par la zone discord, sans contourner le gardien
de sortie. L'orchestrateur ne modifie donc pas ces fichiers — il pose ici la spécification et
laisse la zone discord conduire l'implémentation, les tests et l'approbation outbox.

Phases 1-4 livrées sur `main` (v5.107 à v5.110, non déployées). Phase 3 = champ `tester_code?`
sur `Settings`, saisi dans E111Profile, sérialisé dans le snapshot. Un testeur est donc
identifiable par son code, pas par un compte.

## Décision produit à respecter (decisions_dispositif.md, Décision 5)

Visibilité **strictement asymétrique** :
- Marie voit les retours des testeurs et les commente dans un canal privé.
- Aucun testeur ne voit l'avis de Marie, ni l'existence du canal de supervision.

## État du code (relevé 2026-09-08)

- `gateway.py:79` : `TARGETS = ("marie", "morpheus", "channel")`. `enqueue()` (ligne 313) rejette
  tout `to` hors de ce tuple.
- `gateway.py:476-488` `curate()` : `to == "marie"` → cadre `FRAME` (💻🤖) + `<@MARIE_USER_ID>`
  + salutation tirée de `salutations_marie.json`. Branche `else` → corps brut, sans cadre.
- `gateway.py:491-496` `_mention_ids()` : `marie` → `[MARIE_USER_ID]`, `morpheus` →
  `[MORPHEUS_USER_ID]`, sinon `[]`.
- `gateway.py:499-504` `_discord_post()` : **un seul canal**, `message_marie._read_channel_id()`
  (`config_bot_discord.json` → `channel_id` unique). Aucun routage par destinataire.
- `gateway.py:94` `_AUTHOR_TARGET = {MARIE_USER_ID: "marie", MORPHEUS_USER_ID: "morpheus"}`.
  `route_inbound()` (ligne 643) : auteur inconnu → pas d'appariement `pending`, chute sur
  heuristique mots-clés puis `inbox/unrouted/`.
- `gateway.py:286-294` `has_pending_reply()` : `_target_from_author()` renvoie `None` pour un
  auteur inconnu → une réponse de testeur ne s'auto-route pas.

## Périmètre code (zone discord)

1. **`agents.json`** : entrée pour l'agent testeur (nom, `keywords` de routage). Décider si la
   supervision de Marie est une cible distincte (`marie_supervision`) ou l'actuel `marie` posté
   sur un autre canal.
2. **Config canaux** : `_discord_post()` ne connaît qu'un `channel_id`. Introduire une table
   `cible → channel_id` (canal testeurs, canal supervision privé Marie, canal actuel par
   défaut). Les IDs viennent de Morphéus (voir dépendance externe).
3. **`gateway.py`** :
   - `TARGETS` += cible(s) testeur / supervision.
   - `drain()` / `_discord_post()` : poster sur le canal de la cible, pas le canal unique.
   - `curate()` : cible testeur → aucun `FRAME`, aucune salutation Marie (la branche `else`
     convient, à confirmer).
   - `_mention_ids()` : cible testeur → **jamais** `MARIE_USER_ID`. Point de fuite le plus
     direct de l'avis de Marie vers le canal testeurs.
   - Entrant : `author_id` testeur → cible testeur. Tant que le registre `code testeur →
     author_id` n'existe pas (gate de mise en service, point 6 de la roadmap), les messages
     testeurs tombent dans `inbox/unrouted/` et le gardien les route à la main — acceptable
     pour démarrer.
4. **Tests suite discord** : visibilité asymétrique dans les deux sens —
   - un message `to` supervision ne part jamais sur le canal testeurs et ne porte aucune
     mention visible d'un testeur ;
   - un message `to` testeur ne part jamais sur le canal supervision et ne porte jamais
     `<@MARIE_USER_ID>` ni le cadre `FRAME` ;
   - un commentaire de Marie sur un retour testeur reste sur le canal supervision.

## Dépendance externe (bloquante pour le gate)

Les deux canaux Discord n'existent pas. Morphéus (admin serveur) doit :
- créer `#testeurs` (testeurs écrivent, Marie lit) ;
- créer un canal privé de supervision (Marie lit/écrit, testeurs ne le voient pas) ;
- poser les permissions et fournir les deux `channel_id`.

Le gate de sortie (« le test de visibilité asymétrique passe dans les deux sens ») exige ces
canaux réels + au moins une identité testeur réelle. Le code et ses tests unitaires (channel_id
mockés) peuvent être écrits avant ; le gate, non.

## Gardien de sortie

Inchangé : le gardien de sortie de la session discord reste le seul à approuver les envois, y
compris sur les nouveaux canaux.
