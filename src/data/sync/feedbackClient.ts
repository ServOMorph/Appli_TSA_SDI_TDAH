import { feedbackReportRepo } from '@/app/repositories'
import { getDeviceIdentity } from '@/data/sync/deviceIdentity'
import { callRpc } from '@/data/sync/rpc'
import { getSyncConfig } from '@/data/sync/syncConfig'
import { uploadFeedbackImage } from '@/data/sync/feedbackStorage'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'

const THROTTLE_MS = 60 * 1000

let inFlight: Promise<boolean> | null = null

function mayRetry(report: FeedbackReport, force: boolean): boolean {
  if (force || !report.last_attempt_at) return true
  const lastAttempt = Date.parse(report.last_attempt_at)
  return !Number.isFinite(lastAttempt) || Date.now() - lastAttempt >= THROTTLE_MS
}

async function sendReport(report: FeedbackReport, deviceId: string, deviceSecret: string): Promise<boolean> {
  const attemptedAt = new Date().toISOString()
  try {
    let storagePath = report.image_path
    if (!storagePath) {
      const upload = await uploadFeedbackImage(deviceId, report.id, report.image_blob)
      if (upload.error || !upload.data) {
        await feedbackReportRepo.markFailed(report.id, attemptedAt)
        return false
      }
      storagePath = upload.data.path
      await feedbackReportRepo.markImageUploaded(report.id, storagePath)
    }

    const { data, error } = await callRpc<boolean>('submit_feedback', {
      p_id: report.id,
      p_device_id: deviceId,
      p_device_secret: deviceSecret,
      p_screen_code: report.screen_code,
      p_comment: report.comment,
      p_storage_path: storagePath,
      p_image_bytes: report.image_bytes,
      p_strokes: report.strokes,
      p_app_version: report.app_version,
      p_created_at: report.created_at,
    })
    if (error || !data) {
      await feedbackReportRepo.markFailed(report.id, attemptedAt)
      return false
    }

    await feedbackReportRepo.markSent(report.id, attemptedAt)
    return true
  } catch {
    await feedbackReportRepo.markFailed(report.id, attemptedAt)
    return false
  }
}

async function syncReports(force: boolean): Promise<boolean> {
  try {
    if (!getSyncConfig()) return false

    const reports = await feedbackReportRepo.getToSync()
    const pending = reports.filter((report) => mayRetry(report, force))
    if (pending.length === 0) return false

    const { deviceId, deviceSecret } = getDeviceIdentity()
    const results = await Promise.all(pending.map((report) => sendReport(report, deviceId, deviceSecret)))
    return results.some(Boolean)
  } catch {
    return false
  }
}

/**
 * Envoie les retours locaux en attente sans jamais bloquer l'application.
 * L'image deja deposee est conservee localement pour que la relance reutilise
 * le meme chemin si l'appel de metadonnees a echoue.
 */
export function syncFeedbackNow(options: { force?: boolean } = {}): Promise<boolean> {
  if (inFlight) return inFlight
  const task = syncReports(options.force ?? false)
  inFlight = task
  void task.then(() => {
    if (inFlight === task) inFlight = null
  })
  return task
}

export function startFeedbackSync(): () => void {
  void syncFeedbackNow()
  const onOnline = () => void syncFeedbackNow()
  window.addEventListener('online', onOnline)
  return () => window.removeEventListener('online', onOnline)
}
