# ARCHITECTURE DES ÉCRANS

# Application AuDHD — Organisation, routines, énergie et social

Version : 1.0

---

# 1. Objectif du document

Ce document recense l'ensemble des écrans nécessaires à la V1.

Pour chaque écran sont définis :

* objectif
* contenu principal
* actions disponibles
* états particuliers

Ce document constitue la référence structurelle avant la création des wireframes.

---

# 2. Carte globale de navigation

Dashboard
├── Ajouter tâche
├── Inbox
├── Aujourd'hui
├── Plus tard
├── Routines
├── Social
├── Énergie
├── Préparations
└── Paramètres

---

# 3. Onboarding

## E01 — Écran Bienvenue

### Objectif

Premier contact.

### Contenu

* Logo
* Message de bienvenue
* Bouton commencer

### Actions

* Continuer

---

## E02 — Choix du profil

### Contenu

* Adolescent
* Étudiant
* Adulte

### Actions

* Sélectionner profil
* Ignorer

---

## E03 — Estimation énergie

### Contenu

Question :

"Combien de cuillères aujourd'hui ?"

### Actions

* Sélectionner valeur
* Ignorer

---

## E04 — Première tâche

### Contenu

Champ texte

### Actions

* Ajouter
* Ignorer

---

# 4. Dashboard

## E10 — Dashboard principal

### Objectif

Répondre à :

"Que dois-je faire maintenant ?"

### Contenu

* Action immédiate
* Cuillères restantes
* 3 tâches du jour
* Routine active
* Suggestion sociale
* Bouton ajouter tâche

### Calcul de l'Action immédiate

Élément calculé, non statique. Affiche le premier élément satisfait de la cascade de priorité (cf. User Flows §9) :

1. Routine active non terminée
2. *(hors MVP)* Événement imminent (délai d'alerte atteint)
3. Première tâche d'Aujourd'hui (par position)
4. Suggestion de reconnexion en attente
5. État vide « Que souhaitez-vous ajouter ? »

### Actions

* Ajouter tâche
* Modifier énergie
* Voir Inbox
* Voir Aujourd'hui
* Voir Social
* Voir Routines
* Voir Préparations

---

## États Dashboard

### D10A — Aucun contenu

Affichage :

"Que souhaitez-vous ajouter ?"

Bouton :

Ajouter tâche

---

### D10B — Surcharge activée

Affichage simplifié :

* Action immédiate
* Routine active
* Bouton récupération

---

# 5. Gestion des tâches

## E20 — Inbox

### Contenu

Liste des tâches capturées.

### Actions

* Ouvrir tâche
* Ajouter tâche
* Déplacer vers Aujourd'hui
* Déplacer vers Plus tard

---

## États Inbox

### D20A — Inbox vide

Message :

"Aucune tâche enregistrée."

---

## E21 — Création tâche

### Contenu

Champ texte unique.

### Actions

* Valider
* Annuler

---

## E22 — Détail tâche

### Contenu

* Titre
* Sous-étapes
* Statut

### Actions

* Modifier
* Décomposer
* Déplacer
* Terminer
* Supprimer

---

## E23 — Décomposition tâche

### Contenu

Liste des sous-étapes.

### Actions

* Ajouter sous-étape
* Modifier
* Supprimer
* Réorganiser

---

## E24 — Aujourd'hui

### Contenu

Maximum :

3 tâches

### Actions

* Réordonner
* Retirer
* Terminer

---

## États Aujourd'hui

### D24A — Vide

Message :

"Aucune tâche sélectionnée aujourd'hui."

---

### D24B — Limite atteinte

Message :

"Vous avez déjà 3 tâches aujourd'hui."

---

## E25 — Plus tard

### Contenu

Liste des tâches reportées.

### Actions

* Déplacer vers Aujourd'hui
* Modifier
* Supprimer

---

# 6. Gestion de l'énergie

## E30 — Énergie

### Contenu

Valeur actuelle.

Historique simplifié.

### Actions

* Modifier valeur
* Consulter historique

---

## E31 — Check-in quotidien

### Contenu

Question :

"Combien de cuillères aujourd'hui ?"

### Actions

* Valider
* Ignorer

---

# 7. Routines

## E40 — Liste des routines

### Contenu

Liste des routines existantes.

### Actions

* Créer routine
* Modifier
* Supprimer

---

## États

### D40A — Aucune routine

Message :

"Créez votre première routine."

---

## E41 — Création routine

### Contenu

* Nom
* Ancre
* Étapes

### Actions

* Sauvegarder

---

## E42 — Détail routine

### Contenu

* Nom
* Ancre
* Étapes

### Actions

* Modifier
* Lancer

---

## E43 — Routine active

### Contenu

Étapes cochables.

### Actions

* Cocher
* Terminer

---

## E44 — Sélection d'ancre

### Choix

* Après réveil
* Après repas
* Avant sortie
* Avant coucher
* Personnalisée

---

# 8. Module Social

## E50 — Liste des contacts

### Contenu

Contacts enregistrés.

### Actions

* Ajouter contact
* Ouvrir contact

---

## États

### D50A — Aucun contact

Message :

"Aucun contact enregistré."

---

## E51 — Création contact

### Contenu

* Nom
* Fréquence souhaitée
* Notes

### Actions

* Sauvegarder

---

## E52 — Fiche contact

### Contenu

* Nom
* Dernier échange
* Fréquence
* Notes

### Actions

* Modifier
* Voir modèles sociaux
* Enregistrer interaction

---

## E53 — Historique contact

### Contenu

Liste des interactions.

---

## E54 — Suggestion de reconnexion

### Contenu

Suggestion proactive.

### Actions

* Voir contact
* Ignorer

---

# 9. Modèles sociaux

## E60 — Bibliothèque modèles

### Catégories

* Reprendre contact
* Remercier
* Reporter
* Refuser
* Confirmer
* Relancer

---

## E61 — Détail modèle

### Contenu

Texte du modèle.

### Actions

* Copier
* Favori

---

# 10. Préparation d'interactions

## E70 — Liste des préparations

### Contenu

Préparations existantes.

### Actions

* Créer préparation

---

## E71 — Création préparation

### Sections

Objectif

Points importants

Informations à obtenir

---

## E72 — Interaction active

### Contenu

Notes rapides.

### Actions

* Ajouter note

---

## E73 — Clôture interaction

### Actions

* Créer tâche
* Ajouter note
* Planifier suivi

---

# 11. Gestion du temps

## E80 — Vue événement

### Contenu

* Nom événement
* Barre temporelle

### Actions

* Modifier

---

## E81 — Transition

### Contenu

Message :

"Souhaitez-vous prendre quelques minutes ?"

### Actions

* Oui
* Continuer

---

# 12. Mode surcharge

## E90 — Centre récupération

### Contenu

* État actuel
* Conseils récupération
* Routine récupération

### Actions

* Désactiver surcharge

---

## Comportement global

Accessible depuis tous les écrans.

Temps d'accès :

moins de 2 secondes.

---

# 13. Notifications

## E100 — Centre notifications

### Contenu

Historique des notifications.

### Actions

* Marquer comme vues

---

# 14. Paramètres

## E110 — Paramètres principaux

### Sections

* Profil
* Accessibilité
* Apparence
* Synchronisation
* Confidentialité
* Export

---

## E111 — Profil

### Contenu

* Type de profil
* Informations générales

---

## E112 — Accessibilité

### Réglages

* Taille texte
* Contraste
* Réduction animations

---

## E113 — Stimulation cognitive

### Choix

* Calme
* Standard
* Dynamique

---

## E114 — Organisation

### Réglages

* Ordre modules
* Affichage modules

---

## E115 — Synchronisation

### Contenu

* État synchronisation
* Connexion compte

---

## E116 — Confidentialité

### Contenu

* Gestion données
* Consentements

---

## E117 — Export données

### Formats

* JSON
* PDF
* CSV

---

# 15. États système globaux

## État hors ligne

Visible sur tous les écrans.

L'application reste fonctionnelle.

---

## Synchronisation en attente

Icône discrète.

---

## Synchronisation réussie

Confirmation non intrusive.

---

## Erreur synchronisation

Message simple.

Action :

Réessayer.

---

# 16. Modales

## M01 — Confirmation suppression tâche

## M02 — Confirmation suppression routine

## M03 — Confirmation suppression contact

## M04 — Remplacement tâche Aujourd'hui

## M05 — Confirmation export

## M06 — Confirmation suppression données

---

# 17. Écrans minimums V1

Onboarding :
4 écrans

Dashboard :
2 écrans

Tâches :
6 écrans

Énergie :
2 écrans

Routines :
5 écrans

Social :
5 écrans

Modèles sociaux :
2 écrans

Préparations :
4 écrans

Temps :
2 écrans

Surcharge :
1 écran

Notifications :
1 écran

Paramètres :
8 écrans

---

Total V1 :

≈ 40 écrans fonctionnels
≈ 6 modales
≈ 15 états particuliers

Cette architecture couvre l'ensemble du périmètre V1 défini dans le cahier des charges.
