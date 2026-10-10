# Pistes de jeu à prototyper

Statut : proposition C rejetée après essai et retirée du banc JEUX. Nouvelle proposition D en attente de décision.

## Ce que les prototypes précédents nous apprennent

Les trois prototypes viennent d'être retirés. Le tri a été jugé trop simple, le planning d'énergie pas assez ludique, et le jeu de fruits trop proche de Fruit Merge. L'analyse conservée dans [`donnees/analyse_prototypes_rejetes.md`](donnees/analyse_prototypes_rejetes.md) précise les boucles et les leçons.

La règle de conception pour cette série est de distinguer le geste central, la décision et le plaisir produit, pas seulement le thème ou les bonus. Les jeux cités par l'utilisateur suggèrent plusieurs pistes de goût (action, espace, réactions gratifiantes), mais les éléments préférés restent à préciser.

## A. Pendule — Le grappin de gravité

**Genre** : arcade d'adresse fondée sur l'inertie.

Le joueur pilote un petit engin dans une arène spatiale. Il lance un câble vers un anneau, se laisse entraîner dans une courbe, puis relâche au bon moment pour traverser une porte et récupérer un noyau. Une trajectoire propre peut enchaîner plusieurs anneaux et produire un grand « sillage » lumineux.

- **Geste central** : accrocher, prendre de l'élan, relâcher.
- **Plaisir visé** : réussir une trajectoire qui semblait difficile et sentir que l'on maîtrise son élan.
- **Progression** : salles courtes avec nouveaux placements d'anneaux, vent directionnel ou portes mobiles, introduits un par un.
- **Différence de boucle** : pas de course automatique, pas de blocs à placer, pas de fusion d'objets ; le cœur est une trajectoire choisie et exécutée.
- **Prototype minimal** : une arène, un câble, trois anneaux, une porte et une reprise immédiate après collision.

## B. Éclipse — Deux mondes, un seul pas

**Genre** : jeu de plateforme d'action avec changement de phase.

Le personnage se déplace et saute dans des pièces courtes. Une commande bascule la pièce entre deux versions : les plateformes et les dangers changent de place ou de nature. Le joueur doit parfois changer de phase en plein saut pour faire apparaître le sol qui recevra le personnage.

- **Geste central** : se déplacer, sauter, basculer entre deux versions du monde.
- **Plaisir visé** : comprendre la règle d'une salle puis réussir une séquence fluide de changements de phase.
- **Progression** : salles qui combinent graduellement plateformes, obstacles et passages visibles dans une seule phase.
- **Différence de boucle** : le plateau n'est pas construit avec des pièces ; c'est le monde entier qui change sous le joueur.
- **Prototype minimal** : contrôle latéral, saut, une commande de phase, cinq salles faites à la main et checkpoints.

## C. Résonance — Le jardin des échos

**Rejeté le 2026-10-10 : jeu jugé insuffisamment intéressant ; prototype supprimé.** Le retour et l'analyse sont conservés dans `JEUX/donnees/analyse_prototypes_rejetes.md`.

**Genre** : puzzle d'exploration sonore et spatiale.

Dans un jardin nocturne, le joueur envoie une impulsion depuis une fleur. Elle rebondit sur des pétales-miroirs et réveille des carillons dans un ordre lisible à l'écran. Il oriente ou déplace quelques miroirs pour faire parvenir l'écho à la bonne destination. Le son est facultatif : chaque signal possède aussi une forme et une couleur distinctes.

- **Geste central** : envoyer une impulsion, observer son trajet, orienter un miroir, écouter ou regarder la séquence obtenue.
- **Plaisir visé** : découvrir une chaîne de propagation et entendre/voir le motif prendre forme.
- **Progression** : niveaux sans compte à rebours, avec un nouvel élément de propagation à la fois ; le joueur peut réécouter ou rejouer chaque étape.
- **Différence de boucle** : ni classement de formes, ni rangement de tâches, ni fusion ; il s'agit de composer un trajet d'échos.
- **Prototype minimal** : une scène, trois miroirs orientables, deux carillons, un objectif et un bouton rejouer.

## D. Ricochet — La fabrique à météores

**Genre** : arcade d'adresse et de réactions en chaîne.

Un météore rebondit en continu dans une arène remplie de cristaux. Le joueur trace du doigt un court mur incliné là où il veut dévier le météore. Le mur disparaît après le choc ; il faut observer la nouvelle trajectoire et dessiner le prochain. Un cristal touché éclate en fragments qui peuvent déclencher d'autres impacts. Les enchaînements chargent une courte phase à plusieurs météores.

- **Geste central** : tracer un rebond pendant que le météore se déplace, puis réagir à la trajectoire obtenue.
- **Plaisir visé** : sauver une balle au dernier moment, trouver un angle inattendu et provoquer une cascade visible.
- **Décisions pendant l'action** : placer le mur pour viser un cristal, préserver le météore ou préparer un enchaînement ; un seul mur peut être actif à la fois.
- **Progression** : premières arènes avec cristaux fixes, puis cristaux mobiles, obstacles et surfaces qui modifient les rebonds. La difficulté change par les choix de trajectoire, pas seulement par la vitesse.
- **Fin et reprise** : trois météores perdus terminent une manche ; redémarrage immédiat. Aucun compte à rebours imposé.
- **Prototype minimal** : une arène, le tracé tactile/souris d'un mur, physique de rebond lisible, cinq dispositions de cristaux, effets de chaîne et relance instantanée.

Ce concept est une hypothèse de divertissement, à juger sur une courte version jouable avant d'ajouter du contenu.

## Critères communs pour choisir et prototyper

- Le premier écran doit permettre d'essayer le geste central immédiatement.
- Les commandes doivent être intuitives ; la compétence vient ensuite de la maîtrise du système, pas de menus ou d'instructions longues.
- Les niveaux doivent fournir un feedback immédiat et lisible, une reprise simple et une sortie libre.
- Pas de séries quotidiennes, classements publics, récompenses aléatoires payantes ni compte à rebours imposé.
- Chaque concept reste une hypothèse tant qu'il n'a pas été joué et évalué par l'utilisateur.

## Méthode et références

Les concepts sont décrits par leur boucle et leur effet recherché avant d'ajouter du contenu. Cette méthode s'appuie sur le cadre MDA (mécaniques, dynamiques, expérience ressentie) de Hunicke, LeBlanc et Zubek, et sur la nécessité de prototyper puis tester les boucles pour observer l'expérience réelle, décrite par Eladhari et Ollila. Une étude de Ryan, Rigby et Przybylski relie l'appréciation du jeu, dans les jeux et contextes étudiés, à l'autonomie et au sentiment de compétence ; cela motive ici des contrôles directs et une maîtrise visible, sans garantir qu'un concept plaira à cette joueuse.

- Hunicke, LeBlanc, Zubek (2004), [MDA: A Formal Approach to Game Design and Game Research](https://www.cs.northwestern.edu/~hunicke/MDA.pdf).
- Eladhari, Ollila (2012), [Design for Research Results: Experimental Prototyping and Play Testing](https://doi.org/10.1177/1046878111434255).
- Ryan, Rigby, Przybylski (2006), [The Motivational Pull of Video Games: A Self-Determination Theory Approach](https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf).
