# Synthèse — Réunion Marie — 2026-06-29

**Durée** : ~35 min (18h18 – 18h50)
**Participants** : Raphael, Marie (TSA SDI + TDAH, testeuse Phase 7)
**Support** : visio + partage d'écran + dessins réalisés en direct par Marie

---

## Contexte

Deuxième session de test avec Marie sur l'appli AuDHD. Marie avait consulté l'appli entre les deux sessions et envoyé ses retours écrits le 28/06. La réunion a permis d'approfondir ces retours et de co-concevoir des évolutions de l'interface.

---

## 1. Mode surcharge

**Problème identifié** : Le mode surcharge n'est pas reconnaissable comme bouton d'action. Marie l'a d'abord interprété comme une rubrique ou une section, pas comme un déclencheur. Elle n'avait pas compris qu'il fallait cliquer dessus pour l'activer.

**Ce que Marie veut** :
- Un bouton visible, isolé, mis en valeur — pas intégré dans le flux visuel du reste de l'interface
- En haut à droite ou clairement séparé des autres éléments
- En cliquant dessus, l'interface change directement (comme un mode sombre) — sans naviguer vers une autre page

**Déclencheur du mode surcharge selon Marie** :
- Ce sont les matins difficiles qui déterminent l'état de la journée
- Elle ne sait pas encore précisément ce qu'elle ressent quand elle est en surcharge — elle a promis d'analyser la prochaine fois que ça arrive
- Usage concret : quand elle est en surcharge, l'appli devrait masquer les tâches non essentielles (salle de sport, appels non urgents) et ne garder que l'indispensable

**Décision** : Remplacer le bouton actuel par une pastille ou icône dédiée, bien isolée. Marie testera et donnera son ressenti sur la surcharge lors d'une prochaine session.

---

## 2. Vocabulaire

- **"Souffle" → "Batterie d'énergie"** (ou "énergie") : confirmé par Marie lors de cette session aussi. "Souffle" est trop poétique et abstrait pour le public cible TSA.
- **"Inbox" → "Todo" ou "Choses à faire"** : Marie préfère un terme plus explicite. "Inbox" ne parle pas.
- **"Plus tard"** : à supprimer ou reformuler. Le concept reste mais le libellé est flou.

---

## 3. Architecture des tâches — refonte proposée par Marie

Marie a dessiné en direct une nouvelle organisation de l'interface. Voici la structure qu'elle décrit :

### Flux d'ajout d'une tâche

Quand on ajoute une tâche, on est obligé de choisir entre 3 destinations :

| Destination | Description |
|-------------|-------------|
| **Todo / Choses à faire** | Tâche sans deadline — fait partie des listes, reste visible en bas de page d'accueil |
| **Planifier** | Tâche à caser dans le calendrier maintenant — ouvre le planning directement |
| **À planifier plus tard** | Tâche à dater ultérieurement — stockée avec pastille rouge sur le tableau de bord |

Pas de case par défaut : l'utilisateur doit choisir avant de valider. Cela évite les tâches perdues dans un inbox ambigu.

### Page d'accueil

- **En haut** : indicateur d'énergie ("Mon énergie") + bouton mode surcharge isolé + icône agenda
- **Au centre** : planning d'aujourd'hui sous forme de cases (colonnes par jour, lignes par heure), affiché à partir de l'heure courante, scrollable
- **En bas** : bouton "Ajouter une tâche" + 3 sections de navigation (Todo, Planifier, Listes)

### Planning (vue calendrier)

- Affichage **par jour** avec navigation gauche/droite (flèches)
- Vue sous forme de **cases à remplir** (pas de liste texte ni de lignes type Google Agenda)
- Scrollable verticalement pour accéder à toutes les heures
- S'affiche automatiquement à l'heure courante au démarrage
- Accès depuis une icône agenda en haut de l'écran

### À planifier (file d'attente)

- Pastille rouge sur le tableau de bord dès qu'une tâche est en attente de planification (sans afficher le nombre — juste signal visuel)
- Quand on clique : on voit la première tâche à planifier, on choisit date et heure, puis la tâche suivante apparaît
- On peut arrêter à tout moment — les tâches restantes restent dans la file

### Listes

- Page dédiée avec toutes les listes de l'utilisateur (exemples de Marie : habits, musiques, livres, routines)
- Bouton "Ajouter" en haut pour ajouter un élément directement — l'appli propose dans quelle liste le mettre
- Possibilité de créer une nouvelle liste à la volée
- Les listes ne sont **pas** des tâches planifiables — elles servent de référentiel personnel (envies, collections, idées)

---

## 4. Routines

- Marie utilise des routines matin (RM) et soir (RS) qu'elle consigne manuellement sur papier
- Elle prévoit 1h30 pour sa routine du matin — elle ne détaille pas chaque étape dans le planning, elle réserve un bloc
- Les routines seraient des **listes** dans l'appli, pas des tâches planifiées à la minute
- Le matin est le moment déterminant : si la routine matinale se passe bien, la journée se passe bien

---

## 5. Retour global de Marie

- Elle a aimé l'appli dans l'ensemble : "fluide, ça bug pas, le design épuré j'adore"
- La reconnexion sans ressaisir les étapes lui a plu
- Elle a eu une révélation en faisant ses propres routines la veille : "ça m'a vachement aidé à assimiler avec ton appli — c'est exactement ce dont j'ai besoin, centraliser mes trucs"
- Elle est prête à tester une V2

---

## Actions à faire

- [ ] Remplacer "Souffle" par "Batterie" ou "Énergie"
- [ ] Renommer "Inbox" en "Todo" (ou "Choses à faire")
- [ ] Supprimer le libellé "Plus tard" — reformuler
- [ ] Revoir le bouton mode surcharge : isolé, mis en valeur, en haut
- [ ] Refondre le flux d'ajout de tâche (3 choix obligatoires : Todo / Planifier / À planifier plus tard)
- [ ] Implémenter la vue planning sous forme de cases (colonne/jour, ligne/heure, scroll vertical)
- [ ] Ajouter pastille rouge sur le tableau de bord pour "À planifier"
- [ ] Ajouter icône agenda en haut de l'écran (accès direct au planning)
- [ ] Créer section Listes avec ajout rapide + création de liste à la volée
- [ ] Marie enverra ses dessins de maquette (photos prises pendant la visio)
