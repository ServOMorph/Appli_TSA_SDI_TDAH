# USER FLOWS & RÈGLES MÉTIER

# Application AuDHD — Organisation, routines, énergie et social

Version : 1.0

---

# 1. Objectif du document

Ce document décrit :

* les parcours utilisateurs
* les transitions entre écrans
* les règles métier
* les états possibles
* les cas alternatifs
* les cas limites

Il sert de référence UX fonctionnelle avant la conception des wireframes.

---

# 2. Principes UX Globaux

Tous les parcours doivent respecter :

* Une action principale par écran
* Une décision principale par étape
* Aucun formulaire complexe
* Navigation prévisible
* Retour arrière toujours possible
* Absence de culpabilisation
* Temps d'exécution minimal

---

# 3. Flow : Premier lancement (Onboarding)

## Objectif

Permettre à l'utilisateur d'obtenir une valeur immédiate.

---

### Écran 1

Bienvenue

Question :

"Quel profil vous correspond le mieux ?"

Choix :

* Adolescent
* Étudiant
* Adulte

↓

Continuer

---

### Écran 2

Question :

"Souhaitez-vous estimer vos cuillères aujourd'hui ?"

Choix :

* Oui
* Ignorer

↓

Continuer

---

### Écran 3

Question :

"Ajoutez votre première tâche"

Champ texte

↓

Valider

↓

Dashboard

---

## Règles métier

* Toutes les étapes peuvent être ignorées
* Aucun compte obligatoire
* Aucun tutoriel long
* Valeur obtenue avant la fin du parcours

---

# 4. Flow : Ajouter une tâche

## Parcours principal

Dashboard

↓

Bouton Ajouter

↓

Champ texte unique

↓

Valider

↓

Inbox

↓

Message :

"Tâche ajoutée"

---

## Cas alternatif

Champ vide

↓

Validation

↓

Bouton désactivé

---

## Règles métier

Champs obligatoires :

* titre uniquement

Champs interdits en V1 :

* priorité
* échéance obligatoire
* catégorie obligatoire

---

# 5. Flow : Consulter l'Inbox

Dashboard

↓

Inbox

↓

Liste des tâches

↓

Choix d'une tâche

---

## Actions possibles

* Modifier
* Décomposer
* Déplacer vers Aujourd'hui
* Déplacer vers Plus tard
* Supprimer

---

# 6. Flow : Décomposer une tâche

## Parcours principal

Tâche

↓

Décomposer

↓

Ajouter sous-étape

↓

Ajouter sous-étape

↓

Sauvegarder

↓

Retour tâche

---

## Cas alternatif

Aucune sous-étape

↓

Annuler

↓

Retour tâche

---

## Règles métier

* Nombre de sous-étapes illimité
* Sous-étapes cochables individuellement
* Ordre modifiable

---

# 7. Flow : Ajouter à Aujourd'hui

## Parcours principal

Inbox

↓

Sélection tâche

↓

Ajouter à Aujourd'hui

↓

Liste Aujourd'hui

---

## Cas limite

Déjà 3 tâches aujourd'hui

↓

Message :

"Choisissez une tâche à remplacer"

↓

Remplacement

↓

Validation

---

## Règles métier

Maximum :

3 tâches simultanées

---

# 8. Flow : Check-in Énergie

## Déclencheur

Premier lancement du jour

---

Question :

"Combien de cuillères aujourd'hui ?"

Choix :

1 à 10

↓

Valider

↓

Dashboard

---

## Cas alternatif

Ignorer

↓

Dashboard

---

## Règles métier

* Dernière valeur renseignée proposée par défaut
* Modification possible à tout moment
* Aucune conséquence punitive
* Proposé une seule fois par jour (au premier lancement)
* Si ignoré, l'entrée du jour est marquée `skipped` et la question n'est pas reproposée automatiquement le même jour ; l'utilisateur peut renseigner son énergie manuellement via l'écran Énergie (E30)

---

# 9. Flow : Dashboard

## Écran principal

Affiche :

* Action immédiate
* Cuillères restantes
* 3 tâches maximum
* Routine active
* Suggestion sociale éventuelle

---

## Règle de calcul de l'Action immédiate

L'« Action immédiate » est le cœur du produit (« Que dois-je faire maintenant ? »). Elle est calculée de façon **déterministe et explicable** (aucune décision opaque, cf. cahier Phase 12), par cascade de priorité :

1. Routine dont l'ancre est active et non terminée → « Continuer la routine X »
2. *(hors MVP — à insérer ici en V1)* Événement imminent dont le délai d'alerte est atteint → « Bientôt : X »
3. Première tâche non terminée d'Aujourd'hui (par `position`) → « X »
4. Suggestion de reconnexion sociale en attente → « Reprendre contact avec X »
5. Aucune action → état vide « Que souhaitez-vous ajouter ? » + bouton Ajouter tâche

La cascade s'arrête au premier élément satisfait. L'énergie déclarée n'altère pas l'ordre de cette cascade en V1 (liaison énergie ↔ tâches reportée en V2).

Note : l'étape "événement imminent" (barre temporelle, alerte de transition) est hors MVP. Elle sera insérée en position 2 de cette cascade à l'introduction de l'entité Event en V1.

---

## Actions possibles

* Ajouter tâche
* Voir Inbox
* Voir Aujourd'hui
* Voir Social
* Voir Routines
* Modifier énergie

---

# 10. Flow : Compléter une tâche

## Parcours principal

Tâche

↓

"C'est fait"

↓

Tâche terminée

↓

Micro-transition

↓

Question :

"Prendre quelques minutes ?"

Choix :

* Oui
* Continuer

---

## Cas alternatif

Continuer immédiatement

↓

Afficher prochaine action

---

## Règles métier

* Aucun enchaînement automatique
* Respect des transitions cognitives

---

# 11. Flow : Gestion des routines

## Parcours principal

Routines

↓

Créer routine

↓

Nom

↓

Choix ancre

Exemples :

* Après réveil
* Après repas
* Avant de dormir

↓

Ajouter étapes

↓

Sauvegarder

---

## Exécution

Ancre détectée par l'utilisateur

↓

Ouvrir routine

↓

Cocher étapes

↓

Terminer

---

# 12. Flow : Contacts

## Parcours principal

Social

↓

Liste contacts

↓

Fiche contact

---

## Informations visibles

* Nom
* Dernier échange
* Fréquence souhaitée
* Notes personnelles

---

## Actions

* Modifier
* Consulter modèles sociaux
* Marquer interaction effectuée

---

# 13. Flow : Suggestion de reconnexion

## Déclencheur

Fréquence dépassée

---

Dashboard

↓

Suggestion :

"Vous souhaitiez reprendre contact avec Marie."

↓

Voir fiche

↓

Choisir modèle

↓

Envoyer message

↓

Interaction enregistrée

---

# 14. Flow : Utilisation d'un modèle social

## Parcours principal

Fiche contact

↓

Modèles sociaux

↓

Catégorie

* Reprendre contact
* Remercier
* Reporter
* Refuser
* Confirmer

↓

Choisir modèle

↓

Copier

↓

Application externe

---

# 15. Flow : Préparation d'une interaction

## Avant

Créer préparation

↓

Définir :

* Objectif
* Informations à transmettre
* Informations à obtenir

↓

Sauvegarder

---

## Pendant

Ajouter notes

↓

Sauvegarde automatique

---

## Après

Choix :

* Créer tâche
* Ajouter note
* Planifier suivi

---

# 16. Flow : Activation du Mode Surcharge

## Déclencheur

Depuis n'importe quel écran

↓

Bouton permanent

↓

Activer surcharge

---

## Effets

* Réduction informations affichées
* Réduction notifications
* Mise en avant récupération
* Simplification visuelle

---

## Règle critique

Activation en moins de 2 secondes

---

# 17. Flow : Gestion du Temps

## Événement futur

Rendez-vous

↓

Barre visuelle de temps

↓

Temps diminue

↓

Alerte transition

↓

Événement

---

## Règles métier

* Représentation visuelle prioritaire
* Pas d'horloge centrale dominante

---

# 18. Flow : Notifications

## Distinction fondamentale

Deux canaux distincts, à ne pas confondre :

* **Notification push** : interruption hors application (système). Plafonnée à 2 par jour.
* **Suggestion in-app** : élément passif affiché dans l'interface au moment où l'utilisateur ouvre l'app (ex : carte de reconnexion sur le dashboard). Non plafonnée, non intrusive, ne déclenche aucune alerte système.

La limite de 2/jour s'applique **uniquement aux notifications push**. Une suggestion de reconnexion affichée sur le dashboard n'est pas une notification et ne consomme pas ce quota.

---

## Types de notifications push autorisés

### Critique

* Médicament
* Rendez-vous

### Quotidienne

* Check-in énergie

### Sociale

* Reconnexion (uniquement si l'utilisateur a activé les rappels push sociaux)

---

## Limites

Maximum :

2 notifications push par jour

---

# 19. Flow : Synchronisation

## Première activation

Paramètres

↓

Activer synchronisation

↓

Connexion compte

↓

Synchronisation

---

## Cas alternatif

Aucune connexion

↓

Fonctionnement normal

---

# 20. Flow : Export des données

Paramètres

↓

Exporter données

↓

Choix format

* JSON
* PDF
* CSV

↓

Génération

↓

Téléchargement

---

# 21. États système

## Tâche

* Inbox
* Aujourd'hui
* Plus tard
* Terminée

---

## Énergie

* Non renseignée
* Renseignée

---

## Surcharge

* Désactivée
* Activée

---

## Synchronisation

* Hors ligne
* En attente
* Synchronisée
* Erreur

---

# 22. Cas limites critiques

## Trop de tâches

Si Inbox > 100 tâches :

Aucune alerte anxiogène

Afficher simplement :

"Vous avez beaucoup d'idées enregistrées."

---

## Énergie très basse

L'application continue à fonctionner normalement.

Aucune restriction.

---

## Aucune tâche

Dashboard :

"Que souhaitez-vous ajouter ?"

Bouton :

Ajouter tâche

---

## Aucune routine

Section routines masquée.

---

## Aucun contact

Section sociale masquée.

---

# 23. Règles produit prioritaires

1. L'utilisateur garde toujours le contrôle.
2. Aucune IA obligatoire.
3. Aucun système de priorité visible.
4. Maximum 3 tâches dans Aujourd'hui.
5. Aucune culpabilisation.
6. Fonctionnement hors ligne complet.
7. Une action principale par écran.
8. Activation du mode surcharge en moins de 2 secondes.
9. Temps représenté visuellement.
10. Capture rapide prioritaire sur l'organisation.
