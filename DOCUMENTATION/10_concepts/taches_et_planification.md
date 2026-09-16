# Tâches et planification

**Statut :** actuel (code consulté le 2026-09-16)  
**Sources :** `src/domain/entities/task.ts`, `src/domain/entities/taskRecurrence.ts`, `src/domain/entities/taskException.ts`, `src/domain/rules/taskRules.ts`, `src/domain/rules/taskRecurrenceRules.ts`, `src/app/contexts/usePlanningState.ts`, `src/ui/screens/tasks/`.

## Cycle de vie

Une tâche principale est soit en Réception (`inbox`), planifiée (`planned`) ou terminée (`completed`). La finalisation est horodatée. Son annulation replace la tâche en planification si elle a une date, sinon dans la Réception. Le report garde le principe de planification et marque la tâche comme reportée.

## Informations et décomposition

Une tâche peut porter une description, une priorité « essentielle », un coût d'énergie de 1 à 12, une durée, une date et des heures, une icône et une couleur. L'heure de fin est dérivée de l'heure de début et de la durée, et plafonnée à 23:59.

La Réception permet de créer rapidement une tâche, de la planifier le jour même sans horaire, ou de la convertir en élément de liste. Cette conversion avertit que les sous-étapes existantes ne sont pas conservées.

Une tâche peut avoir des sous-étapes. Elles peuvent être réordonnées, terminées et planifiées individuellement. Le compteur de la tâche principale exprime les sous-étapes terminées sur le total.

## Récurrence

Une série peut être quotidienne, hebdomadaire, mensuelle ou annuelle, avec un intervalle. La règle hebdomadaire peut sélectionner des jours de semaine. La fin est soit absente, à une date donnée ou après un nombre d'occurrences.

À la création, l'application matérialise les occurrences sur une fenêtre de 90 jours. Un mois sans le quantième demandé ne crée pas d'occurrence ce mois-là. Lors d'une modification ou suppression, l'utilisateur choisit entre l'occurrence courante et les occurrences futures. Une modification limitée à une occurrence la détache de la propagation ultérieure.

## Rapport avec l'énergie

Le coût d'énergie des tâches planifiées est additionné pour la journée. Cette somme alimente l'indication « énergie planifiée / énergie disponible » et le déclenchement du mode surcharge.

Voir aussi : [Énergie et surcharge](energie_et_surcharge.md).
