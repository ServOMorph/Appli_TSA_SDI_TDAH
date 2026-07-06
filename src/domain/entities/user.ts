export type ProfileType = 'teenager' | 'student' | 'adult'

export interface User {
  id: string
  profile_type: ProfileType
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}
