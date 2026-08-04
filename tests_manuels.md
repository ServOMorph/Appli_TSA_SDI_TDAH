# Tests manuels en attente

## Phase V5-2b — Écran de création (M3)

### 1. Depuis Aujourd'hui → Tâche du jour
**Bloqué** : l'écran "Aujourd'hui" n'est accessible par aucun bouton de navigation actuellement
(constaté pendant les tests M3). Reporté à la phase V5-2b/M5 (refonte du planning), qui devrait
revoir l'accès à cet écran. À retester une fois l'accès ajouté.

### 2. Depuis Planning ou Accueil → Planifier avec récurrence mensuelle
1. Taper "+" depuis Planning ou Accueil.
2. Titre "Test Récurrence mois", heure de début renseignée.
3. Cocher "Tâche récurrente" → fréquence "Mois", fin "Le" (date précise).
4. Valider la création.
5. Se déplacer dans le planning jusqu'aux dates concernées → vérifier que les occurrences
   mensuelles sont bien créées et que la série s'arrête à la date choisie.
   (Reporté jusqu'à l'implémentation du déplacement rapide dans le planning — M5.)

## Phase V5-2b — Fiche tâche (M4)

### 3. Édition d'une tâche récurrente
**Bloqué** : depuis le planning, taper une occurrence ouvre encore l'ancien menu tap-based
(Déplacer/Renommer/Supprimer), pas la fiche `E22TaskDetail` — le remplacement de ce flux par
la fiche est le travail de M5, pas encore fait. À retester une fois cette navigation branchée.
1. Créer une tâche planifiée récurrente (fréquence Semaine).
2. Ouvrir la fiche d'une des occurrences, modifier un champ (ex. énergie) → vérifier
   l'apparition de la boîte de dialogue "cette occurrence" / "toutes les occurrences".
3. Choisir "Cette occurrence" → vérifier que seule cette occurrence change, les autres
   restent inchangées.
4. Sur une autre occurrence, choisir "Toutes les occurrences" → vérifier que cette occurrence
   et toutes les occurrences futures (non détachées) changent, les occurrences passées non.
5. Supprimer une occurrence récurrente → vérifier la même boîte de dialogue, tester les deux
   choix (suppression d'une seule occurrence vs de la série entière à partir de celle-ci).
