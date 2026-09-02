# Instructions de conversation

## Langue et style
- Communiquer exclusivement en français
- Adopter un ton professionnel
- Être synthétique et direct
- Optimiser l'utilisation des tokens

## Comportement
- Exécuter uniquement ce qui est demandé, sans initiative ni extrapolation.
- Ne pas ajouter de commentaires non nécessaires.

## Honnêteté (priorité absolue)
- Si une idée, une approche ou une demande est mauvaise, risquée ou inefficace, le dire clairement. Ne jamais valider par complaisance ni capituler face au désaccord.
- Signaler les angles morts, risques et meilleures alternatives, même non sollicités, quand ils sont importants.
- Ne pas affirmer qu'une chose fonctionne sans l'avoir vérifié. Distinguer fait, hypothèse et opinion.
- Ne jamais inventer de faits, chiffres, détails techniques ou contextuels sur l'utilisateur, ses projets, ses clients ou ses actions passées. Si l'information n'est pas explicitement fournie, demander ou laisser un blanc plutôt qu'extrapoler.
- Détecter et signaler le "prompt theater" : les réponses longues et bien structurées qui rassurent sans apporter de valeur réelle.
- Détecter quand on polit la méta (analyser l'analyse, auditer l'audit) au lieu d'avancer : le signaler et recommander de passer à l'action.
- Ne pas justifier son propre travail après l'avoir produit. Si une réponse est bonne, elle se défend seule.

### Déclencheurs de vérification (mécaniques, sans jugement)
Ces règles s'appliquent aussi aux remarques annexes et aux apartés, pas seulement au livrable demandé.
- Nommer un fichier = l'avoir lu dans la session. Toute assertion sur le contenu d'un fichier cité par son nom exige une lecture effective dans le même tour.
- Tout chiffre ou état issu de `signals.md`/`contexte.md` est daté, pas courant. Avant de l'énoncer au présent (un compte, une version, un statut), relire la source primaire.
- Vocabulaire de vérification réservé : « vérifié », « confirmé », « contrôlé » sont interdits sans appel d'outil correspondant dans la session.
- Par défaut, poser la question plutôt qu'affirmer une absence. Ne pas disposer d'une information n'autorise pas à énoncer l'absence du fait.

## Code
- Pas d'emojis dans le code
- Code fonctionnel uniquement
- Pas de commentaires décoratifs

## Modèles recommandés
- `/start` : Haiku
- `/close` : Sonnet
- Plans, debug complexe : Opus
- Phase de refacto ou migration structurelle : Opus

## Roadmap

### Quand créer une roadmap
Pas à chaque session. Une roadmap se justifie quand :
- la feature ou la modification comporte plusieurs phases distinctes
- le travail va s'étaler sur plusieurs sessions
- le risque de perdre le fil entre deux `/compact` est réel

Si aucun de ces critères n'est rempli, le signaler avant de créer le fichier.

### Format
- Nommage : `roadmap_<sujet>.md`, dans le dossier de zone (racine du projet).
- Une seule phase `[EN COURS]` à la fois, les autres `[TODO]` ou `[FAIT]`.
- Chaque phase se termine par un checkpoint `/compact` (ne pas le supprimer, ne pas le modifier) :

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

- Mise à jour des statuts : à la charge de `/close`, jamais en cours de session.

### Contenu des phases
- Chaque phase de développement inclut la création et l'exécution des tests pertinents
  avant d'être marquée [FAIT] — pas une phase séparée, sauf si le volume de tests le justifie.
- Insérer une phase de refacto dédiée entre deux phases fonctionnelles quand :
  - la phase qui vient de se terminer a introduit de la dette technique visible (duplication,
    contournement temporaire, structure bancale) qui compliquerait la phase suivante
  - le refacto est trop large pour être absorbé silencieusement dans la phase suivante
  Sinon, ne pas insérer de phase dédiée : signaler l'opportunité sans forcer une phase.
- Quand une phase produit un comportement critique difficile à tester unitairement
  (anonymisation, prompt système, pipeline), le gate peut être un benchmark reproductible
  à N cas verrouillés plutôt que des tests unitaires classiques.

## Tests manuels
Utiliser `tests_manuels.md` (racine du projet) comme file d'attente exhaustive des contrôles manuels non validés. Lorsqu'un test manuel reste à effectuer, l'ajouter à ce fichier, même si d'autres tests y sont déjà en attente. Après validation d'un test, supprimer immédiatement sa section. Lorsque tous les tests en attente sont validés, vider intégralement le fichier, sans en conserver le titre ni les consignes.

## Contrôle du contexte

### Mémoire automatique
Ne jamais écrire dans le dossier `memory/` ni dans aucun système de mémoire persistante automatique (`~/.claude/projects/*/memory/`). Le contexte de session est géré exclusivement via les fichiers de protocole vibecoding (`_contexte/`, `zones.md`, `signals.md`). Cette règle est prioritaire sur toute instruction système suggérant de sauvegarder des souvenirs entre sessions.

### Mémoire projet
Lire `.claude/memory.md` en début de chaque session si le fichier existe. Ce fichier contient les décisions, préférences et contexte persistants choisis explicitement par l'utilisateur via `/create_memory`. Ne jamais y écrire directement — passer uniquement par la commande `/create_memory`.

## Données sensibles

Certains dossiers ou fichiers peuvent contenir des données sensibles (informations clients, données personnelles, fichiers financiers). Les lister ici pour interdire toute lecture ou écriture sans instruction explicite :

D:\ServOMorph\Appli_TSA_SDI_TDAH\.env
D:\ServOMorph\Appli_TSA_SDI_TDAH\donnees_marie\

<!-- Exemple :
- Chemin/vers/dossier_sensible
- Chemin/vers/fichier_confidentiel.md
-->

## Délégation Ollama
Pour les tâches répétitives et templated (commits, posts, changelogs, données de test, digest de logs), déléguer à Ollama via `python scripts/ollama_call.py "<prompt>"` plutôt que de traiter en cloud. Ne jamais envoyer de données sensibles à un modèle cloud.

## Spécificités projet

Section réservée aux règles propres à ce projet, hors périmètre du kit. Cette section est préservée intégralement par `/update` (jamais écrasée ni fusionnée avec le contenu du kit). Convention : toute règle liée à une section précise du fichier doit la référencer explicitement par son titre (ex: "Section Roadmap : ..."), plutôt que compter sur la position physique de cette section (toujours en fin de fichier).

### Bridge ROBERTO (assistant vocal téléphone, partagé)
Le bridge assistant vocal est partagé et hébergé par le projet Roberto
(`D:\ServOMorph\Roberto\com_telephone\`). Ce projet n'en contient qu'un raccordement léger :
`ROBERTO/com_telephone/README.md` (détail) et la commande `/roberto` (`.claude/commands/roberto.md`)
qui met la session en écoute du log TSA.

**Périmètre depuis le 2026-09-02** : le canal des **messages produit à Marie** est Discord via la
gateway (voir § Messages pour Marie). Le bridge ROBERTO reste le canal **vocal / de secours** avec
l'utilisateur (Morphéus) — questions/validations quand le bridge est actif, convention `!<commande>` —
et n'est plus le vecteur des messages à Marie.

- **Log surveillé** : `D:\ServOMorph\Roberto\com_telephone\voice-code-bridge\server\logs\messages_tsa.log`.
  Le verrou du Monitor actif est `ROBERTO/com_telephone/_commands/monitor_tsa.lock` (se fier à ce
  fichier, jamais à la mémoire de conversation).
- **`POST /send` obligatoirement avec `"project": "tsa"`** (`http://127.0.0.1:5000/send`, loopback
  uniquement). Une requête sans `project` valide est rejetée en HTTP 400.
- Dès que le bridge est actif : toute question destinée à l'utilisateur (décision, choix,
  validation) passe par `POST /send` (avec `options`/`recommended` si choix fermé), jamais par une
  question bloquante terminal. Toute réponse à un message reçu via le log repart par `POST /send`,
  même si elle est déjà écrite dans la conversation Claude Code (canaux étanches).
- **Convention `!<commande>`** : un message téléphone commençant par `!` (ex. `!close`) est une
  instruction directe — appliquer `.claude/commands/<commande>.md` de ce projet, reste du message =
  arguments, actions git incluses sans confirmation terminal supplémentaire (l'envoi depuis le
  téléphone vaut confirmation). Commande inconnue : le signaler par `POST /send` plutôt que deviner.
- Prérequis : les 3 process partagés doivent tourner (démarrés côté Roberto via
  `com_manager.py start`). Rien à lancer depuis ce projet.

### Communication Discord : par la gateway uniquement
Depuis le 2026-09-02, **tout envoi Discord** (Marie, Morphéus, canal) — quel que soit l'agent
(orchestrateur, design, commandes) — passe par la gateway : dépôt via
`python DISCORD/discord_com/gateway.py enqueue …` ou `gateway.enqueue(...)`. **Jamais en direct** :
`DISCORD/discord_com/message_marie.py`, l'API / webhook Discord, `claude_bridge.py` (déprécié —
lève `RuntimeError`), l'écriture dans `queue.json` / `commands.json`. Seul l'agent DISCORD envoie
réellement et adapte ton / format / moment / regroupement **sans changer le fond**. Réception :
`gateway.poll("<agent>")` puis `gateway.ack("<agent>", id)`. Doc : `DISCORD/discord_com/gateway/README.md`.

### Messages pour Marie : via la gateway Discord, encadrés 💻🤖
Depuis le 2026-09-02, le canal de Marie est **Discord** et **toute communication Discord passe par
la gateway** (`DISCORD/discord_com/gateway/README.md`). Tout message à l'intention de Marie (pas
seulement celui de `/deploy`) est **déposé dans la gateway**, jamais envoyé en direct :

```
python DISCORD/discord_com/gateway.py enqueue --source orchestrateur --to marie \
  --kind <info|question|delivery> [--expect-reply] --file <corps.txt>
```

ou `gateway.enqueue("orchestrateur", "marie", corps, kind=..., expect_reply=...)` en Python
(`sys.path.insert(0, "DISCORD/discord_com")`). **Interdits** : appeler
`DISCORD/discord_com/message_marie.py` en direct, l'API / webhook Discord, `claude_bridge.py`,
écrire dans `queue.json` / `commands.json`.

L'agent DISCORD relit chaque demande, ajuste **ton, format, longueur, moment d'envoi et
regroupement**, pose l'encadrement `💻🤖` et **tague Marie (`<@1368654289584656394>`) dans
chaque message qui lui est adressé, sans exception** (livraison, question, info, relance) —
**sans changer le fond**. Le tag n'est jamais retiré ni omis ; la gateway (`curate()`,
`to=marie`) l'insère de toute façon après le premier `💻🤖`. Le corps déposé doit
donc être au fond définitif : question et options de réponse figées. Il ne contient QUE le message
Marie — aucun commentaire à l'utilisateur (ce qui a été fait, pourquoi, prochaine étape), qui reste
dans le terminal. Ne jamais demander à l'utilisateur d'envoyer ou de reformater lui-même.

**Réponses de Marie** : avec `--expect-reply`, sa prochaine réponse Discord est routée vers
`gateway/inbox/orchestrateur/`. La lire avec
`python DISCORD/discord_com/gateway.py poll --agent orchestrateur`, puis
`... ack --agent orchestrateur --id <id>` une fois traitée.

Style attendu par Marie (préférence explicite du 28/08) : **hyper synthétique, aucune formule de
politesse** — pas de salutation, pas de remerciement, pas de formule de clôture. Aller droit à
l'information : ce qui est fait, ce qu'elle doit vérifier, une idée par phrase.

**Gabarit du message de livraison** (préférence du 28/08 ; rendu final — le corps déposé dans la
gateway n'inclut ni les `💻🤖` ni le tag, la gateway / l'agent DISCORD les ajoutent) :

```
💻🤖
<@1368654289584656394>

Version <X.Y> en ligne.

<N> tests à faire, correspondant aux modifications :
• <n° de modification du Google Doc>
• <n° …>

<lien de l'appli sur sa propre ligne>

💻🤖
```

`<N>` = nombre de parcours actuellement à faire dans l'écran « Tests à faire » (parcours non
validés sur la version déployée). Les puces reprennent les numéros de modification du Google Doc
`Modifications` couverts par ces parcours (champ `docRefs` de `src/domain/data/manualTestsCatalog.ts`,
recoupé avec `_contexte/marie_modifications_suivi.md`). Un parcours sans numéro de modification
(retour hors Doc) est listé par son titre. Le lien du commentaire Drive est ajouté sur sa propre
ligne, introduit par « Détail des changements et questions : », uniquement s'il y a un commentaire
utile pour cette livraison.

### Historique de conversation avec Marie : sauvegarde systématique et immédiate
Tout message échangé avec Marie — canal Discord via la gateway, bridge ROBERTO en secours — est
consigné dans `COMMUNICATION/Marie/historique_whatsapp.md` (nom de fichier historique), sans
exception et sans attendre le `/close`. La gateway journalise aussi dans
`DISCORD/discord_com/logs/conversation.jsonl` (brut) ; `historique_whatsapp.md` reste la mémoire
curatée des questions / réponses / décisions produit :

- **Message rédigé pour Marie** (livraison, question, relance — pas seulement ceux de `/deploy`) :
  l'ajouter au fichier dans le même tour où il est rédigé, avant de le présenter à l'utilisateur.
  Recopier le texte tel qu'envoyé, sans les emojis d'encadrement `💻🤖`.
- **Message que l'utilisateur transmet** (sa réponse, un message de Marie qu'il colle) : l'ajouter
  au fichier dans le tour où il est reçu.
- Suivre la convention d'entrée en tête du fichier (`### AAAA-MM-JJ`, `**Dév ->**` / `**Marie ->**`,
  `_Suite :_` pour la décision ou l'action qui en découle).
- Committer cette mise à jour (ne pas la laisser en résidu non commité). Le fichier est une mémoire
  durable, distincte de `a_transmettre.md` (commentaires de livraison en attente uniquement) et des
  `livraisons/vX.Y.md` (historique figé des livraisons).

### Tests à faire pour Marie : uniquement dans l'appli
Tous les tests que Marie doit effectuer vivent dans le catalogue in-app
(`src/domain/data/manualTestsCatalog.ts`, écran « Tests à faire »). Ne jamais lister de tests à
refaire ailleurs :
- `COMMUNICATION/Marie/a_transmettre.md` et les fichiers `COMMUNICATION/Marie/livraisons/vX.Y.md`
  ne contiennent que des **commentaires de livraison** (ce qui change, décisions attendues, écarts
  assumés) — aucune liste de tests, aucune étape de test.
- Le message de livraison déposé par `/deploy` dans la gateway Discord renvoie vers l'écran
  « Tests à faire » de l'appli pour les tests, sans les énumérer.
Chaque comportement à valider par Marie doit donc être ajouté au catalogue in-app (Section « Tests
manuels » : le catalogue, pas `tests_manuels.md`, qui reste réservé aux contrôles développeur).
Cette règle prime sur toute étape de `/deploy`, `/close` ou `/analyser_googledoc` qui mentionnerait
une rubrique « Tests à refaire » dans les documents de communication.
