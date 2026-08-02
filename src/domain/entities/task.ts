export type TaskStatus = 'inbox' | 'today' | 'planned' | 'completed'

export interface Task {
  id: string
  /** null pour une tâche principale, id de la tâche parente pour une sous-étape. */
  parent_id: string | null
  title: string
  status: TaskStatus
  essential: boolean
  energy_cost: number | null
  postponed: boolean
  position: number
  scheduled_date: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}
