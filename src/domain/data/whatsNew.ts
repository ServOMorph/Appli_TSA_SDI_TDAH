export const WHATS_NEW: string[] = [
  "À l'ouverture, l'application demande vos catégories (TSA, TDAH, HPI...) et votre âge ; un bouton « ? » explique chaque catégorie. Vous pouvez les modifier dans Paramètres > Profil.",
  "Accueil : faites glisser les jours vers la gauche ou la droite ; le jour choisi reste au centre, dans un cadre.",
  "Accueil : les outils sont maintenant au-dessus du planning.",
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
