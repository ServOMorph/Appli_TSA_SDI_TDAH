export type RoutineType = 'morning' | 'evening'

export interface Routine {
  id: string
  name: string
  type: RoutineType
  duration_minutes: number
  scheduled_date?: string | null
  scheduled_start?: string | null
  created_at: string
  updated_at: string
}
