# Plan de Test Manuel — V3-3 (check-in + surcharge automatique)

Scope basé sur `roadmap_v3.md` Phase V3-3 (E4, E5, E6). Ne couvre que le check-in énergie récurrent, le déclenchement automatique du mode surcharge et son affichage (obligatoires en pastel, non-obligatoires grisées + action « Reporter »). Ne couvre pas les cuillères/couleurs configurables (prévues en V3-4).

---

## 1. Check-in énergie à chaque connexion (E4)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 1.1 | Happy path | Cliquer sur "Reset DB" (bouton dev), refaire l'onboarding sans toucher à l'énergie, puis fermer l'onglet et en rouvrir un nouveau | L'écran de check-in énergie s'affiche automatiquement, avant le dashboard. Attention : dès qu'une entrée existe pour aujourd'hui (même "Ignorer"), le check-in ne se réaffiche plus tant que la date ne change pas — ce n'est pas un bug, voir cas 1.3 |
| 1.2 | Happy path | Saisir une valeur d'énergie (1 à 12) sur l'écran de check-in | L'app arrive sur le dashboard, la valeur est affichée dans la TopBar |
| 1.3 | Edge case | Rouvrir l'app le même jour après avoir déjà saisi l'énergie | L'app va directement au dashboard, sans repasser par le check-in |
| 1.4 | Fonctionnel | Depuis le dashboard, cliquer sur le bouton "Modifier" de l'énergie | Un nouvel écran de saisie s'ouvre, permet de changer la valeur à tout moment de la journée |
| 1.5 | Fonctionnel | Vérifier l'échelle affichée au check-in | Les valeurs vont de 1 à 12 (pas 1 à 10) |

## 2. Déclenchement automatique du mode surcharge (E5)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 2.1 | Happy path | Saisir une énergie basse (ex. 3), planifier des tâches dont la somme des coûts dépasse cette valeur | Le mode surcharge s'active automatiquement, sans action manuelle |
| 2.2 | Happy path | Terminer ou reporter des tâches jusqu'à ce que le coût restant planifié repasse sous l'énergie du jour | Le mode surcharge se désactive automatiquement |
| 2.3 | Edge case | Saisir une énergie haute (ex. 12) avec peu de tâches planifiées | Le mode surcharge ne s'active pas |
| 2.4 | Fonctionnel | En mode normal (hors surcharge), observer le bouton "Mode surcharge" de la TopBar | Le bouton est grisé/non cliquable (« Mode surcharge désactivé ») |
| 2.5 | Fonctionnel | En mode surcharge, observer le même bouton | Le bouton devient coloré et cliquable |
| 2.6 | Fonctionnel | Cliquer sur le bouton en mode surcharge | Un détail chiffré s'affiche (énergie planifiée vs énergie disponible aujourd'hui) |
| 2.7 | Edge case | Essayer d'activer ou de désactiver manuellement le mode surcharge (bouton, réglages) | Aucune action manuelle possible : le mode est strictement piloté par l'énergie saisie |

## 3. Affichage du planning en mode surcharge (E6)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 3.1 | Happy path | Passer en surcharge avec au moins une tâche obligatoire et une tâche non obligatoire planifiées aujourd'hui | La section "Tâche du jour" du Dashboard disparaît, mais "Planning du jour" reste visible |
| 3.2 | Fonctionnel | Observer la tâche obligatoire dans "Planning du jour" et dans le Planning | Elle s'affiche en couleur pastel (normale), pas grisée |
| 3.3 | Fonctionnel | Observer la tâche non obligatoire dans les deux écrans | Elle s'affiche grisée/atténuée, mais reste visible et lisible (pas masquée) |
| 3.4 | Edge case | Sans aucune tâche planifiée aujourd'hui, quelle que soit l'énergie saisie | Impossible de passer en surcharge : `plannedCost` vaut 0, qui ne peut jamais dépasser une énergie ≥ 1 (`isOverloaded`, `energyRules.ts`). Ce n'est pas un bug si le mode surcharge ne s'active pas dans ce cas — c'est le comportement attendu depuis que la surcharge est dérivée automatiquement (E5) |

## 4. Action « Reporter » sur les tâches non-obligatoires grisées (E6)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 4.1 | Happy path | En surcharge, sur une tâche non obligatoire grisée dans "Planning du jour" (Dashboard), cliquer sur "Reporter" | La tâche disparaît du planning du jour |
| 4.2 | Happy path | Aller sur le Planning du lendemain | La tâche reportée apparaît au même créneau horaire que la veille |
| 4.3 | Fonctionnel | En surcharge, sur une tâche non obligatoire grisée dans le Planning (jour courant), cliquer sur "Reporter" | Même comportement que 4.1 : la tâche quitte le jour courant, réapparaît demain au même créneau |
| 4.4 | Edge case | Observer une tâche **obligatoire** en surcharge | Aucun bouton "Reporter" n'est proposé dessus |
| 4.5 | Edge case | Observer une tâche (obligatoire ou non) déjà marquée "Terminé" | Aucun bouton "Reporter" n'est proposé dessus |
| 4.6 | Edge case | Observer une tâche non obligatoire **hors mode surcharge** | Aucun bouton "Reporter" n'est proposé (uniquement disponible en surcharge) |
| 4.7 | Fonctionnel | Reporter une tâche qui fait basculer le coût planifié restant sous l'énergie du jour | Le mode surcharge se désactive automatiquement juste après le report (E5) |
| 4.8 | ~~Edge case~~ | ~~Reporter la même tâche plusieurs jours de suite~~ | **Non testable manuellement** (nécessiterait de simuler plusieurs jours consécutifs en surcharge via la date dev). Couvert autrement : `postponeTaskV2` est une fonction pure sans état (juste `scheduled_date + 1 jour`), l'appliquer N fois ne peut pas accumuler d'erreur ni créer de doublon ; testé unitairement (rollover de fin de mois, `taskRulesV2.test.ts`) |

## 5. Écran de récupération et navigation en surcharge

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 5.1 | Fonctionnel | En surcharge, cliquer sur "Centre récupération" | L'écran `E90OverloadRecovery` s'affiche |
| 5.2 | Fonctionnel | Sur cet écran, chercher un bouton pour désactiver le mode surcharge | Le bouton "Désactiver" n'existe plus, remplacé par "Retour au tableau de bord" |
| 5.3 | Fonctionnel | Chercher les boutons Todo / Planning / Listes pendant que le mode surcharge est actif | **Confirmé intentionnel (2026-07-07) :** `BottomNav.tsx` masque le groupe Todo/Planning/Listes et "Ajouter une tâche" en surcharge, par choix — seuls le Dashboard et le Centre récupération restent accessibles, pour simplifier l'UI en cas de surcharge. Ce n'est pas un bug |

---

## Points d'attention

- Le comportement de l'action « Reporter » (report au lendemain, même créneau) est une **décision provisoire non validée explicitement par Marie** — voir `Note de réunion/a demander a Marie.md`. Si le test manuel révèle un comportement gênant (ex. glissement répété sur plusieurs jours, cas 4.8), le noter précisément pour la prochaine session avec elle plutôt que de considérer le point comme tranché.
- Le barème d'énergie (1-12) reste strictement personnel : ne pas juger une valeur "trop haute" ou "trop basse", seul le déclenchement automatique de la surcharge compte pour ce test.
- Ce plan ne couvre pas l'affichage en cuillères ni la couleur pastel configurable (Phase V3-4).
