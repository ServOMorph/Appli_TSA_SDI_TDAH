export const WHATS_NEW: string[] = [
  'Le bouton « Nouveautés » a été déplacé sur l\'écran « Mes retours ».',
  'Dans « Mes retours », un message qui n\'arrive pas à partir est maintenant marqué « Échec d\'envoi » directement dans la conversation.',
  'Dans « Mes retours », le bouton « Valider » n\'apparaît plus tant que votre retour n\'a pas fini de partir.',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
