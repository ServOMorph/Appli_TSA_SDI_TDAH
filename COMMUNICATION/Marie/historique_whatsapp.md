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
