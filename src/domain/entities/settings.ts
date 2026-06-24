export type StimulationMode = 'calm' | 'standard' | 'dynamic'
export type FontSize = 'small' | 'medium' | 'large'

export interface Settings {
  id: string
  user_id: string
  stimulation_mode: StimulationMode
  dark_mode: boolean
  font_size: FontSize
  reduced_motion: boolean
  overload_mode: boolean
  local_encryption: boolean
}
