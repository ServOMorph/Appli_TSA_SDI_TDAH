# Spécification — Tâches, planning et énergie

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/ui/screens/tasks/E20Inbox.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `src/ui/screens/tasks/E22TaskDetail.tsx`, `src/ui/screens/tasks/E23Decompose.tsx`, `src/ui/screens/dashboard/E12WeekPlanning.tsx`, `src/ui/screens/energy/E31EnergyCheckIn.tsx`, `src/ui/screens/overload/E90OverloadRecovery.tsx`, `src/domain/rules/taskRules.ts`, `src/domain/rules/energyRules.ts`, `src/app/contexts/usePlanningState.ts`.

## Objectif

Créer des tâches, les organiser dans le temps et ajuster le planning à l'énergie disponible.

## Parcours Réception et tâche

`E20` liste les tâches à l'état Réception. L'utilisateur peut y ajouter une tâche au titre non vide, ouvrir son détail, la planifier le jour même ou la déplacer vers une liste existante ou nouvellement créée. Si la tâche contient des sous-tâches, la conversion en liste demande une confirmation : les sous-tâches ne sont pas transférées.

`E21` crée une tâche détaillée. `E22` expose les informations et actions de la tâche sélectionnée. `E23` permet de la décomposer en sous-tâches. Une tâche peut être terminée puis rouverte ; après réouverture, elle retourne en planning si elle porte une date, sinon dans la Réception.

## Planning et récurrence

Une tâche planifiée possède une date et peut avoir un horaire. L'heure de fin est calculée à partir de la durée et ne dépasse pas 23:59. Le planning hebdomadaire affiche les tâches de chaque jour et ouvre leur détail.

La récurrence accepte les fréquences quotidienne, hebdomadaire, mensuelle et annuelle, un intervalle et une fin absente, par date ou par nombre d'occurrences. La création matérialise une fenêtre de 90 jours. Les modifications et suppressions distinguent l'occurrence courante des occurrences futures.

## Énergie et surcharge

`E31` enregistre une valeur entière de 1 à 12 ou un statut ignoré pour le jour. Le coût d'énergie des tâches planifiées est additionné. Le mode surcharge s'active uniquement lorsque cette somme est strictement supérieure au relevé du jour.

`E90` présente des conseils de récupération et un retour à l'accueil ; il ne modifie ni la tâche ni l'énergie. En surcharge, l'accueil masque les outils racine.

## Erreurs et limites

- La création rapide sans titre est ignorée.
- La validation du relevé exige une valeur ; l'utilisateur peut choisir l'alternative « Ignorer ».
- Sans relevé renseigné, aucun mode surcharge n'est déclenché.
- Les tâches sans coût d'énergie ne contribuent pas au total planifié.

## Critères d'acceptation

- Une tâche créée depuis la Réception apparaît dans la liste et peut être ouverte.
- Planifier une tâche depuis la Réception l'ouvre ensuite dans son détail.
- Une conversion vers une liste propose une confirmation si des sous-tâches existent.
- Une tâche planifiée contribue au coût total du jour avec son coût d'énergie, le cas échéant.
- Un total strictement supérieur à l'énergie renseignée rend accessible le parcours de récupération.

## Preuves existantes

Les règles de cycle de vie, d'horaires et de surcharge sont portées par les composants et règles listés en sources. La recherche des tests ciblant ces écrans n'a pas retourné de fichier dédié.
