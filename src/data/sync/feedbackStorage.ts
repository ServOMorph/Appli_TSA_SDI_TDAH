import { DEFAULT_NETWORK_TIMEOUT_MS } from '@/data/sync/rpc'
import { getSyncConfig } from '@/data/sync/syncConfig'

export interface FeedbackStorageResult {
  data: { path: string } | null
  error: Error | null
}

export interface FeedbackStorageOptions {
  timeoutMs?: number
}

/**
 * Depose l'image aplatie d'un retour dans le bucket prive. Comme les RPC de
 * synchronisation, cette fonction ne leve jamais : le retour reste local et
 * pourra etre relance si l'upload echoue. La requete est bornee dans le temps
 * et annulee a l'expiration ; le timer est toujours nettoye.
 */
export async function uploadFeedbackImage(
  deviceId: string,
  reportId: string,
  image: Blob,
  options: FeedbackStorageOptions = {},
): Promise<FeedbackStorageResult> {
  const config = getSyncConfig()
  if (!config) return { data: null, error: new Error('synchronisation non configurée') }

  const timeoutMs = options.timeoutMs ?? DEFAULT_NETWORK_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const path = `${deviceId}/${reportId}.jpg`
  try {
    const response = await fetch(`${config.url}/storage/v1/object/feedback/${path}`, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'image/jpeg',
      },
      body: image,
      signal: controller.signal,
    })

    if (!response.ok) {
      return { data: null, error: new Error(`upload du retour a échoué (${response.status})`) }
    }
    return { data: { path }, error: null }
  } catch (err) {
    if (controller.signal.aborted) {
      return { data: null, error: new Error(`upload du retour a expiré (${timeoutMs} ms)`) }
    }
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  } finally {
    clearTimeout(timer)
  }
}
