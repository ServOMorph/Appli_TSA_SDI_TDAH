export const WHATS_NEW: string[] = [
  "À l'ouverture, l'application demande vos catégories (TSA, TDAH, HPI...) et votre âge ; un bouton « ? » explique chaque catégorie. Vous pouvez les modifier dans Paramètres > Profil.",
  "Accueil : faites glisser les jours vers la gauche ou la droite ; le jour choisi reste au centre, dans un cadre.",
  "Accueil : les outils sont maintenant au-dessus du planning.",
  "Accueil : les cartes d'outils tiennent dans l'écran, même avec un nom long.",
  "Planning de la semaine : les sept jours défilent ensemble, les jours restent affichés en haut.",
  "Tâche avec une dépense : quand vous cochez la dernière sous-tâche depuis l'Accueil, la fenêtre de dépense s'ouvre.",
  "Accessibilité : la rubrique « Couleur des outils » est retirée ; les routines gardent leur couleur.",
  "Routine : une étape peut avoir des sous-tâches, directement dans la fenêtre « Modifier l'étape ».",
  "Tâche récurrente : en ajoutant une sous-étape, vous choisissez cette occurrence ou toutes les occurrences.",
  "Nouvelle liste : plus besoin de catégorie pour créer une liste et y ajouter des éléments.",
  "Outils : un dossier peut contenir d'autres dossiers, et le menu « ⋯ » permet de déplacer un dossier.",
  "Routine : la durée peut être modifiée pour un seul jour, depuis l'écran de la routine de ce jour.",
  "Retours : vous pouvez envoyer un retour sans image.",
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
