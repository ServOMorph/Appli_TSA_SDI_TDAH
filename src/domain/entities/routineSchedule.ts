/**
 * Jour de semaine (0 = dimanche ... 6 = samedi), même convention que TaskRecurrence.weekdays.
 * `steps_overridden` : true si ce jour a été détaché (modification propre à ce jour uniquement,
 * Phase 6) — ses étapes sont alors celles de `RoutineStep` marquées avec ce `weekday`, au lieu
 * des étapes communes (`RoutineStep.weekday === null`).
 * `duration_minutes` : durée propre à ce jour (facultative) ; absente ou `null`, la durée de la
 * routine (`Routine.duration_minutes`) s'applique.
 */
export interface RoutineSchedule {
  id: string
  routine_id: string
  weekday: number
  time: string
  steps_overridden: boolean
  duration_minutes?: number | null
  created_at: string
  updated_at: string
}
