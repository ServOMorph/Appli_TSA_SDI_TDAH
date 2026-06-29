export type RoutineType = 'morning' | 'evening'

export interface Routine {
  id: string
  name: string
  type: RoutineType
  duration_minutes: number
  created_at: string
  updated_at: string
}
