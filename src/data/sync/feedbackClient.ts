import { feedbackMessageRepo, feedbackReportRepo } from '@/app/repositories'
import { getDeviceIdentity } from '@/data/sync/deviceIdentity'
import { getFeedbackMessagesCursor, setFeedbackMessagesCursor } from '@/data/sync/feedbackMessagesCursor'
import { callRpc } from '@/data/sync/rpc'
import { getSyncConfig } from '@/data/sync/syncConfig'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { uploadFeedbackImage } from '@/data/sync/feedbackStorage'
import type { FeedbackMessage } from '@/domain/entities/feedbackMessage'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'

interface FetchedMessageRow {
  id: string
  report_id: string
  body: string
  created_at: string
}

const THROTTLE_MS = 60 * 1000

let inFlight: Promise<boolean> | null = null

function mayRetry(lastAttemptAt: string | null, force: boolean): boolean {
  if (force || !lastAttemptAt) return true
  const lastAttempt = Date.parse(lastAttemptAt)
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

async function sendMessage(message: FeedbackMessage, deviceId: string, deviceSecret: string): Promise<boolean> {
  const attemptedAt = new Date().toISOString()
  try {
    const { data, error } = await callRpc<boolean>('submit_feedback_message', {
      p_id: message.id,
      p_device_id: deviceId,
      p_device_secret: deviceSecret,
      p_report_id: message.report_id,
      p_author: message.author,
      p_body: message.body,
      p_created_at: message.created_at,
    })
    if (error || !data) {
      await feedbackMessageRepo.markFailed(message.id, attemptedAt)
      return false
    }

    await feedbackMessageRepo.markSent(message.id, attemptedAt)
    return true
  } catch {
    await feedbackMessageRepo.markFailed(message.id, attemptedAt)
    return false
  }
}

async function closeReport(report: FeedbackReport, deviceId: string, deviceSecret: string): Promise<boolean> {
  const attemptedAt = new Date().toISOString()
  try {
    const { data, error } = await callRpc<boolean>('close_feedback_report', {
      p_device_id: deviceId,
      p_device_secret: deviceSecret,
      p_report_id: report.id,
      p_resolved_at: report.validated_at ?? attemptedAt,
    })
    if (error || !data) {
      await feedbackReportRepo.markResolutionFailed(report.id, attemptedAt)
      return false
    }

    await feedbackReportRepo.markResolutionSent(report.id, attemptedAt)
    return true
  } catch {
    await feedbackReportRepo.markResolutionFailed(report.id, attemptedAt)
    return false
  }
}

/**
 * Un message ne peut etre pousse que si le retour auquel il appartient existe deja cote
 * serveur (submit_feedback_message echouerait sinon). On resout donc son statut de retour
 * a la volee plutot que de dupliquer l'information sur le message.
 */
async function syncMessages(deviceId: string, deviceSecret: string, force: boolean): Promise<boolean> {
  const candidates = await feedbackMessageRepo.getToSync()
  const pending: FeedbackMessage[] = []
  for (const message of candidates) {
    if (!mayRetry(message.last_attempt_at, force)) continue
    const report = await feedbackReportRepo.getById(message.report_id)
    if (report?.sync_status !== 'sent') continue
    pending.push(message)
  }
  if (pending.length === 0) return false

  const results = await Promise.all(pending.map((message) => sendMessage(message, deviceId, deviceSecret)))
  return results.some(Boolean)
}

/**
 * Chemin de lecture serveur -> client (roadmap_retours_conversationnels.md, Phase 4). Pas de
 * throttle ici : contrairement aux envois, la lecture n'est declenchee qu'a des moments discrets
 * (demarrage, retour en ligne, ouverture de E123/E124), jamais en boucle. Le curseur n'avance que
 * jusqu'au dernier message effectivement recu, jamais au-dela : une erreur reseau ou un tableau
 * vide laisse le curseur en l'etat pour retenter au prochain cycle.
 */
async function fetchMessages(deviceId: string, deviceSecret: string): Promise<boolean> {
  try {
    const since = getFeedbackMessagesCursor()
    const { data, error } = await callRpc<FetchedMessageRow[]>('fetch_feedback_messages', {
      p_device_id: deviceId,
      p_device_secret: deviceSecret,
      p_since: since,
    })
    if (error || !data || data.length === 0) return false

    const messages: FeedbackMessage[] = data.map((row) => ({
      id: row.id,
      report_id: row.report_id,
      author: 'agent' as const,
      body: row.body,
      created_at: row.created_at,
      sync_status: 'sent',
      last_attempt_at: null,
      read_at: null,
    }))
    await feedbackMessageRepo.saveReceived(messages)

    const latest = messages.reduce((max, message) => (message.created_at > max ? message.created_at : max), since)
    setFeedbackMessagesCursor(latest)
    return true
  } catch {
    return false
  }
}

async function syncClosures(deviceId: string, deviceSecret: string, force: boolean): Promise<boolean> {
  const candidates = await feedbackReportRepo.getToCloseSync()
  const pending = candidates.filter((report) => mayRetry(report.resolution_last_attempt_at, force))
  if (pending.length === 0) return false

  const results = await Promise.all(pending.map((report) => closeReport(report, deviceId, deviceSecret)))
  return results.some(Boolean)
}

async function syncReports(force: boolean): Promise<boolean> {
  try {
    if (!getSyncConfig()) return false
    // Le serveur refuse submit_feedback tant que l'appareil n'a pas de snapshot, ce qui
    // suppose le partage actif. Sans consentement, on laisse les retours en attente plutot
    // que de les marquer en echec : ils partiront des l'activation du partage.
    if (!isSyncConsentGranted()) return false

    const reports = await feedbackReportRepo.getToSync()
    const pending = reports.filter((report) => mayRetry(report.last_attempt_at, force))

    const { deviceId, deviceSecret } = getDeviceIdentity()
    const reportsSent = pending.length > 0
      ? (await Promise.all(pending.map((report) => sendReport(report, deviceId, deviceSecret)))).some(Boolean)
      : false
    const messagesSent = await syncMessages(deviceId, deviceSecret, force)
    const closuresSent = await syncClosures(deviceId, deviceSecret, force)
    const messagesReceived = await fetchMessages(deviceId, deviceSecret)

    return reportsSent || messagesSent || closuresSent || messagesReceived
  } catch {
    return false
  }
}

/**
 * Envoie les retours locaux en attente sans jamais bloquer l'application.
 * L'image deja deposee est conservee localement pour que la relance reutilise
 * le meme chemin si l'appel de metadonnees a echoue. Le verrou de tentative
 * est toujours libere une fois la tentative reglee (succes, echec ou expiration
 * du delai reseau), y compris si la promesse est rejetee.
 *
 * Un appel `force` pendant qu'un cycle non force est deja en cours n'est jamais fusionne
 * dans ce cycle (qui a fige sa liste de retours a pousser avant l'appel force, donc avant un
 * `markPending` fait juste avant par un bouton Relancer) : il enchaine un cycle supplementaire
 * une fois le premier termine, pour garantir qu'un retour tout juste remis en attente est bien
 * repris. Bug observe (roadmap_retours_conversationnels.md, Phase 6) : un clic sur Relancer
 * pendant la synchronisation automatique de montage d'E123 rejoignait silencieusement ce cycle
 * deja en cours sans jamais retenter l'envoi, laissant l'ecran inchange jusqu'a un prochain cycle
 * ambiant fortuit.
 */
export function syncFeedbackNow(options: { force?: boolean } = {}): Promise<boolean> {
  if (inFlight) {
    if (options.force) return inFlight.then(() => syncFeedbackNow(options))
    return inFlight
  }
  const task = syncReports(options.force ?? false)
  inFlight = task
  void task.finally(() => {
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
