export interface SyncConfig {
  url: string
  anonKey: string
}

let cached: SyncConfig | null | undefined

/**
 * Configuration de synchronisation, ou null si les variables d'environnement sont absentes.
 * L'app doit rester pleinement utilisable sans backend : tout appelant traite le null
 * comme « synchronisation indisponible », jamais comme une erreur.
 */
export function getSyncConfig(): SyncConfig | null {
  if (cached !== undefined) return cached

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  cached = url && anonKey ? { url, anonKey } : null
  return cached
}

export function resetSyncConfig() {
  cached = undefined
}

export function isSyncEnabled(): boolean {
  return getSyncConfig() !== null
}
