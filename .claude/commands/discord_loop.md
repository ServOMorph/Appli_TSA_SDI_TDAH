# Discord Loop - Contrôle Claude Code via Discord

Active la boucle de contrôle Discord native : Claude (cette session) attend les commandes Discord, les exécute directement avec ses outils, et renvoie les résultats.

**Différence clé** : Claude exécute les commandes lui-même (Bash, Read, Write...) — aucun sous-processus `claude -p`.

## Utilisation

```
/discord_loop
```

## Service quasi-permanent

Cette session est le **seul point de contact Discord** du projet et a vocation à tourner en
continu (heures, jours) : une session dédiée, distincte des sessions de travail `/start`. Son
rôle central est le **jugement de l'outbox** (gardien de sortie, étape 3a-bis) — les autres
agents s'arrêtent à `enqueue`, rien ne part sur Discord sans un `approve` d'ici.

- Cadence : une revue de l'outbox à chaque cycle, avant le `wait` (réveil par message +
  sécurité horaire). Pas de tour de modèle en rafale.
- Routage entrant et envoi des `approved` : `bot.py`, en continu, hors de cette session.
- Orphelin `commands.json` bloqué en `processing` > 15 min : repassé `idle` par
  `bot.py` (`recuperer_processing_orphelin()` au démarrage), aucune action manuelle.
- Cette session est la seule à vider les `inbox` en continu (`poll --agent unrouted`,
  `poll --agent discord`, à chaque cycle). L'orchestrateur reçoit un relevé visibility-only de
  `inbox/orchestrateur/` à chaque `/start` (étape 4-bis, depuis le 2026-09-04) mais ne le traite
  ni ne l'`ack` que sur demande explicite de l'utilisateur ; la zone `design` le fait à `/start`
  et `/close`.

## Prérequis

- `DISCORD/discord_com/config_bot_discord.json` → `"enabled": true` + token (`.env`) + channel_id configurés
- Bot Discord en cours d'exécution : `python DISCORD/discord_com/bot.py` (terminal séparé)

## Processus

### Étape 1 : Vérifier que le bot tourne

```bash
python -c "
import json
from pathlib import Path
q = json.loads(Path('DISCORD/discord_com/queue.json').read_text(encoding='utf-8'))
print('Queue OK :', q['status'])
"
```

Si erreur → demander à l'utilisateur de lancer `python DISCORD/discord_com/bot.py` dans un terminal séparé.

### Étape 2 : Notifier Discord

```bash
python DISCORD/discord_com/discord_loop.py notify "Allez ça y'est je me remets au taf"
```

### Étape 3 : Boucle native Claude

Répéter indéfiniment jusqu'à "stop" :

#### 3a-bis. Gardien de sortie : juger l'outbox (à chaque cycle, avant le `wait`)

C'est le rôle principal de cette session. Détail complet :
`DISCORD/discord_com/gateway/LOOP.md` § 1.

```bash
python DISCORD/discord_com/gateway.py list
python DISCORD/discord_com/gateway.py drain --dry-run
```

Chaque demande en `pending` (ou `held` repris) est jugée, sans jamais réécrire son fond :

| test | verdict |
|------|---------|
| Même fond déjà envoyé récemment, rien de neuf | `bounce` « doublon » |
| Question déjà répondue, ou info déjà envoyée | `bounce` « réponse déjà connue » |
| `<placeholder>`, choix non tranché, options manquantes, TODO | `bounce` « fond non figé » |
| Message pour Marie truffé de mécanique interne (hash, chemins, jargon) | `bounce` « hors périmètre canal » |
| Version / URL incohérente avec `_contexte/dernier_deploiement.md` | `bounce` « incohérence de version » |
| Fond bon, mais une question est déjà en attente de Marie et celle-ci n'y est pas liée | `hold` |
| Plusieurs `info` courtes vers le même destinataire, fusionnables | `merge` |
| tout le reste | `approve` |

```bash
python DISCORD/discord_com/gateway.py approve --id <id>
python DISCORD/discord_com/gateway.py hold    --id <id> --reason "<motif>"
python DISCORD/discord_com/gateway.py bounce  --id <id> --reason "<motif>"
python DISCORD/discord_com/gateway.py merge   --ids <id>,<id>
```

Avant chaque `approve` : relire `DISCORD/discord_com/gateway/STYLE.md`, section du
destinataire (`to`), et ajuster le champ `body` du fichier `gateway/outbox/<id>.json` à ce
style (ton, formulations, longueur, ponctuation, emojis, structure). Changer la question, les
options, les faits, les chiffres ou les liens n'est pas permis — dans ce cas, `bounce`.

**Ne jamais lancer `drain`** : `bot.py` envoie les `approved` tout seul toutes les 5 s.
Vérifier aussi `poll --agent discord` : un `kind: "dead-letter"` = envoi échoué (demande en
`failed`), à diagnostiquer puis `approve` pour retenter.

#### 3a. Attendre une commande Discord

```bash
python DISCORD/discord_com/discord_loop.py wait 3600
```

Lancer cet appel en tâche de fond (`run_in_background`). Le script bloque côté Python
(`sleep`, aucun coût token) jusqu'à 3600 s. Quand un message Discord arrive, il sort sous
0,3 s :
- Affiche la commande sur stdout
- Marque `commands.json` → `"processing"`

La fin de la tâche de fond réveille la session : traiter le message (3b→3d→3d-bis) puis relancer
un `wait 3600` en tâche de fond. Si la sortie est `TIMEOUT` (aucun message en 1 h) → passer par
3d-bis (un `TIMEOUT` est justement l'un des événements qu'elle guette) puis relancer immédiatement.
Ce cycle se répète indéfiniment (heures, jours) au rythme d'un réveil par message reçu, plus un
réveil de sécurité par heure — et non un tour de modèle toutes les quelques secondes.

#### 3b. Traiter la commande

Arrivent ici les messages qui @-mentionnent le bot, **sauf** une réponse à une question en
attente (`state.pending_replies`) : même @-mentionné par réflexe, `bot.py` la route
mécaniquement vers `gateway/inbox/<agent>/` (pièces jointes incluses) au lieu de la mettre en
commande — `gateway.has_pending_reply(author_id)`, vérifié avant la branche commande. Plus
d'archéologie manuelle à faire ici pour ce cas (jusqu'au 2026-09-04, une réponse @-mentionnant
le bot atterrissait en commande, sans ses pièces jointes, et devait être re-routée à la main).
Tout le reste du trafic du canal (réponse hors pending, message tagué `@design:`) est aussi
routé mécaniquement par `bot.py` — rien à faire.

Reste à ma charge, après le `wait` : vider `inbox/unrouted/` (relire, re-router en préfixant
le bon `@agent:`, ou répondre soi-même).

```bash
python DISCORD/discord_com/gateway.py poll --agent unrouted
```

Lire la commande et l'**exécuter directement** avec les outils natifs Claude :
- Questions sur le projet → lire fichiers, analyser, répondre
- Commandes bash → utiliser l'outil Bash
- Création/modification fichiers → utiliser Write/Edit
- Analyse git → git status, git log, etc.
- Commandes slash (`/commit`, `/task`, etc.) → les exécuter

#### 3c. Envoyer la réponse sur Discord

Construire une réponse concise (max 1900 caractères) et l'envoyer :

```bash
python DISCORD/discord_com/discord_loop.py send "RÉPONSE ICI"
```

Pour les réponses longues, envoyer par morceaux (appeler `send` plusieurs fois).

#### 3d. Marquer comme traité

```bash
python DISCORD/discord_com/discord_loop.py done
```

#### 3d-bis. Tests manuels délégués `[discord-auto]`

`tests_manuels.md` (racine) peut contenir des sections taguées `[discord-auto]` : leur condition
se vérifie d'elle-même au fil de l'usage normal de cette boucle, sans qu'il faille la provoquer.
Cette étape est **générique** — elle ne nomme aucun test précis, pour ne jamais avoir besoin
d'être retouchée quand `tests_manuels.md` grossit ou change.

Ne relire `tests_manuels.md` que si ce cycle vient de produire l'un de ces événements (pas à
chaque cycle sans raison) :
- une file de commandes (`queue[]`) vient d'être traitée en rafale ;
- le `wait` précédent est sorti en `TIMEOUT` ;
- un `stop` explicite ou un `/close` viennent d'avoir lieu.

Si c'est le cas : lire les sections `[discord-auto]`, comparer ce qui vient d'être observé à leur
description. Une condition remplie → supprimer immédiatement sa section (test validé), sans
signal supplémentaire. Un sous-point annoté « (hors délégation, à provoquer manuellement) » à
l'intérieur d'une section `[discord-auto]` n'est jamais validé par cette étape.

#### 3e. Commande "stop"

Si la commande reçue est exactement `stop` :
```bash
python DISCORD/discord_com/discord_loop.py notify "J'en ai plein le c... je vais me faire un café et je reviens"
python DISCORD/discord_com/discord_loop.py done
```
→ Arrêter la boucle.

### Flux résumé

```
juger l'outbox (approve/hold/bounce/merge) → wait → commande reçue → exécuter directement
→ send réponse → done → tests [discord-auto] si pertinent → vider inbox/unrouted → wait → ...
```

L'envoi Discord des demandes `approved` et le routage des entrants sont faits par `bot.py`,
en continu, indépendamment de cette session.

## Commandes Discord disponibles

Une fois la boucle active :

```
liste les fichiers du projet     → Claude liste et répond
quel est l'état du projet ?      → Claude lit STATUS.md et répond
git status                       → Claude exécute et répond
crée un fichier test.txt         → Claude crée le fichier
/commit                          → Claude fait le commit
stop                              → Arrête la boucle proprement
```

## Format de réponse au démarrage

```
✅ Boucle Discord native active.

Bot     : ✅ actif
Mode    : Claude natif (pas de sous-processus)
Veille  : wait 3600 en tâche de fond (réveil par message, sécurité horaire)
Gardien : outbox <N> pending / <N> held — jugée à chaque cycle

Envoie "stop" sur Discord pour arrêter.
```

## Notes importantes

- Claude reste en boucle active dans cette session — ne pas quitter
- Chaque commande Discord est exécutée avec le contexte complet du projet
- Les réponses >1900 caractères sont envoyées en plusieurs messages
- Si le bot Discord s'arrête : relancer `python DISCORD/discord_com/bot.py`
- `discord_loop.py` gère uniquement queue/commands — Claude gère l'exécution
- Ne pas notifier Discord lors d'un `/close` : seule la commande `stop` explicite (3e) envoie un message de fin.
- Le `drain` de la gateway n'est plus manuel : `bot.py` s'en charge. Une demande bloquée en
  `pending` attend un jugement de cette session, pas un `drain`.
