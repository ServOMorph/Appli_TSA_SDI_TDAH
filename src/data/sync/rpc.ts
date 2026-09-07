import { getSyncConfig } from '@/data/sync/syncConfig'

export interface RpcResult<T> {
  data: T | null
  error: Error | null
}

/**
 * Délai par défaut des appels réseau de synchronisation, en millisecondes.
 * Injectable par appel pour les tests ; évalué sur des requêtes synthétiques (D5).
 */
export const DEFAULT_NETWORK_TIMEOUT_MS = 30_000

export interface RpcOptions {
  timeoutMs?: number
}

/**
 * Reproduit le contrat d'un appel RPC PostgREST (`POST {url}/rest/v1/rpc/{name}`) tel qu'émis
 * par le SDK Supabase, en `fetch` natif. Ne lève jamais : toute erreur (HTTP, réseau, parsing,
 * expiration) remonte dans `{ error }`, jamais en exception. La requête est bornée dans le temps
 * et annulée à l'expiration ; le timer est toujours nettoyé.
 */
export async function callRpc<T = unknown>(
  name: string,
  params: Record<string, unknown>,
  options: RpcOptions = {},
): Promise<RpcResult<T>> {
  const config = getSyncConfig()
  if (!config) return { data: null, error: new Error('synchronisation non configurée') }

  const timeoutMs = options.timeoutMs ?? DEFAULT_NETWORK_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    })

    const text = await response.text()
    let body: unknown = null
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = null
      }
    }

    if (!response.ok) {
      return { data: null, error: new Error(`rpc ${name} a échoué (${response.status})`) }
    }
    return { data: body as T, error: null }
  } catch (err) {
    if (controller.signal.aborted) {
      return { data: null, error: new Error(`rpc ${name} a expiré (${timeoutMs} ms)`) }
    }
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  } finally {
    clearTimeout(timer)
  }
}
