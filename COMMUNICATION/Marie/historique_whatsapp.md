# Historique de conversation WhatsApp avec Marie

Journal des échanges WhatsApp entre le développeur et Marie. Alimenté manuellement :
l'utilisateur colle ici les messages au fil de l'eau. Sert de mémoire durable des questions
posées, des réponses reçues et des décisions produit qui en découlent, indépendamment des
roadmaps (vues de travail éphémères) et de `a_transmettre.md` (commentaires de livraison en
attente uniquement).

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

_Suite :_ répond à la relance « tests v5.69 non validés ». Cohérent avec son retour sur la
pastille rouge du même jour : elle a passé les parcours le 2026-08-31 en marquant « Non validé »
ceux qui ne fonctionnent pas. Côté dév, un parcours « non validé » reste compté « à valider » sur
la v5.69 en ligne — pas un défaut de synchronisation, mais le même grief que la pastille rouge,
déjà corrigé en commit `2d5c0b8` (`isManualTestDone`) et non encore déployé. Confirmer que ses
résultats du 31 sont bien remontés = inspection du dernier snapshot Supabase (flux `/deploy` étape 0).
