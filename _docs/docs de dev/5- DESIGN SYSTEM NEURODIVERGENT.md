# DESIGN SYSTEM NEURODIVERGENT

# Application AuDHD — Organisation, routines, énergie et social

Version : 1.0

---

# 1. Objectif du document

Ce document définit :

* les règles visuelles
* les composants UI
* les principes d'accessibilité cognitive
* les niveaux de stimulation
* les comportements d'interface

Il constitue la référence unique pour :

* UX
* UI
* Développement Front-End

---

# 2. Principes Fondateurs

L'application n'est pas conçue pour être :

* spectaculaire
* engageante par addiction
* ludique à tout prix

Elle est conçue pour être :

* rassurante
* prévisible
* stable
* compréhensible
* peu fatigante cognitivement

---

# 3. Principes Neurodivergents

## Réduction de charge cognitive

Limiter :

* les choix simultanés
* les notifications
* les distractions
* les animations

---

## Reconnaissance plutôt que mémorisation

L'utilisateur ne doit pas avoir besoin de se souvenir.

L'interface doit montrer :

* quoi faire
* où aller
* quoi faire ensuite

---

## Prévisibilité

La structure reste identique partout.

Les éléments ne changent jamais de place sans raison.

---

## Contrôle utilisateur

L'utilisateur conserve toujours :

* le dernier mot
* la possibilité d'annuler
* la possibilité de modifier

---

# 4. Modes de Stimulation

L'application utilise une architecture unique.

Seule l'intensité visuelle varie.

---

# 5. Mode Calme

## Objectif

Réduire la surcharge sensorielle.

---

## Caractéristiques

Animations :

* désactivées

Transitions :

* instantanées

Contrastes :

* modérés

Feedbacks :

* très discrets

Icônes :

* minimales

---

## Utilisateurs concernés

* surcharge
* fatigue
* burnout
* récupération

---

# 6. Mode Standard

## Objectif

Équilibre entre confort et visibilité.

---

## Caractéristiques

Animations :

* légères

Transitions :

* douces

Feedbacks :

* visibles mais sobres

---

## Mode par défaut

Tous les nouveaux utilisateurs.

---

# 7. Mode Dynamique

## Objectif

Augmenter l'engagement sans surcharger.

---

## Caractéristiques

Animations :

* plus visibles

Feedbacks :

* renforcés

Micro-récompenses :

* présentes

Contrastes :

* légèrement plus élevés

---

## Limites

Jamais :

* clignotements
* effets agressifs
* sons automatiques

---

# 8. Palette de Couleurs

## Philosophie

Les couleurs indiquent un état.

Elles ne doivent jamais être décoratives uniquement.

---

## Couleurs principales

### Primaire

Utilisée pour :

* action principale
* navigation active

---

### Secondaire

Utilisée pour :

* actions secondaires

---

### Succès

Utilisée pour :

* tâche terminée
* sauvegarde réussie

---

### Attention

Utilisée pour :

* information importante

Jamais pour culpabiliser.

---

### Erreur

Utilisée uniquement pour :

* erreur réelle
* action impossible

---

# 9. Contraste

Minimum :

WCAG AA

Objectif :

WCAG AAA lorsque possible.

---

# 10. Typographie

## Principes

Lisibilité avant personnalité.

---

## Police

Sans-serif.

Exemples :

* Inter
* Atkinson Hyperlegible
* Source Sans

---

## Hiérarchie

### H1

Titre écran

### H2

Section

### Body

Texte principal

### Caption

Texte secondaire

---

# 11. Grille et Espacements

## Philosophie

L'espace vide réduit la charge cognitive.

---

## Espacement de base

8 px

Multiples :

8
16
24
32
48

---

## Largeur contenu mobile

Maximiser la lisibilité.

Éviter les écrans denses.

---

# 12. Boutons

## Bouton principal

Une seule action dominante.

Exemple :

Ajouter tâche

---

## Bouton secondaire

Actions complémentaires.

Exemple :

Annuler

---

## Règle

Maximum :

1 bouton principal visible par écran.

---

# 13. Cartes

## Utilisation

Regrouper les informations.

Exemple :

Carte tâche

Carte routine

Carte contact

---

## Structure

Titre

Informations utiles

Action principale

---

## Interdictions

Pas de surcharge d'informations.

---

# 14. Icônes

## Utilisation

Renforcer la compréhension.

Jamais remplacer totalement le texte.

---

## Règle

Chaque icône importante possède un libellé.

---

# 15. Notifications

## Philosophie

Calm by Default

---

## Deux canaux distincts

* **Notification push** : interruption hors application. Plafonnée à 2 par jour.
* **Suggestion in-app** : élément passif dans l'interface (ex : carte de reconnexion). Non plafonnée, non intrusive, ne déclenche aucune alerte système.

Le plafond ci-dessous ne concerne que les notifications push.

---

## Maximum

2 notifications push par jour

---

## Ton

Neutre

Respectueux

Sans culpabilisation

---

## Exemple correct

"Vous aviez prévu de contacter Marie."

---

## Exemple interdit

"Vous avez encore oublié Marie."

---

# 16. États Vides

Tous les modules doivent avoir un état vide rassurant.

---

## Inbox vide

"Aucune tâche enregistrée."

---

## Social vide

"Aucun contact enregistré."

---

## Routine vide

"Créez votre première routine."

---

# 17. États de Chargement

## Règle

Toujours montrer :

* progression
  ou
* squelette

---

## Interdiction

Écran blanc.

---

# 18. États d'Erreur

## Ton

Factuel.

Simple.

Non anxiogène.

---

## Exemple

"Impossible de synchroniser pour le moment."

---

## Interdiction

Messages techniques.

---

# 19. Feedbacks Positifs

## Objectif

Reconnaître l'action réalisée.

---

## Exemple

"Tâche terminée."

"Routine complétée."

---

## Interdiction

Gamification agressive.

---

## Pas de

* confettis
* explosions
* récompenses excessives

---

# 20. Accessibilité Cognitive

## Une action principale

Par écran.

---

## Une décision principale

Par étape.

---

## Réduction des distractions

Pas de contenu inutile.

---

## Réduction de la mémoire de travail

Montrer plutôt qu'exiger de se souvenir.

---

# 21. Mode Surcharge

## Activation

Accessible partout.

---

## Effets

Masquer :

* contenu secondaire
* statistiques
* historique

Afficher :

* action immédiate
* récupération
* routine essentielle

---

# 22. Responsive Design

## Mobile

Priorité absolue.

---

## Web

Même logique.

Même architecture.

---

## Interdiction

Fonctionnalités différentes selon plateforme.

---

# 23. Composants V1

## Navigation

Bottom navigation mobile

Sidebar web

---

## Composants principaux

* Carte tâche
* Carte routine
* Carte contact
* Carte suggestion sociale
* Carte énergie

---

## Formulaires

* Champ texte simple
* Sélecteur énergie
* Sélecteur ancre

---

## Modales

* Confirmation suppression
* Confirmation export
* Confirmation remplacement

---

# 24. Tokens Design (Développement)

## Espacements

spacing-xs
spacing-sm
spacing-md
spacing-lg
spacing-xl

---

## Typographie

font-heading
font-body
font-caption

---

## Couleurs

color-primary

color-secondary

color-success

color-warning

color-error

color-background

color-surface

---

# 25. Règles à ne jamais enfreindre

1. Une action principale par écran.
2. Pas de surcharge visuelle.
3. Pas de culpabilisation.
4. Pas de notifications excessives.
5. Pas d'animations agressives.
6. Pas d'éléments qui changent constamment de place.
7. Priorité à la lisibilité.
8. Priorité à la stabilité.
9. Priorité à l'accessibilité cognitive.
10. Priorité à la réduction de la charge mentale.

---

# 26. Définition du succès

Un utilisateur AuDHD doit pouvoir :

* comprendre immédiatement l'écran affiché
* identifier l'action principale en moins de 3 secondes
* utiliser l'application même en période de fatigue ou de surcharge
* naviguer sans devoir apprendre un système complexe

Si ces critères ne sont pas respectés, le design doit être considéré comme non conforme au Design System.
