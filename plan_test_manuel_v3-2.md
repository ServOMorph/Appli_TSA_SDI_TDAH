# Plan de Test Manuel — V3-2 (énergie : domaine + saisie)

Scope basé sur `roadmap_v3.md` Phase V3-2. Ne couvre que la saisie du coût en énergie et du caractère obligatoire à la planification (pas de surcharge auto, prévue en V3-3, ni de cuillères/couleurs, prévues en V3-4).

---

## 1. Planification d'une nouvelle tâche — fenêtre à deux carrés (E1, E2)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 1.1 | Happy path | Ouvrir le Planning, taper une case vide, saisir un titre | Deux carrés apparaissent sous le champ de titre : "Coût en énergie" (liste déroulante) et "Obligatoire" (case à cocher) |
| 1.2 | Happy path | Choisir une valeur d'énergie (ex. 5), cocher "Obligatoire", valider "Planifier" | La tâche est créée, planifiée au bon créneau, avec le coût et le caractère obligatoire enregistrés |
| 1.3 | Edge case | Valider "Planifier" sans toucher aux deux carrés (valeur "Non défini", case décochée) | La tâche est créée sans coût en énergie (aucune valeur imposée) et non obligatoire |
| 1.4 | Fonctionnel | Ouvrir la liste déroulante "Coût en énergie" | Les valeurs vont de 1 à 12 uniquement, plus l'option "Non défini" |

## 2. Planification d'une tâche en attente (depuis Todo/création — E1, E2)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 2.1 | Happy path | Depuis Todo ou création, choisir "Planifier", arriver sur le Planning, taper une case vide | La fenêtre affiche "Placer « titre » à Xh00" avec les deux carrés (énergie, obligatoire) avant le bouton "Valider" |
| 2.2 | Happy path | Choisir un coût et cocher "Obligatoire", puis "Valider" | La tâche en attente est créée avec le coût et le caractère obligatoire choisis |

## 3. Affichage minimal du coût (préparatoire V3-4)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 3.1 | Fonctionnel | Planifier une tâche avec un coût en énergie défini (ex. 7), observer sa case dans le Planning | Le titre affiche le coût à la suite (ex. « Médecin · 7 ») |
| 3.2 | Fonctionnel | Observer la même tâche dans "Planning du jour" du Dashboard | Le coût est affiché de la même façon |
| 3.3 | Edge case | Planifier une tâche sans coût défini | Aucun texte de coût affiché, ni dans le Planning ni sur le Dashboard |

## 4. Caractère obligatoire — rendu visuel existant (déjà en place depuis V3-0/V3-1)

| # | Type | Étape testeur | Résultat attendu |
|---|------|---------------|-------------------|
| 4.1 | Fonctionnel | Planifier une tâche en cochant "Obligatoire" | La case du Planning et la ligne du Dashboard utilisent la couleur pleine (déjà existante pour `essential`), contrairement à une tâche non obligatoire |

---

## Points d'attention

- Le coût en énergie et le caractère obligatoire ne sont saisissables **qu'au moment de la planification** (assignation à un créneau), pas depuis l'écran de création de tâche (`E21CreateTaskV2`) : ce dernier ne fait qu'amorcer le flux avant d'arriver sur le Planning.
- Aucune conséquence fonctionnelle du coût/obligatoire à ce stade (pas de surcharge, pas de cuillères) : c'est prévu en V3-3 et V3-4. Ce plan valide uniquement la saisie et la persistance.
- Une fois créés, le coût et le caractère obligatoire ne sont pas modifiables après coup (pas d'écran d'édition) : à confirmer si acceptable ou si un besoin remonte en test.
