# WIREFRAMES BASSE FIDÉLITÉ

# Application AuDHD — Organisation, routines, énergie et social

Version : 1.0

---

# 1. Objectif du document

Ce document définit la structure fonctionnelle des écrans.

Il ne décrit pas :

* les couleurs
* la typographie
* les animations
* le design final

Il décrit uniquement :

* la hiérarchie visuelle
* les zones fonctionnelles
* les informations affichées
* les actions disponibles

---

# 2. Principes Wireframe

## Priorités visuelles

1. Action immédiate
2. Tâches du jour
3. Routine active
4. Énergie
5. Fonctionnalités secondaires

---

## Contraintes

* Maximum 1 action principale par écran
* Maximum 3 actions secondaires visibles
* Éviter les listes longues
* Éviter les blocs denses

---

# 3. Dashboard

## WF-01

```text
------------------------------------------------
Que dois-je faire maintenant ?
------------------------------------------------

[ Appeler le dentiste ]

------------------------------------------------

Cuillères : 5

------------------------------------------------

Aujourd'hui

□ Appeler le dentiste
□ Faire une lessive
□ Payer la facture

------------------------------------------------

Routine active

Routine du matin

------------------------------------------------

[ + Ajouter une tâche ]
```

---

## Dashboard vide

### WF-02

```text
------------------------------------------------

Bienvenue

------------------------------------------------

Aucune tâche pour le moment

------------------------------------------------

[ + Ajouter une tâche ]

------------------------------------------------
```

---

## Dashboard surcharge

### WF-03

```text
------------------------------------------------

Action actuelle

------------------------------------------------

[ Routine récupération ]

------------------------------------------------

[ Respiration ]
[ Pause ]

------------------------------------------------

Mode surcharge actif
```

---

# 4. Ajout de tâche

## WF-04

```text
------------------------------------------------

Nouvelle tâche

------------------------------------------------

[________________________]

------------------------------------------------

[ Ajouter ]

------------------------------------------------
```

---

## Validation

### WF-05

```text
------------------------------------------------

✓ Tâche ajoutée

------------------------------------------------

Retour Dashboard
```

---

# 5. Inbox

## WF-06

```text
------------------------------------------------

Inbox

------------------------------------------------

□ Appeler dentiste
□ Acheter médicaments
□ Envoyer document CAF

------------------------------------------------

[ + Ajouter ]
```

---

## Inbox vide

### WF-07

```text
------------------------------------------------

Inbox

------------------------------------------------

Aucune tâche enregistrée

------------------------------------------------

[ Ajouter tâche ]
```

---

# 6. Détail tâche

## WF-08

```text
------------------------------------------------

Appeler dentiste

------------------------------------------------

Sous-étapes

□ Chercher numéro
□ Appeler
□ Noter rendez-vous

------------------------------------------------

[ Décomposer ]
[ Aujourd'hui ]
[ Terminer ]
```

---

# 7. Décomposition tâche

## WF-09

```text
------------------------------------------------

Décomposer

------------------------------------------------

[____________________]

[ Ajouter étape ]

------------------------------------------------

□ Étape 1
□ Étape 2

------------------------------------------------

[ Sauvegarder ]
```

---

# 8. Aujourd'hui

## WF-10

```text
------------------------------------------------

Aujourd'hui

------------------------------------------------

1. Appeler dentiste

2. Faire lessive

3. Payer facture

------------------------------------------------

Maximum atteint
```

---

## Aujourd'hui vide

### WF-11

```text
------------------------------------------------

Aujourd'hui

------------------------------------------------

Aucune tâche prévue

------------------------------------------------

Retour Inbox
```

---

# 9. Énergie

## WF-12

```text
------------------------------------------------

Combien de cuillères aujourd'hui ?

------------------------------------------------

1 2 3 4 5

6 7 8 9 10

------------------------------------------------

[ Valider ]
```

---

## Historique énergie

### WF-13

```text
------------------------------------------------

Historique

------------------------------------------------

Aujourd'hui : 5

Hier : 4

Moyenne : 5

------------------------------------------------
```

---

# 10. Routines

## WF-14

```text
------------------------------------------------

Routines

------------------------------------------------

Routine matin

Routine soir

Routine sortie

------------------------------------------------

[ + Créer ]
```

---

## Création routine

### WF-15

```text
------------------------------------------------

Nom routine

[________________]

------------------------------------------------

Ancre

(v) Après réveil

( ) Après repas

( ) Avant coucher

------------------------------------------------

[ Continuer ]
```

---

## Routine active

### WF-16

```text
------------------------------------------------

Routine du matin

------------------------------------------------

□ Boire un verre d'eau

□ Brosser dents

□ Médicaments

------------------------------------------------

[ Terminer ]
```

---

# 11. Contacts

## WF-17

```text
------------------------------------------------

Contacts

------------------------------------------------

Marie

Thomas

Julie

------------------------------------------------

[ + Ajouter ]
```

---

## Fiche contact

### WF-18

```text
------------------------------------------------

Marie

------------------------------------------------

Dernier échange

Il y a 12 jours

------------------------------------------------

Fréquence souhaitée

Tous les 14 jours

------------------------------------------------

[ Voir modèles ]
```

---

# 12. Modèles sociaux

## WF-19

```text
------------------------------------------------

Modèles

------------------------------------------------

Reprendre contact

Remercier

Reporter

Refuser

------------------------------------------------
```

---

## Détail modèle

### WF-20

```text
------------------------------------------------

Exemple

------------------------------------------------

Bonjour !

Je pensais à toi aujourd'hui
et voulais prendre de tes nouvelles.

------------------------------------------------

[ Copier ]
```

---

# 13. Préparation interaction

## WF-21

```text
------------------------------------------------

Préparation appel

------------------------------------------------

Objectif

[______________]

------------------------------------------------

Points importants

[______________]

------------------------------------------------

Questions

[______________]

------------------------------------------------

[ Sauvegarder ]
```

---

## Notes pendant interaction

### WF-22

```text
------------------------------------------------

Notes

------------------------------------------------

[ Zone libre ]

------------------------------------------------

Sauvegarde automatique
```

---

# 14. Transition entre tâches

## WF-23

```text
------------------------------------------------

✓ C'est terminé

------------------------------------------------

Souhaitez-vous faire une pause ?

------------------------------------------------

[ Oui ]

[ Continuer ]
```

---

# 15. Gestion du temps

## WF-24

```text
------------------------------------------------

Prochain événement

Dentiste

------------------------------------------------

██████████░░░░░░░░░░

------------------------------------------------

45 minutes restantes
```

---

# 16. Suggestion sociale

## WF-25

```text
------------------------------------------------

Suggestion

------------------------------------------------

Vous souhaitiez reprendre
contact avec Marie.

------------------------------------------------

[ Voir contact ]
```

---

# 17. Mode surcharge

## WF-26

```text
------------------------------------------------

Mode surcharge

------------------------------------------------

Notifications réduites

Interface simplifiée

Routine récupération active

------------------------------------------------

[ Désactiver ]
```

---

# 18. Paramètres

## WF-27

```text
------------------------------------------------

Paramètres

------------------------------------------------

Profil

Accessibilité

Apparence

Synchronisation

Confidentialité

Export

------------------------------------------------
```

---

# 19. Export des données

## WF-28

```text
------------------------------------------------

Exporter

------------------------------------------------

( ) JSON

( ) PDF

( ) CSV

------------------------------------------------

[ Générer ]
```

---

# 20. Modal confirmation suppression

## WF-29

```text
------------------------------------------------

Supprimer cette tâche ?

------------------------------------------------

Cette action est définitive.

------------------------------------------------

[ Annuler ]

[ Supprimer ]
```

---

# 21. Navigation mobile V1

```text
Dashboard
Inbox
Routines
Social
Paramètres
```

Maximum :

5 entrées principales.

---

# 22. Navigation Web V1

```text
Dashboard
Inbox
Aujourd'hui
Routines
Social
Préparations
Paramètres
```

Menu latéral fixe.

---

# 23. Validation UX avant Design

Avant la création des maquettes haute fidélité :

Tester ces wireframes avec :

* 5 à 10 utilisateurs AuDHD
* 2 à 3 utilisateurs TSA
* 2 à 3 utilisateurs TDAH

Objectifs :

* compréhension immédiate
* absence de surcharge
* rapidité d'exécution
* clarté de l'action principale

Tout problème identifié doit être corrigé au niveau wireframe avant le passage au design system et aux maquettes haute fidélité.
