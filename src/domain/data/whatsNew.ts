export const WHATS_NEW: string[] = [
  'Le numéro de version de l’application est maintenant affiché en bas de l’écran Paramètres.',
  'Dans le fil d’un retour, un message qui n’a pas pu partir affiche un bouton « Relancer », ou une explication quand le serveur le refuse.',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
