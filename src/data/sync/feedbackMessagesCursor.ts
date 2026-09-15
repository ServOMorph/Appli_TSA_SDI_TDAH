const CURSOR_KEY = 'feedback_messages_cursor'

/**
 * Horodatage du dernier message d'agent recu par ce chemin de lecture (roadmap_retours_conversationnels.md,
 * Phase 4). Persiste en localStorage, meme pattern que deviceIdentity.ts et syncConsent.ts.
 * Absence de curseur : on part du debut des temps pour recuperer l'historique complet.
 */
export function getFeedbackMessagesCursor(): string {
  return localStorage.getItem(CURSOR_KEY) ?? new Date(0).toISOString()
}

export function setFeedbackMessagesCursor(iso: string): void {
  localStorage.setItem(CURSOR_KEY, iso)
}
