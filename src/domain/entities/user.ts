export type NeuroCategory = 'tsa' | 'tdah' | 'sdi' | 'avec_di' | 'hpi' | 'neurotypique' | 'ne_sais_pas'

export type LegacyProfileType = 'teenager' | 'student' | 'adult'

export interface User {
  id: string
  /** Remplacé par `neuro_categories` : conservé pour les enregistrements et exports antérieurs. */
  profile_type?: LegacyProfileType
  neuro_categories?: NeuroCategory[]
  age?: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}
