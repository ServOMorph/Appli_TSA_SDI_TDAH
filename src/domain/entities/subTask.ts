export interface SubTask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  position: number
  scheduled_date: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  postponed?: boolean
}
