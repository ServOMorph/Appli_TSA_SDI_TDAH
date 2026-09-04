export type TaskStatus = 'inbox' | 'planned' | 'completed'

export interface Task {
  id: string
  /** null pour une tâche principale, id de la tâche parente pour une sous-étape. */
  parent_id: string | null
  title: string
  description: string
  status: TaskStatus
  essential: boolean
  energy_cost: number | null
  postponed: boolean
  position: number
  scheduled_date: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  duration_minutes: number | null
  icon: string | null
  color: string | null
  /** Identifiant partagé par toutes les occurrences d'une série récurrente. */
  recurrence_id: string | null
  /** true pour l'occurrence qui porte la règle (`TaskRecurrence`) de la série. */
  is_recurrence_root: boolean
  /** true si cette occurrence a été détachée de la série (édition "cette occurrence"). */
  recurrence_exception: boolean
  created_at: string
  updated_at: string
  completed_at: string | null
}
