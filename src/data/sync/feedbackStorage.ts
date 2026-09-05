import { getSyncConfig } from '@/data/sync/syncConfig'

export interface FeedbackStorageResult {
  data: { path: string } | null
  error: Error | null
}

/**
 * Depose l'image aplatie d'un retour dans le bucket prive. Comme les RPC de
 * synchronisation, cette fonction ne leve jamais : le retour reste local et
 * pourra etre relance si l'upload echoue.
 */
export async function uploadFeedbackImage(
  deviceId: string,
  reportId: string,
  image: Blob,
): Promise<FeedbackStorageResult> {
  const config = getSyncConfig()
  if (!config) return { data: null, error: new Error('synchronisation non configurée') }

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
    })

    if (!response.ok) {
      return { data: null, error: new Error(`upload du retour a échoué (${response.status})`) }
    }
    return { data: { path }, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}
