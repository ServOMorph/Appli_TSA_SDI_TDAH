export const WHATS_NEW: string[] = [
  'Dans le planning de la semaine, les routines sont maintenant placées à leur horaire. Si une routine apparaît en fin de journée, c’est qu’aucune heure n’est définie pour elle.',
  'Sur l’Accueil, les outils sont maintenant repliés par défaut, ce qui laisse plus de place au planning du jour. Le bouton ▼ à côté de « Outils » permet de les déplier, et ▲ de les replier.',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
