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
  /** Code testeur saisi en Paramètres > Profil. Identifiant humain d'un testeur additionnel, sérialisé tel quel dans le snapshot de synchronisation pour rattacher ses retours sans recoupement manuel de l'UUID d'appareil. */
  tester_code?: string
}
