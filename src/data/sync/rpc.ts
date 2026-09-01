import { getSyncConfig } from '@/data/sync/syncConfig'

export interface RpcResult<T> {
  data: T | null
  error: Error | null
}

/**
 * Reproduit le contrat d'un appel RPC PostgREST (`POST {url}/rest/v1/rpc/{name}`) tel qu'émis
 * par le SDK Supabase, en `fetch` natif. Ne lève jamais : toute erreur (HTTP, réseau, parsing)
 * remonte dans `{ error }`, jamais en exception.
 */
export async function callRpc<T = unknown>(
  name: string,
  params: Record<string, unknown>,
): Promise<RpcResult<T>> {
  const config = getSyncConfig()
  if (!config) return { data: null, error: new Error('synchronisation non configurée') }

  try {
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
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
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}
