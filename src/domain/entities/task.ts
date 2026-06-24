export type TaskStatus = 'inbox' | 'today' | 'later' | 'completed'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  position: number
  created_at: string
  updated_at: string
  completed_at: string | null
}
