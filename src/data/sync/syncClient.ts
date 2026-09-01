import { isSyncEnabled } from '@/data/sync/syncConfig'
import { callRpc } from '@/data/sync/rpc'
import { getDeviceIdentity } from '@/data/sync/deviceIdentity'
import { buildSnapshotPayload, SNAPSHOT_SCHEMA_VERSION } from '@/data/sync/buildSnapshot'

const LAST_ATTEMPT_KEY = 'sync_last_attempt_at'
const LAST_SUCCESS_KEY = 'sync_last_success_at'
const THROTTLE_MS = 60 * 60 * 1000

function now() {
  return Date.now()
}

function msSinceLastAttempt(): number {
  const raw = localStorage.getItem(LAST_ATTEMPT_KEY)
  if (!raw) return Infinity
  const last = Number(raw)
  return Number.isFinite(last) ? now() - last : Infinity
}

export function getLastSyncSuccessAt(): string | null {
  return localStorage.getItem(LAST_SUCCESS_KEY)
}

/**
 * Synchronise les donnees de l'appareil vers Supabase si un backend est configure.
 * Echoue toujours silencieusement (pas de client, hors-ligne, secret refuse) : l'usage
 * de l'app n'est jamais bloque par cette fonction. Throttle applique meme en cas d'echec,
 * pour eviter de marteler le reseau quand l'appareil est hors-ligne.
 */
export async function syncNow(options: { force?: boolean } = {}): Promise<boolean> {
  if (!options.force && msSinceLastAttempt() < THROTTLE_MS) return false

  if (!isSyncEnabled()) return false

  localStorage.setItem(LAST_ATTEMPT_KEY, String(now()))

  try {
    const payload = await buildSnapshotPayload()
    if (!payload) return false

    const { deviceId, deviceSecret } = getDeviceIdentity()
    const { data, error } = await callRpc<boolean>('sync_device_snapshot', {
      p_device_id: deviceId,
      p_device_secret: deviceSecret,
      p_payload: payload,
      p_schema_version: SNAPSHOT_SCHEMA_VERSION,
      p_app_version: __APP_DEV_VERSION__,
    })
    if (error || !data) return false

    localStorage.setItem(LAST_SUCCESS_KEY, new Date().toISOString())
    return true
  } catch {
    return false
  }
}
