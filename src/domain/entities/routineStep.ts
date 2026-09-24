/**
 * `weekday`: `null` = étape commune (partagée par tous les jours planifiés non détachés).
 * Un nombre = étape propre à ce jour de semaine uniquement, créée en détachant le jour
 * (`RoutineSchedule.steps_overridden`), indépendante des étapes communes.
 */
export interface RoutineStep {
  id: string
  routine_id: string
  title: string
  position: number
  duration_minutes: number | null
  weekday: number | null
  created_at: string
  updated_at: string
}
