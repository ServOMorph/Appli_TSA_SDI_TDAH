# Product Requirements Document (PRD)

# Application AuDHD — Organisation, routines, énergie et social

Version : 1.0
Statut : Pré-développement
Produit : Application Web & Mobile
Public cible : Personnes TSA sans déficience intellectuelle associée à un TDAH (AuDHD)

---

# 1. Vision Produit

Créer une application neuroinclusive qui agit comme un système externe de fonctions exécutives pour les personnes AuDHD.

L'objectif n'est pas d'augmenter la productivité mais de réduire la charge mentale quotidienne en aidant l'utilisateur à :

* capturer les informations rapidement
* savoir quoi faire maintenant
* maintenir des routines
* préserver ses relations sociales
* gérer son énergie
* réduire les blocages liés aux fonctions exécutives

---

# 2. Problématique

Les personnes AuDHD rencontrent fréquemment :

* oubli des tâches
* difficultés d'initiation
* surcharge cognitive
* difficulté à prioriser
* time blindness
* oubli des relations sociales
* épuisement décisionnel
* difficultés de transition entre activités

Les outils de productivité classiques supposent souvent :

* une capacité de planification élevée
* une gestion efficace des priorités
* une estimation fiable du temps
* une tolérance aux interfaces complexes

Ces hypothèses sont souvent inadaptées aux besoins AuDHD.

---

# 3. Objectifs Produit

## Objectifs utilisateurs

* Capturer une tâche en moins de 5 secondes
* Savoir quoi faire ensuite sans réfléchir
* Réduire le nombre de décisions quotidiennes
* Maintenir les routines essentielles
* Conserver les relations importantes
* Adapter l'activité à l'énergie disponible

## Objectifs business

* Obtenir une adoption rapide
* Réduire l'abandon après onboarding
* Favoriser l'usage quotidien
* Construire une base solide pour les évolutions futures

---

# 4. Personae

## Persona 1 — Emma

Âge : 17 ans

Profil :

* TSA + TDAH
* Lycéenne
* Difficultés à démarrer les devoirs
* Oublie fréquemment les tâches scolaires

Besoins :

* Capturer rapidement les devoirs
* Être guidée sur l'action suivante
* Réduire le stress scolaire

---

## Persona 2 — Lucas

Âge : 23 ans

Profil :

* Étudiant universitaire
* Time blindness importante
* Oublis administratifs fréquents

Besoins :

* Visualiser ce qui est important aujourd'hui
* Gérer les échéances
* Maintenir des routines de vie

---

## Persona 3 — Sarah

Âge : 35 ans

Profil :

* Active professionnellement
* Charge mentale élevée
* Difficultés à maintenir les relations sociales

Besoins :

* Réduire les oublis
* Garder le contact avec ses proches
* Adapter ses journées à son énergie réelle

---

# 5. Principes Produit

* Capture > Organisation
* Action > Planification
* Énergie > Temps
* Simplicité > Exhaustivité
* Assistance > Automatisation
* Contrôle utilisateur permanent
* Fonctionnement hors ligne prioritaire
* Confidentialité par défaut

---

# 6. Périmètre MVP

Le MVP vise à valider l'utilité principale du produit.

Fonctionnalités :

* Ajout de tâche
* Inbox
* Aujourd'hui
* Plus tard
* Dashboard
* Check-in énergie
* Décomposition manuelle des tâches

Objectif :

Permettre à l'utilisateur de savoir quoi faire maintenant.

---

# 7. Périmètre V1

Inclut le MVP plus :

* Routines
* Module social
* Modèles sociaux
* Préparation d'interactions
* Notifications
* Time blindness
* Transitions entre tâches
* Profils de vie
* Personnalisation
* Mode surcharge
* Synchronisation optionnelle
* Export des données

---

# 8. Périmètre V2

Évolutions prévues :

* Priorisation intelligente
* Décomposition automatique
* Calibration énergétique
* Analyse comportementale douce
* Détection de surcharge
* Assistant vocal
* Mode crise

---

# 9. Cas d'usage principaux

## Capture rapide

L'utilisateur se souvient d'une tâche.

Résultat attendu :
la tâche est enregistrée immédiatement.

---

## Planification quotidienne

L'utilisateur ouvre l'application.

Résultat attendu :
il sait immédiatement quoi faire ensuite.

---

## Gestion de l'énergie

L'utilisateur indique son niveau d'énergie.

Résultat attendu :
l'application adapte ses suggestions.

---

## Maintien des relations

L'utilisateur souhaite garder le contact avec une personne.

Résultat attendu :
un rappel de reconnexion est proposé.

---

## Préparation d'un appel

L'utilisateur prépare une interaction importante.

Résultat attendu :
les informations clés sont regroupées au même endroit.

---

# 10. Parcours Utilisateurs

## Ajouter une tâche

Dashboard

↓

Ajouter tâche

↓

Champ texte unique

↓

Valider

↓

Inbox

---

## Check-in énergie

Ouverture application

↓

Question :
"Combien de cuillères aujourd'hui ?"

↓

Validation

↓

Dashboard

---

## Décomposer une tâche

Tâche

↓

Décomposer

↓

Ajouter sous-étapes

↓

Sauvegarder

---

## Reconnexion sociale

Dashboard

↓

Suggestion sociale

↓

Fiche contact

↓

Modèle social facultatif

↓

Prise de contact

---

# 11. User Stories

## Capture

En tant qu'utilisateur AuDHD,

Je veux ajouter une tâche en moins de 5 secondes,

Afin de ne pas perdre l'information.

---

## Dashboard

En tant qu'utilisateur AuDHD,

Je veux voir immédiatement quoi faire,

Afin d'éviter la paralysie décisionnelle.

---

## Énergie

En tant qu'utilisateur AuDHD,

Je veux indiquer mon énergie du jour,

Afin d'adapter mes activités.

---

## Social

En tant qu'utilisateur AuDHD,

Je veux être rappelé de recontacter certaines personnes,

Afin de maintenir mes relations.

---

## Routines

En tant qu'utilisateur AuDHD,

Je veux suivre une routine liée à un événement,

Afin de réduire ma charge mentale.

---

## Surcharge

En tant qu'utilisateur AuDHD,

Je veux activer rapidement un mode surcharge,

Afin de simplifier immédiatement l'interface.

---

# 12. Critères d'acceptation

## Ajout de tâche

Étant donné que je suis sur le dashboard

Quand je saisis une tâche et valide

Alors la tâche apparaît dans l'Inbox

Et aucune information supplémentaire n'est exigée.

---

## Limite Aujourd'hui

Étant donné que trois tâches sont déjà présentes

Quand je tente d'en ajouter une quatrième

Alors l'application demande un remplacement.

---

## Check-in énergie

Étant donné que j'ouvre l'application

Quand aucun check-in n'a été effectué

Alors la question énergie est proposée.

---

## Mode surcharge

Étant donné que je suis sur n'importe quel écran

Quand j'active le mode surcharge

Alors l'interface simplifiée apparaît en moins de 2 secondes.

---

## Rappel social

Étant donné qu'un contact dépasse la fréquence définie

Quand l'utilisateur ouvre l'application

Alors une suggestion de reconnexion est affichée.

---

## Décomposition d'une tâche

Étant donné que je consulte une tâche

Quand j'ajoute une ou plusieurs sous-étapes et sauvegarde

Alors les sous-étapes sont rattachées à la tâche

Et chacune est cochable indépendamment

Et aucune structure n'est imposée.

---

## Déplacement d'une tâche

Étant donné qu'une tâche est dans l'Inbox

Quand je la déplace vers Aujourd'hui ou Plus tard

Alors son statut change en conséquence

Et la limite de 3 tâches d'Aujourd'hui reste respectée.

---

## Complétion et micro-transition

Étant donné qu'une tâche est en cours

Quand je la marque « C'est fait »

Alors elle passe au statut terminé

Et un temps de transition court est proposé avant la tâche suivante

Et aucun enchaînement automatique n'a lieu.

---

## États vides

Étant donné qu'un module ne contient aucune donnée

Quand j'ouvre ce module

Alors un état vide rassurant et non culpabilisant est affiché

Et aucune liste vide brute ni écran blanc n'apparaît.

---

## Action immédiate du dashboard

Étant donné que j'ouvre le dashboard

Quand des routines, tâches, événements ou suggestions existent

Alors une unique action immédiate est affichée selon la cascade de priorité définie (User Flows §9)

Et en l'absence de tout contenu, l'état vide « Que souhaitez-vous ajouter ? » est affiché.

---

# 13. Exigences Non Fonctionnelles

## Performance

* Temps d'ouverture inférieur à 2 secondes
* Ajout de tâche inférieur à 1 seconde

## Accessibilité cognitive

* Une décision par écran
* Navigation stable
* Réduction maximale des distractions

## Confidentialité

* Chiffrement local
* Synchronisation sécurisée
* Aucun tracking publicitaire

## Disponibilité

* Fonctionnement hors ligne complet

---

# 14. Mesures de Succès

## Court terme

* Taux de complétion onboarding
* Nombre moyen de tâches capturées
* Fréquence d'utilisation quotidienne

## Moyen terme

* Rétention à 30 jours
* Utilisation des routines
* Utilisation du module social

## Long terme

* Satisfaction utilisateur
* Réduction perçue de la charge mentale
* Maintien de l'usage régulier

---

# 15. Hors Périmètre V1

* Intelligence artificielle
* Assistant conversationnel
* Gamification avancée
* Réseaux sociaux
* Collaboration multi-utilisateurs
* Priorisation automatique complexe
* Détection automatique de surcharge

---

# 16. Risques Produit

* Complexification progressive de l'interface
* Surcharge de fonctionnalités
* Mauvaise estimation énergétique
* Notifications perçues comme intrusives
* Difficulté à conserver la simplicité initiale

---

# 17. Définition du succès

L'utilisateur ouvre l'application.

En moins de quelques secondes :

* il sait quoi faire maintenant,
* sans surcharge,
* sans devoir organiser son système,
* sans avoir à réfléchir à la méthode.
