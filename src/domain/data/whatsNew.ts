export const WHATS_NEW: string[] = [
  'Dans le planning de la semaine, les routines sont maintenant placées à leur horaire. Si une routine apparaît en fin de journée, c’est qu’aucune heure n’est définie pour elle.',
  'Sur l’Accueil, les outils sont maintenant repliés par défaut, ce qui laisse plus de place au planning du jour. Le bouton ▼ à côté de « Outils » permet de les déplier, et ▲ de les replier.',
  'Les nouveautés se trouvent maintenant dans Paramètres.',
  'Sur l’Accueil, le planning se parcourt avec des flèches jour précédent et jour suivant, un bouton « Aujourd’hui » et un calendrier.',
  'En mode surcharge, la carte orange a disparu : il reste le bouton du centre de récupération, et les outils restent accessibles.',
  'Dupliquer une tâche demande maintenant la date et l’heure de début, et garde le titre et les sous-tâches tels quels.',
  'L’heure de début et la durée d’une tâche se choisissent avec des chiffres à toucher, comme pour les routines.',
  'Une routine a maintenant une durée totale, et son heure de fin apparaît dans le planning. L’heure d’une routine peut aussi être changée pour un seul jour.',
  'Le bouton « + » des outils permet de créer un outil ou un dossier. Le menu « ⋯ » des cartes permet de déplacer ou de supprimer un outil ou un dossier.',
  'Dans un livret, les mouvements sont repliés et s’affichent en ouvrant une catégorie. L’argent qui n’est dans aucune catégorie apparaît dans une ligne à part, et un dépôt permet de choisir d’où vient l’argent.',
  'Une tâche peut avoir la case « Dépense ». En la cochant dans le planning, une fenêtre demande le montant et la catégorie de « Mon compte ».',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
