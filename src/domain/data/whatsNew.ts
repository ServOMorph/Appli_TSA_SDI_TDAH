export const WHATS_NEW: string[] = [
  'Création d\'une tâche : les champs Icône, Couleur, Date, Horaire et Coût en énergie se replient maintenant en petites cases, comme sur la fiche d\'une tâche déjà créée. Toucher une case la déplie, choisir une valeur la replie.',
  'Un bouton « Nouveautés » (avec un point rouge tant qu\'il y a du nouveau) est ajouté en haut de l\'écran « Tests à faire » : il permet de retrouver à tout moment les derniers changements de l\'application.',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
