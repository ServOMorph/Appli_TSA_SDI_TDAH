export const WHATS_NEW: string[] = [
  'Dans Paramètres, un bouton « Synchroniser maintenant » permet d\'envoyer vos données de test tout de suite.',
  'Le petit repère affiché en haut à droite de chaque écran ne bloque plus les boutons qui se trouvent dessous.',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
