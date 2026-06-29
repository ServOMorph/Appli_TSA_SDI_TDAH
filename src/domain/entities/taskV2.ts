export type TaskStatusV2 = 'todo' | 'planned' | 'to_plan' | 'completed'

export interface TaskV2 {
  id: string
  title: string
  status: TaskStatusV2
  essential: boolean
  position: number
  scheduled_date: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}
