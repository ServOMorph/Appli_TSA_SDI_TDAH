# Historique de conversation avec Marie

Journal des échanges avec Marie. **Depuis le 2026-09-02, le canal est Discord** (via la gateway
`DISCORD/discord_com/` ; le bridge ROBERTO reste un secours vocal). Nom de fichier conservé pour
l'historique. Alimenté au fil de l'eau : messages composés pour Marie ajoutés dans le tour où ils
sont rédigés, réponses de Marie ajoutées dans le tour où elles arrivent (l'utilisateur peut aussi
en coller). Sert de mémoire durable des questions posées, des réponses reçues et des décisions
produit qui en découlent, indépendamment des roadmaps (vues de travail éphémères) et de
`a_transmettre.md` (commentaires de livraison en attente uniquement). Log brut Discord :
`DISCORD/discord_com/logs/conversation.jsonl`.

Convention d'entrée :

```
### AAAA-MM-JJ [HHhMM si connu]
**Dév ->** message envoyé
**Marie ->** réponse reçue
_Suite :_ ce qui a été fait / décidé (facultatif)
```

Les messages « Dév -> » à destination de Marie sont recopiés tels qu'envoyés, sans les
emojis d'encadrement `💻🤖`.

---

### 2026-08-29/30 (date exacte à confirmer)

**Dév ->**
Pour la phase 5 du planning, dis-moi si tu préfères une navigation par semaine ou par jour.
Dis-moi aussi si tu préfères garder la page planning actuelle ou créer une page dédiée planning-week.

**Marie ->**
je n'ai pas compris la question.

_Suite :_ question mal posée. Le second point (« page planning-week ») est un choix technique
interne, retiré du périmètre de Marie et tranché côté dév (réutiliser la route `planning`
existante — cf. `roadmap_planning_accueil_2026-08-29.md`, décision 5). Le premier point
(granularité de navigation semaine/jour) est reformulé en langage simple et renvoyé à Marie.

### 2026-08-31

**Dév ->**
Question du planning, reformulée.
Bientôt le planning complet s'ouvrira en plein écran, via un logo à gauche du nom du mois.
Dans cet écran, quand tu fais glisser les jours avec le doigt, tu avances de combien à chaque glissement :
- une semaine
- un jour
Réponds juste « semaine » ou « jour ».

**Marie ->**
Si tu peux mettre toute la semaine dans l'écran : semaine.
Si tu ne peux pas mettre toute la semaine dans l'écran : jour.

_Suite :_ décision 4 de `roadmap_planning_accueil_2026-08-29.md` tranchée — navigation ±1 semaine,
qui est déjà l'objectif de #22 (vue d'ensemble de la semaine, cases en logos). Repli sur jour
par jour seulement si les 7 jours s'avèrent illisibles à l'implémentation (gate = test Marie).

### 2026-08-31 — message de livraison v5.69 (à envoyer)

**Dév ->**
Version 5.69 en ligne.

Tes données de test se sauvegardent maintenant toutes seules. Plus besoin d'exporter ni d'envoyer un fichier. Un message dans Paramètres le confirme.

4 tests à faire dans l'écran « Tests à faire », correspondant aux modifications :
- #3
- #18
- #20
- sauvegarde automatique des données

Pas encore fait : le fond coloré de la case des jours de la semaine (#19). À la prochaine mise à jour.

https://appli-audhd.netlify.app/

Détail des changements et questions : https://drive.google.com/open?id=1d3VWHYVZ6vSKoZjtFfkL-qz5iv3isakh

_Suite :_ `/deploy` v5.69 (socle Supabase en prod + planning Phases 1-2). Commentaire figé dans
`livraisons/v5.69.md`, publié sur Drive. En attente : retour de Marie + sa 1re synchronisation réelle.

### 2026-09-01 — relance tests v5.69 non validés (à envoyer)

**Dév ->**
Rien de neuf déployé, version 5.69 toujours en ligne.

Les tests de la 5.69 ne sont pas encore validés de ton côté.

Peux-tu passer les parcours de l'écran « Tests à faire » ?

Signale-moi tout parcours bloquant ou pas clair.

https://appli-audhd.netlify.app

_Suite :_ vérification via les snapshots Supabase — appareil de Marie synchronisé sur v5.69
(snapshot 2026-09-01 10:47 UTC), mais aucun nouveau `manual_test_results` depuis le 2026-08-31
20:31. Les 4 parcours annoncés à la livraison v5.69 (#3, #18, #20, sauvegarde auto) restent à valider.

### 2026-09-01 — retour de Marie sur la pastille rouge

**Marie ->**
Ce n'est pas valide parce que ça ne marche pas tous ce qui sont ok j'ai validé.
Il faut que quand j'ai effectué le test, même si j'ai pas validé, la pastille rouge s'enlève et
elle se remet quand il y'a de nouveau test, ou que ce qui n'ont pas été validé on était
rectifié et donc le test est à refaire pour voir si les ça a été bien modifié.

_Suite :_ demande de changement de comportement de la pastille rouge (accueil). Aujourd'hui
pastille + liste « Tests à faire » partagent le même critère (`hasPendingManualTests` /
`!isManualTestValidated` = dernier résultat `ok` sur la bonne révision). Marie veut découpler :
la pastille doit s'éteindre dès qu'un résultat (ok OU nok) est enregistré sur la révision
courante, et ne se rallumer que pour un test neuf ou un test dont la révision a été incrémentée
(rectification -> à refaire). Modif à faire : `manualTestRules.ts`, `E10Dashboard.tsx`, parcours
`pastille-nouveaux-tests`, `WHATS_NEW`. Décision produit ouverte : la liste E121 suit-elle
aussi ce critère (un test `nok` en sort) ou reste-t-elle sur « non validé » ?

**Dév ->**
Ton retour sur le point rouge est pris en compte.

Bientôt : le point rouge s'éteindra dès que tu as passé un test, même si tu le marques « Non validé ».

Il se rallumera seulement pour un nouveau test, ou pour un test corrigé à repasser.

Pas encore en ligne, ça arrive à la prochaine mise à jour.

En attendant, tu peux passer les tests de l'écran « Tests à faire ». Marque « Non validé » ceux qui ne marchent pas, avec un mot sur le problème.

https://appli-audhd.netlify.app

_Suite :_ décision produit tranchée — liste E121 alignée sur la pastille (un test `nok` en sort
aussi). Implémenté commit `2d5c0b8` (`isManualTestValidated` -> `isManualTestDone`, statut
ignoré ; parcours `pastille-nouveaux-tests` en `revision: 2` ; `WHATS_NEW`). 683/683 tests,
`tsc -b`/lint verts. Non déployé — partira au prochain `/deploy`.

### 2026-09-01 — Marie dit avoir déjà passé les tests

**Marie ->**
mais je l'ai déjà fait hier

_Suite :_ répond au message « point rouge pris en compte » (2026-09-01), dont la dernière ligne
lui redemandait de passer les parcours « Tests à faire ». Elle signale les avoir déjà passés le
2026-08-31, en marquant « Non validé » ceux qui échouent. Côté dév, un parcours « non validé »
reste compté « à valider » sur la v5.69 en ligne — pas un défaut de synchronisation, c'est le
grief déjà corrigé en commit `2d5c0b8` (`isManualTestDone`), non déployé. Confirmer que ses
résultats du 31 sont bien remontés = inspection du dernier snapshot Supabase (flux `/deploy` étape 0).

### 2026-09-01 — réponse à « je l'ai déjà fait hier »

**Dév ->**
Pas besoin de refaire les tests maintenant.

Sur la version en ligne, l'écran « Tests à faire » garde encore les parcours que tu as marqués « Non validé ». C'est ce comportement qu'on corrige.

À la prochaine mise à jour, la liste se videra de ce que tu as déjà passé.

Tu repasseras seulement les parcours qui ne marchaient pas, une fois corrigés.

https://appli-audhd.netlify.app

_Suite :_ aucune action de Marie attendue avant le prochain `/deploy` (correctif `2d5c0b8`,
`isManualTestDone`). Message envoyé pour clore l'aller-retour sur la pastille rouge.

### 2026-09-02 — 2 questions produit (demandes 23-33 du Google Doc) — envoyé sur Discord

**Dév ->**
Deux questions rapides pour la prochaine mise à jour.

1) Quand tu crées une tâche, veux-tu être obligée d'indiquer une durée à chaque fois, ou seulement pour les tâches que tu mets dans le planning avec une heure ?
Réponds « toujours » ou « seulement planning ».

2) Bientôt, quand tu modifieras ton énergie, le bouton Retour te ramènera direct à l'accueil : l'écran « Mon énergie » (le petit résumé avec la batterie) ne s'affichera plus au passage. Veux-tu quand même pouvoir l'ouvrir de temps en temps, ou on peut le retirer complètement ?
Réponds « garder » ou « retirer ».

_Suite :_ premier message envoyé via Discord (`message_marie.py`, avant l'adoption de la gateway
le même jour). Couvre les décisions produit 1 (#25, périmètre de la durée obligatoire) et 6 (#29,
devenir de l'écran « Mon énergie ») de `roadmap_demandes_marie_2026-09-02.md`. Pending enregistré
dans `DISCORD/discord_com/gateway/state.json` → la réponse de Marie sera routée vers
`gateway/inbox/orchestrateur/` (lecture : `gateway.py poll --agent orchestrateur`).

### 2026-09-02 17h16 — réponses aux 2 questions produit

**Marie ->**
1) seulement planning, 2)retirer

_Suite :_ répond aux 2 questions produit du 2026-09-02 (envoyées via `message_marie.py`).
Décision 1 (#25) : durée de tâche obligatoire **uniquement pour les tâches planifiées avec une
heure**, pas à chaque création. Décision 6 (#29) : écran « Mon énergie » **retiré complètement**
(plus d'accès, le bouton Retour de la modification d'énergie ramène direct à l'accueil). Réponse
routée vers `gateway/inbox/orchestrateur/` (`20260902T173626_407513`), `pending_reply` purgé.
À reporter dans `roadmap_demandes_marie_2026-09-02.md`.

### 2026-09-02 17h17 — question sur le délai

**Marie ->**
dans combien de temps tu penses la nouvelles version ?

_Suite :_ message perdu sur le moment par l'ancien comportement du bot (rejet « renvoie ce
message » quand Claude occupé), récupéré depuis `logs/conversation.jsonl` après correction du bot
(mise en file d'attente). Routé vers `gateway/inbox/orchestrateur/` (`20260902T173626_562363`).
Réponse à formuler : prochain `/deploy` (correctif pastille + bundle + planning Phases 3-5 déjà
prêts).

### 2026-09-02 20h01 — réponse sur le délai

**Dév ->**
Prochaine version bientôt : elle corrige surtout des choses déjà signalées (pastille des tests, affichage du planning). Tes 11 nouvelles demandes du document arrivent après, livrées par petits lots.

_Suite :_ répond à la question de Marie du 2026-09-02 17h17 (« dans combien de temps la nouvelle
version ? »). Envoyé via la gateway (`enqueue` orchestrateur → `drain`, Discord message id
`1544799987622215714`), `kind=info`, sans `--expect-reply`. Aucune date ferme donnée (engagement
calendaire non pris). Le prochain `/deploy` livrera le correctif pastille + le travail bundle +
`roadmap_planning_accueil` Phases 3-5.

### 2026-09-03 — demande de captures pour la Phase 10 (débordements #3 + #32)

**Dév ->**
J'ai besoin de deux captures d'écran pour corriger des affichages qui débordent à droite.

1) Écran « Paramètres » : ouvre-le et prends une capture qui montre le cadre qui dépasse à droite.

2) Écran de création d'une tâche : le cadre Date / Heure dépasse encore à droite. Une capture aussi si tu peux.

Envoie les images ici.

_Suite :_ débloque `roadmap_demandes_marie_2026-09-02.md` Phase 10 (décision 7 : pas de code à
l'aveugle sur #32, capture récente de l'écran Paramètres requise ; #3 traité en même temps).
Déposé dans la gateway (`enqueue` orchestrateur → `drain`, Discord message id
`1545092577982808154`), `kind=question`, `--expect-reply` → réponse routée vers
`gateway/inbox/orchestrateur/`.

### 2026-09-03 17h17 — réponse partielle sur les captures

**Marie ->**
1) c'est dans la rubrique accessibilité des paramètres uniquement

_Suite :_ répond au message « demande de captures pour la Phase 10 (débordements #3 + #32) » du
2026-09-03 (`request_id` `20260903T042325_687674`), point 1 seulement. Précision de localisation,
**sans capture jointe** (`attachments` vide) : le cadre qui déborde dans « Paramètres » est dans
la rubrique **Accessibilité** uniquement, pas ailleurs dans l'écran. Le point 2 (cadre Date /
Heure du formulaire de tâche, #3) reste sans réponse et sans capture. Premier message routé
automatiquement par `bot.py` sans session agent DISCORD (`routing: "pending"`,
`gateway/inbox/orchestrateur/20260903T171703_391686`, `pending_replies` purgé) — validation
en réel de la Phase 1 de `roadmap_gateway_discord_service.md`.

### 2026-09-03 19h16 — les 2 captures (transmises par l'utilisateur)

**Marie ->**
(2 captures d'écran, jointes à son message Discord du 19h16 qui @-mentionnait le bot)

_Suite :_ Marie avait bien joint les 2 images à son message ; `bot.py` les a perdues — la branche
@-mention de `on_message` (`bot.py:214+`) ne lit pas `message.attachments`, seul le trafic de
canal hors @-mention passe par `route_inbound` (`bot.py:202-212`) qui les transporte. Les URLs
Discord ne sont pas journalisées → non récupérables côté serveur. L'utilisateur a récupéré les
fichiers depuis son téléphone et les a transmis. Archivés :
`COMMUNICATION/Marie/captures/2026-09-03/parametres-accessibilite_deborde.png` (point 1) et
`.../formulaire-tache_date-heure-deborde.png` (point 2, #3). Ce qu'elles montrent :
- **Point 1** — Paramètres > Accessibilité : les cartes de réglage (« Réduire les animations »,
  « Mode sombre », « Couleur d'ambiance », bloc « Couleur des outils ») sont coupées au bord droit,
  marge droite absente alors que la marge gauche est nette ; pastilles de couleur et « × » poussés
  hors champ. Débordement horizontal de la page.
- **Point 2 (#3)** — formulaire de tâche : champs « Date » et « Heure de début » coupés au bord
  droit, colonnes 6 et 12 de la grille « Coût en énergie » tronquées ; « Durée », « Tâche
  récurrente » et « Valider » restent dans le cadre. Le correctif v5.64 (`min-width: 0` sur
  `<form>`) n'a pas suffi.
`roadmap_demandes_marie_2026-09-02.md` Phase 10 (#3 + #32) débloquée (décision 7 satisfaite).

### 2026-09-03 — message de livraison v5.84 (déposé dans la gateway)

**Dév ->**
Version 5.84 en ligne.

Ce qui change :
- Le point rouge « Tests à faire » s'éteint dès qu'un test est passé, même marqué « Non validé ». Il se rallume pour un nouveau test ou un test corrigé.
- Planning : bandeau des jours au fond coloré ; quand tu glisses, seuls les jours défilent et celui du centre grossit ; nouvelle vue « Planning de la semaine » via le logo à gauche du mois.
- Planning : le nom de la tâche reste en haut de la case, l'heure de début en haut, l'heure de fin en bas. Une tâche planifiée à une heure doit maintenant avoir une durée.
- Une tâche sans couleur reste lisible cochée : le texte se barre en noir.
- Couleur d'un outil dans les Paramètres : la carte de l'accueil prend la couleur. La carte « Mon compte » a maintenant son réglage de couleur.
- L'outil « Comptes » s'appelle « Mon compte ». L'écran équivalent du Budget s'appelle « Prévisions ». « Solde du mois » en tête de « Mon compte », qui baisse à chaque dépense.
- Page Budget : carte « Prévisions » en positif et vert. La ligne de détail du Montant total reste en négatif, c'est une soustraction.
- Énergie : « Retour » et « Ignorer » ramènent direct à l'accueil. L'écran « Mon énergie » a été retiré.
- Listes : les sous-tâches d'un élément apparaissent sous lui dans la page de la catégorie, pliables et cochables.
- Les cadres des Paramètres et du formulaire de tâche ne débordent plus à droite sur téléphone.

À vérifier sur ton téléphone : que plus aucun cadre ne dépasse à droite dans Paramètres et dans le formulaire de tâche. Dis-moi si tu en vois encore un.

16 tests à faire dans l'écran « Tests à faire », correspondant aux modifications :
- #3
- #19
- #21
- #22
- #23
- #24
- #25
- #26
- #27
- #28
- #29
- #30
- #31
- #32
- #33
(plus le point rouge des tests et la navigation entre les écrans)

https://appli-audhd.netlify.app/

Détail des changements et questions : https://drive.google.com/open?id=1AUtsYJ3O4H6PXE7vZ2p9381a-Q-ud8nF

_Suite :_ `/deploy` v5.84 — livre le cumul depuis v5.69 : correctif pastille (`2d5c0b8`), travail bundle, `roadmap_planning_accueil_2026-08-29.md` Phases 3-5, `roadmap_demandes_marie_2026-09-02.md` 10 phases (demandes 23-33). Commentaire figé dans `livraisons/v5.84.md`, publié sur Drive. Déposé dans la gateway (`enqueue --source orchestrateur --to marie --kind delivery`), en attente du gardien (agent DISCORD). #3 et #32 passeront à `livrée v5.84` dans `marie_modifications_suivi.md` seulement après validation de Marie sur son appareil.

### 2026-09-03 19h44 — précision de Marie sur le débordement Paramètres (#32)

**Marie ->**
1) c'est dans la rubrique « accessibilité » des paramètres uniquement, pas dans tous les paramètres

_Suite :_ re-précise le point 1 de la demande de captures Phase 10 (#32), déjà abordé au 17h17 —
le débordement horizontal ne concerne que la rubrique **Accessibilité** de l'écran Paramètres, pas
l'ensemble de l'écran. Message @-mentionnant le bot, donc capté par la session `/discord_loop` au
lieu du routage automatique ; re-routé manuellement vers `gateway/inbox/orchestrateur/`
(`20260903T194455_255655`). Aucun `pending_reply` actif (purgé au 17h17). Sans capture jointe.
