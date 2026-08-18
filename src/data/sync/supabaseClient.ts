import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null | undefined

/**
 * Client Supabase, ou null si les variables d'environnement sont absentes.
 * L'app doit rester pleinement utilisable sans backend : tout appelant traite le null
 * comme « synchronisation indisponible », jamais comme une erreur.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
  return cached
}

export function resetSupabaseClient() {
  cached = undefined
}

export function isSyncEnabled(): boolean {
  return getSupabaseClient() !== null
}
