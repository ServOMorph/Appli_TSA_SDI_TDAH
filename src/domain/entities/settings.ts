export type FontSize = 'small' | 'medium' | 'large'

export interface Settings {
  id: string
  user_id: string
  dark_mode: boolean
  font_size: FontSize
  reduced_motion: boolean
  ambiance_color?: string
  energy_max?: number
  /** Couleur de fond de la carte « Mon compte » de l'accueil (câblage particulier, #31 : ce n'est pas un `Tool`). */
  mon_compte_color?: string
}
