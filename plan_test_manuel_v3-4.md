# Plan de Test Manuel — V3-4 (Planning : cuillères, couleurs, récurrence)

Scope basé sur `roadmap_v3.md` Phase V3-4 (E7, E8, P1-P4b, D5, P6). Couvre l'affichage en cuillères, la couleur d'ambiance configurable, le bouton « Terminer » sur le planning, et la récurrence (rester dans le planning après validation). Ne couvre pas le check-in/surcharge (déjà testé en V3-3).

---

## 1. Composant cuillères (E7, E8)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 1.1 | Happy path | Planifier une tâche avec un coût en énergie (ex. 5), l'assigner à un créneau | Sur la case du planning, le coût s'affiche avec une petite icône de cuillère à côté du chiffre, à droite du titre de la tâche |
| 1.2 | Fonctionnel | Observer le style de l'icône | Icône sobre en traits (pas de couleur vive, pas d'étoile, pas de style enfantin) — cohérente avec les autres icônes de l'app (roue des paramètres, document ressources) |
| 1.3 | Edge case | Planifier une tâche sans renseigner de coût en énergie | Aucune icône ni chiffre ne s'affiche sur la case (le coût reste optionnel, E3) |
| 1.4 | Fonctionnel | Observer la case correspondante dans « Planning du jour » sur le Dashboard | Le même affichage cuillère + chiffre apparaît, cohérent avec le Planning |

## 2. Texte des cases (P1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 2.1 | Fonctionnel | Observer une case du planning contenant une tâche | Le texte est plus grand et lisible que dans la version précédente, centré dans la case |
| 2.2 | Edge case | Observer une tâche avec un titre long | Le texte reste lisible, la case ne casse pas la mise en page (pas de débordement visuel majeur) |

## 3. Couleur d'ambiance et cases pastel (P2, P3, D5)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 3.1 | Happy path | Aller dans Paramètres > Accessibilité | Un sélecteur de couleur « Couleur d'ambiance » est visible, avec une couleur par défaut déjà sélectionnée |
| 3.2 | Happy path | Changer la couleur d'ambiance (ex. vers un orange) | Le changement est conservé après retour au Dashboard/Planning |
| 3.3 | Happy path | Planifier une tâche à un créneau | La case du planning s'affiche en version pastel (claire) de la couleur d'ambiance choisie |
| 3.4 | Fonctionnel | Planifier une tâche obligatoire | La case obligatoire s'affiche dans une teinte plus soutenue que la case pastel classique, mais reste dans la même couleur d'ambiance |
| 3.5 | Happy path | Observer « Planning du jour » sur le Dashboard | Les tâches y apparaissent chacune dans un encadré (carte) de style pastel, semblable à la présentation de « Tâche du jour » (D5) |
| 3.6 | Fonctionnel | Changer à nouveau la couleur d'ambiance dans les paramètres, puis revenir sur le Planning et le Dashboard | Les cases (Planning et Dashboard) reflètent la nouvelle couleur choisie, de façon cohérente entre les deux écrans |

## 4. Tâche terminée : couleur flashy + bouton Terminer (P2, P4b)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 4.1 | Happy path | Sur une tâche planifiée non terminée dans le Planning, chercher un bouton « Terminer » | Le bouton est visible à côté de la case (nouveauté : jusqu'ici disponible seulement sur le Dashboard) |
| 4.2 | Happy path | Cliquer sur « Terminer » dans le Planning | La case passe en couleur flashy (pleine couleur d'ambiance, plus soutenue que le pastel), le texte est barré, la case reste affichée (ne disparaît pas, cf. P4a) |
| 4.3 | Fonctionnel | Observer la même tâche terminée sur le Dashboard (« Planning du jour ») | Même rendu flashy, cohérent avec le Planning |
| 4.4 | Edge case | Observer une tâche déjà terminée | Le bouton « Terminer » n'est plus proposé dessus (ni dans le Planning, ni sur le Dashboard) |

## 5. Récurrence — bouton « Répéter demain » (P6)

> Version révisée après test manuel : l'avance automatique au jour suivant après chaque planification masquait la tâche qu'on venait de placer (elle semblait avoir disparu). Remplacée par un bouton explicite.

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 5.1 | Happy path | Depuis le Planning, cliquer sur une case vide, saisir un titre (ex. « McDo »), un coût en énergie et valider avec « Planifier » | La tâche s'affiche immédiatement sur la case du jour courant, sans changement de jour affiché |
| 5.2 | Happy path | Sur cette tâche, chercher un bouton « Répéter demain » | Le bouton est visible à côté de « Terminer » (et « Reporter » si en surcharge) |
| 5.3 | Happy path | Cliquer sur « Répéter demain » | Une copie de la tâche (même titre, même coût en énergie, même statut obligatoire) est créée au même créneau horaire le lendemain, **et le Planning s'ouvre directement sur ce jour-là** pour la montrer |
| 5.4 | Fonctionnel | Depuis ce jour affiché, cliquer sur « ‹ Jour précédent » | On retrouve la tâche d'origine sur le jour de départ, toujours présente (la copie n'a pas déplacé l'originale) |
| 5.5 | Fonctionnel | Répéter l'opération plusieurs jours de suite (cliquer « Répéter demain » sur la copie affichée, encore et encore) | Chaque clic crée une nouvelle copie et avance la vue d'un jour, permettant d'enchaîner rapidement sur plusieurs jours consécutifs (cas d'usage cité par Marie : « McDo tous les jours ») |
| 5.6 | Fonctionnel | Depuis le Dashboard (« Planning du jour »), cliquer sur « Répéter demain » | L'app navigue automatiquement vers l'écran Planning, ouvert directement sur le jour où la copie a été créée |
| 5.7 | Edge case | Cliquer sur « Répéter demain » sur une tâche déjà terminée | La copie créée le lendemain est à l'état non terminé (planifiée), même si l'originale est marquée terminée |
| 5.8 | Edge case | Cliquer plusieurs fois sur « Répéter demain » sur la même tâche | Chaque clic crée une nouvelle copie au lendemain de la tâche d'origine (pas de déplacement, l'originale reste en place) |

---

## Points d'attention

- La couleur d'ambiance par défaut correspond à la couleur bleue déjà utilisée dans l'app avant cette phase (aucun changement visuel si l'utilisateur ne touche pas au réglage).
- Le mécanisme de récurrence (§5) a été révisé après un premier essai manuel : l'avance automatique au jour suivant (interprétation initiale de la transcription du 2026-07-06, l.448-467) rendait la tâche invisible juste après l'avoir planifiée, ce qui se lisait comme un bug. Remplacé par un bouton explicite « Répéter demain », plus prévisible mais nécessitant un clic par jour (pas de saisie en rafale sur plusieurs jours en un seul geste). Si ce compromis ne convient pas à Marie à l'usage, le noter pour la prochaine session avec elle.
- Ce plan ne couvre pas le check-in énergie ni le déclenchement du mode surcharge (déjà testés en V3-3, `plan_test_manuel_v3-3.md`).
