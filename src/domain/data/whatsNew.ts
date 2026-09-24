export const WHATS_NEW: string[] = [
  'Le bouton « Nouveautés » a été déplacé sur l\'écran « Mes retours ».',
  'Dans « Mes retours », un message qui n\'arrive pas à partir est maintenant marqué « Échec d\'envoi » directement dans la conversation.',
  'Dans « Mes retours », le bouton « Valider » n\'apparaît plus tant que votre retour n\'a pas fini de partir.',
  'Les sous-tâches ajoutées à la création d\'une tâche répétée apparaissent maintenant sur tous les jours concernés, pas seulement le premier.',
  'Sur la fiche d\'une tâche, l\'icône et la couleur s\'affichent maintenant normalement au lieu d\'un texte brut.',
  'La durée d\'une tâche est maintenant enregistrée dès sa création.',
  'La fiche d\'une tâche permet maintenant de définir ou modifier sa récurrence directement.',
  'Le bouton « Annuler » lors de la création d\'une tâche revient maintenant à l\'écran d\'où vous veniez.',
  'Dans « Mes retours », le bouton « Nouveau retour » est remonté en haut de l\'écran.',
  'Les outils restent maintenant visibles même en mode surcharge.',
  'Une tâche se coche maintenant automatiquement quand toutes ses sous-tâches sont cochées.',
  'Un nouveau repère affiche l\'énergie totale planifiée pour la journée sur l\'écran d\'accueil.',
  'Le bandeau des jours reste maintenant centré : ce sont les jours qui défilent autour.',
  'Nouveau réglage dans Paramètres > Accessibilité pour afficher votre énergie à chaque connexion.',
  'Le planning de la semaine affiche maintenant le nom des tâches et leur couleur, en plus grand.',
  'Les livrets permettent maintenant de créer des catégories, chacune avec son propre sous-total.',
  'Nouvel outil « Routine » : créez une routine avec ses étapes, planifiez-la sur les jours de votre choix avec un horaire propre à chacun, et cochez ses étapes chaque jour depuis un écran dédié.',
]

export const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
export const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function hasUnseenWhatsNew(): boolean {
  return WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION
}

export function markWhatsNewSeen(): void {
  localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
}
