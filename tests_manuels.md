# Tests manuels en attente

## Phase V5-2b — Écran de création (M3)

### 1. Depuis Planning ou Accueil → Planifier avec récurrence mensuelle
1. Taper "+" depuis Planning ou Accueil.
2. Titre "Test Récurrence mois", heure de début renseignée.
3. Cocher "Tâche récurrente" → fréquence "Mois", fin "Le" (date précise).
4. Valider la création.
5. Dans le planning déplié, utiliser le sélecteur "Aller à une date" pour se déplacer directement
   aux dates concernées (déplacement rapide ajouté en M5) → vérifier que les occurrences
   mensuelles sont bien créées et que la série s'arrête à la date choisie.

## Phase V5-2b — Fiche tâche (M4)

### 2. Édition d'une tâche récurrente
1. Créer une tâche planifiée récurrente (fréquence Semaine).
2. Dans le planning déplié, taper sur une occurrence → vérifier que la fiche `E22TaskDetail`
   s'ouvre (et non plus un menu Déplacer/Renommer/Supprimer).
3. Modifier un champ (ex. énergie) → vérifier l'apparition de la boîte de dialogue "cette
   occurrence" / "toutes les occurrences".
4. Choisir "Cette occurrence" → vérifier que seule cette occurrence change, les autres
   restent inchangées.
5. Sur une autre occurrence, choisir "Toutes les occurrences" → vérifier que cette occurrence
   et toutes les occurrences futures (non détachées) changent, les occurrences passées non.
6. Supprimer une occurrence récurrente → vérifier la même boîte de dialogue, tester les deux
   choix (suppression d'une seule occurrence vs de la série entière à partir de celle-ci).

### 2b. Régression signalée : édition « série » sur une occurrence déjà détachée (à retester)
Bug constaté en validation manuelle le 2026-08-05 : après avoir détaché une occurrence (« Cette
occurrence »), la modifier à nouveau en choisissant cette fois « Toutes les occurrences » ne la
mettait pas à jour elle-même (seules les autres occurrences futures changeaient). Corrigé dans
`usePlanningState.ts` (`updateTaskFields`/`deleteTaskScoped` : l'occurrence cliquée est désormais
toujours incluse dans la cible, même si elle porte `recurrence_exception: true`). Couvert par un
test automatisé (`AppContext.test.tsx`), **non revalidé manuellement**.
1. Créer une tâche récurrente, ouvrir une occurrence, modifier un champ en choisissant
   « Cette occurrence » (la détache de la série).
2. Rouvrir cette même occurrence, modifier un champ en choisissant cette fois
   « Toutes les occurrences ».
3. Vérifier que l'occurrence cliquée change bien elle-même (pas seulement les autres).

## Phase V5-2b — Planning épuré (M5)

### 3. Planning sans grille, tactile réel
1. Sur l'accueil replié, vérifier que le planning affiche une liste compacte (icône/horaire/nom/
   énergie/pastille) sans quadrillage, limitée à quelques lignes.
2. Déplier le planning → vérifier le bandeau de dates (jour réel souligné, point sur le jour
   affiché), la navigation par appui sur un jour du bandeau, et le glissement tactile (swipe)
   gauche/droite pour changer de jour.
3. Créer une tâche avec des sous-étapes, la planifier → dans le planning, vérifier le compteur
   n/N et le dépliement/repliement de la liste des sous-étapes au tactile, les cases à cocher
   individuelles.
4. En mode surcharge, vérifier le bouton "Reporter" sur une tâche planifiée non obligatoire :
   la tâche doit basculer directement au lendemain, au même horaire, marquée "Reporté".
5. Depuis Réception, taper "Planifier" sur une tâche → vérifier qu'elle est placée au jour
   courant et que sa fiche s'ouvre directement pour ajuster l'horaire.
6. Depuis la fiche d'une tâche, planifier une sous-étape à un horaire propre (bouton "Horaire")
   → vérifier qu'elle apparaît comme sa propre ligne dans le planning à cet horaire, en plus
   d'être comptée dans le n/N de sa tâche parente.
7. Vérifier que l'écran "Aujourd'hui" dédié a bien disparu (retiré en M5, remplacé par la
   section "Tâche du jour" déjà présente sur l'accueil) — aucun bouton ne doit plus y renvoyer.
