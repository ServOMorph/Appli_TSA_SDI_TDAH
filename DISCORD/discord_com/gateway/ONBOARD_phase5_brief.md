De : orchestrateur (roadmap_integration_onboard.md, Phase 5)
Objet : Canaux Discord testeurs + routage gateway — chantier délégué à la zone discord
Révisé le 2026-09-08 : modèle un canal par testeur (décision Morphéus).

## Pourquoi ce brief

La Phase 5 de `roadmap_integration_onboard.md` touche `agents.json`, `curate()`, `_mention_ids()`,
`_discord_post()` et `bot.py`. Invariant de la roadmap : la coordination passe par la zone discord,
sans contourner le gardien de sortie. L'orchestrateur pose la spécification, la zone discord
conduit l'implémentation, les tests et l'approbation outbox.

Phases 1-4 livrées sur `main` (v5.107 à v5.110, non déployées). Phase 3 = champ `tester_code?`
sur `Settings`, saisi dans E111Profile, sérialisé dans le snapshot. Un testeur est identifiable
par son code, pas par un compte.

## Décision produit (decisions_dispositif.md, Décision 5)

Visibilité **strictement asymétrique** :
- Marie voit les retours des testeurs et les commente dans un canal privé.
- Aucun testeur ne voit l'avis de Marie ni l'existence du canal de supervision.

## Modèle de canaux (révisé — un canal par testeur)

| Canal | Membres | Rôle |
|---|---|---|
| `#test-<code>` (un par testeur, ex. `#test-satine`) | le testeur, Marie, bot | retours du testeur ; Marie lit et peut répondre en clair |
| `#supervision` (unique, privé) | Marie, bot | Marie commente les retours de tous les testeurs ; aucun testeur |

Convention : `#test-<tester_code en minuscules>`. Marie est membre de chaque `#test-*` ; un
testeur n'est membre que du sien. Premier testeur : **Satine** (`tester_code` = `satine`).

## État du code après commit 78733bd

`78733bd` a implémenté un modèle à **2 cibles fixes** (`testeurs`, `marie_supervision`). Le
passage à un canal par testeur impose de **paramétrer par code testeur**. Ce qui est réutilisable
tel quel :
- garde-fou anti-fuite de `curate()` (refus si `FRAME` 💻🤖 ou `<@MARIE_USER_ID>` dans un corps
  destiné à un testeur) ;
- `_mention_ids()` cible testeur → `[]`, jamais `MARIE_USER_ID` ;
- `_channel_id_for()` : canal non configuré → `GatewayError`, aucun repli silencieux sur le
  canal principal ;
- `_discord_post()` / `drain()` postent sur le canal de la cible ;
- classe de tests `VisibiliteAsymetriqueTest`.

Ce qui est à retravailler :
- `TARGETS` : `testeurs` unique → cibles paramétrées par code (`testeur:<code>` ou résolution
  d'un code testeur passé dans `enqueue`). `marie_supervision` reste unique.
- Config : `config_bot_discord.json > channels` devient un registre
  `tester_code → { channel_id, discord_member_id }`, plus `supervision → channel_id`.
  `config_bot_discord.example.json` à mettre à jour.
- `route_inbound()` : `author_id` d'un testeur connu → `inbox/testeurs/<code>/` (routing
  `testeur`) ; inconnu → `unrouted` (toléré). Tag explicite reste prioritaire. Ne consomme pas
  le pending de Marie.
- `agents.json` : entrée par testeur, ou une entrée `testeurs` portant la table des codes →
  `member_id`. `bot.py` : `on_message` filtre `channel.id != CHANNEL_ID` — écoute multi-canal
  entrante à ajouter (bloqué sur les canaux réels).

## pending_reply à purger

`78733bd` a fait déposer une question à Morphéus dans la gateway (`--expect-reply`,
`sent/20260908T165439_677262.json`) — une entrée `pending_replies` pour Morphéus attend une
réponse Discord. **Morphéus fournit les identifiants en direct, pas sur Discord** : purger cette
entrée de `state.json` au prochain `/start discord` (elle bloquerait un `hold` sur tout message
vers Morphéus sinon).

## Identifiants fournis par Morphéus (2026-09-08)

Canaux créés sur le serveur, permissions asymétriques posées :
- `#test-satine` channel_id : `1546945011340542022`
- `#supervision` channel_id : `1544665195476160512`
- Satine n'a pas encore rejoint le serveur. member_id provisoire pour exécuter le gate :
  `651446274939420672` (= Morphéus).

**Collision à traiter** : `651446274939420672` est déjà `MORPHEUS_USER_ID` (`gateway.py:92`,
`_AUTHOR_TARGET[MORPHEUS_USER_ID] = "morpheus"`). Un message de cet auteur passé à
`route_inbound()` résoudra `morpheus` avant d'atteindre le routage testeur. Pour le gate :
tester le routage entrant avec un member_id fictif distinct (test unitaire), et ne câbler le
vrai member_id de Satine dans `config_bot_discord.json` qu'une fois qu'elle a rejoint. Ne pas
inscrire `651446274939420672` comme member_id testeur dans la config réelle.

## Gate de sortie

Test de visibilité asymétrique dans les deux sens sur canaux réels : un message `testeur:satine`
ne part jamais sur `#supervision` et ne porte ni `FRAME` ni `<@MARIE_USER_ID>` ; un message
`marie_supervision` ne part jamais sur `#test-satine` ; un commentaire de Marie sur un retour
de Satine reste sur `#supervision`. Exige les canaux réels + l'identité Satine.

## Gardien de sortie

Inchangé : le gardien de sortie de la session discord reste le seul à approuver les envois, y
compris sur les nouveaux canaux.

## Décisions Morphéus 2026-09-08 (après gate `a40a31d`) — passe 3

1. **Supervision fusionnée avec le canal Marie principal.** `channels.supervision` =
   `1544665195476160512` = `channel_id` principal, définitif et volontaire. Livraisons /
   questions à Marie et supervision des retours testeurs partagent le salon. La cible
   `marie_supervision` reste distincte (formatage : tag Marie, sans cadre ni salutation).
   Rien à changer en config ; le documenter comme choix assumé.

2. **`bot.py` écoute multi-canal entrante — à faire maintenant (passe 3).** Aujourd'hui
   `on_message` filtre `channel.id != CHANNEL_ID` : un message de Satine dans `#test-satine`
   est ignoré. À livrer :
   - `on_message` traite aussi les canaux `#test-<code>` déclarés en
     `config_bot_discord.json > channels.testeurs`.
   - Routage entrant **par canal**, pas par `discord_member_id` : le canal identifie le
     testeur (contourne la collision `MORPHEUS_USER_ID` et le `member_id` null de Satine).
     Traiter le cas « Marie poste dans `#test-<code>` » (réponse en clair au testeur, pas un
     retour) — ne pas le classer comme retour testeur.
   - `route_inbound()` / `_testeur_code_pour_auteur()` : ajouter la résolution par canal.
   - `/discord_loop` : balayer `inbox/testeurs/<code>/` à chaque cycle (comme `unrouted` /
     `discord`).
   - Tests unitaires : events Discord mockés pour `on_message` multi-canal. Vérif live à
     l'arrivée de Satine sur le serveur.
   Après cette passe : Phase 5 complète côté entrant. Étendre l'entrée `CHANGELOG.md` v5.111
   si besoin. Passage Phase 5 → `[FAIT]` au `/close` racine.

3. `discord_member_id` de Satine : reste `null` jusqu'à ce qu'elle rejoigne le serveur
   (étape de mise en service, pas un blocage de code avec le routage par canal).
