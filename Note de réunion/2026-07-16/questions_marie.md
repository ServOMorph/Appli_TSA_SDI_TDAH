# Questions à poser à Marie — visio 2026-07-13 (suite utilisation V3)

Sources : `Note de réunion/a demander a Marie.md`, `roadmap_v3.md`, `_contexte/signals.md`.

## 1. Action « Reporter » (mode surcharge)

**Codé actuellement :** clic sur « Reporter » sur une tâche non-obligatoire grisée en surcharge → replanification automatique au lendemain, même créneau horaire.

**Question :** quand tu cliques sur « Reporter », qu'attends-tu qu'il se passe concrètement ?
- La tâche réapparaît le lendemain au même créneau (comportement actuel) ?
- Un autre jour, à choisir toi-même ?
- Ailleurs (ex. dans une liste « à reprogrammer ») ?

## 2. Fréquence du check-in énergie

**Codé actuellement :** une seule demande par jour calendaire (re-saisie possible à tout moment via le bouton « Modifier », mais pas de re-demande automatique à chaque ouverture).

**Question :** une fois par jour te convient, ou veux-tu vraiment être resollicitée à chaque ouverture de l'app, même plusieurs fois dans la même journée ?

## 3. Récurrence des tâches (« Répéter demain »)

**Codé actuellement :** bouton explicite « Répéter demain » — un clic duplique la tâche au jour suivant (1 clic = 1 jour). Un premier essai avec avance automatique de jour sans bouton a été testé et rejeté (il masquait la tâche qu'on venait de placer).

**Question :** le rythme « un clic par jour » pour dupliquer une tâche récurrente te convient, ou as-tu besoin d'un flux plus rapide pour enchaîner plusieurs jours d'affilée ?

## 4. Bouton « Mode surcharge » dans la barre du haut

**Codé actuellement :** le bouton est masqué quand le mode surcharge n'est pas actif (retiré le 2026-07-07). Cela contredit ta demande initiale : tu voulais ce bouton visible en permanence, grisé et informatif, même hors surcharge.

**Question :** le masquage actuel (invisible hors surcharge) te convient, ou veux-tu qu'on réintroduise le bouton visible/grisé comme demandé initialement ?

## 5. Planification indépendante des sous-tâches

**Contexte :** décision explicitement reportée — actuellement une sous-tâche ne peut pas être planifiée à son propre horaire, indépendamment de la tâche parente.

**Question :** ce besoin est-il toujours d'actualité dans ton usage réel de la V3 ? Si oui, à quelle fréquence en aurais-tu l'usage ?

## 6. Retour libre sur l'usage de la V3

Points à observer/demander en complément, sans qu'ils soient bloquants :
- Le nouveau flux de planification en 3 étapes (nom → énergie 1-12 → obligatoire) est-il plus clair que l'ancien ?
- L'icône batterie pour l'énergie (remplaçant les cuillères) est-elle bien comprise, ou prête-t-elle à confusion avec la batterie du téléphone ?
- Y a-t-il eu des moments où le mode surcharge s'est déclenché ou désactivé de façon inattendue ?
