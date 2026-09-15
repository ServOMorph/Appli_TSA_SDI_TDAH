import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FeedbackMessage } from '@/domain/entities/feedbackMessage'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'

const reportRepo = vi.hoisted(() => ({
  getToSync: vi.fn(),
  getById: vi.fn(),
  getToCloseSync: vi.fn(),
  markImageUploaded: vi.fn(),
  markSent: vi.fn(),
  markFailed: vi.fn(),
  markResolutionSent: vi.fn(),
  markResolutionFailed: vi.fn(),
}))
const messageRepo = vi.hoisted(() => ({
  getToSync: vi.fn(),
  markSent: vi.fn(),
  markFailed: vi.fn(),
  saveReceived: vi.fn(),
}))

vi.mock('@/app/repositories', () => ({ feedbackReportRepo: reportRepo, feedbackMessageRepo: messageRepo }))
vi.mock('@/data/sync/deviceIdentity', () => ({
  getDeviceIdentity: vi.fn(() => ({ deviceId: 'device-1', deviceSecret: 'secret-1' })),
}))
vi.mock('@/data/sync/feedbackMessagesCursor', () => ({
  getFeedbackMessagesCursor: vi.fn(),
  setFeedbackMessagesCursor: vi.fn(),
}))
vi.mock('@/data/sync/syncConfig', () => ({ getSyncConfig: vi.fn() }))
vi.mock('@/data/sync/syncConsent', () => ({ isSyncConsentGranted: vi.fn() }))
vi.mock('@/data/sync/feedbackStorage', () => ({ uploadFeedbackImage: vi.fn() }))
vi.mock('@/data/sync/rpc', () => ({ callRpc: vi.fn() }))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { uploadFeedbackImage } from '@/data/sync/feedbackStorage'
import { getFeedbackMessagesCursor, setFeedbackMessagesCursor } from '@/data/sync/feedbackMessagesCursor'
import { callRpc } from '@/data/sync/rpc'
import { syncFeedbackNow } from './feedbackClient'

const getSyncConfigMock = vi.mocked(getSyncConfig)
const consentMock = vi.mocked(isSyncConsentGranted)
const uploadMock = vi.mocked(uploadFeedbackImage)
const callRpcMock = vi.mocked(callRpc)
const getFeedbackMessagesCursorMock = vi.mocked(getFeedbackMessagesCursor)
const setFeedbackMessagesCursorMock = vi.mocked(setFeedbackMessagesCursor)

function report(overrides: Partial<FeedbackReport> = {}): FeedbackReport {
  return {
    id: 'report-1',
    screen_code: 'E10',
    comment: 'Le bouton est trop petit',
    image_blob: new Blob(['image'], { type: 'image/jpeg' }),
    image_path: null,
    image_bytes: 5,
    strokes: [],
    app_version: 'test',
    created_at: '2026-09-04T10:00:00.000Z',
    sync_status: 'pending',
    last_attempt_at: null,
    resolution_status: 'open',
    validated_at: null,
    resolution_sync_status: 'sent',
    resolution_last_attempt_at: null,
    ...overrides,
  }
}

function message(overrides: Partial<FeedbackMessage> = {}): FeedbackMessage {
  return {
    id: 'message-1',
    report_id: 'report-1',
    author: 'user',
    body: 'Toujours pas de retour visuel',
    created_at: '2026-09-14T10:00:00.000Z',
    sync_status: 'pending',
    last_attempt_at: null,
    read_at: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  getSyncConfigMock.mockReturnValue({ url: 'https://example.supabase.co', anonKey: 'key' })
  consentMock.mockReturnValue(true)
  reportRepo.getToSync.mockResolvedValue([])
  reportRepo.getById.mockResolvedValue(undefined)
  reportRepo.getToCloseSync.mockResolvedValue([])
  reportRepo.markImageUploaded.mockResolvedValue(undefined)
  reportRepo.markSent.mockResolvedValue(undefined)
  reportRepo.markFailed.mockResolvedValue(undefined)
  reportRepo.markResolutionSent.mockResolvedValue(undefined)
  reportRepo.markResolutionFailed.mockResolvedValue(undefined)
  messageRepo.getToSync.mockResolvedValue([])
  messageRepo.markSent.mockResolvedValue(undefined)
  messageRepo.markFailed.mockResolvedValue(undefined)
  messageRepo.saveReceived.mockResolvedValue(undefined)
  uploadMock.mockResolvedValue({ data: { path: 'device-1/report-1.jpg' }, error: null })
  getFeedbackMessagesCursorMock.mockReturnValue('2026-09-01T00:00:00.000Z')
  callRpcMock.mockImplementation(async (name: string) =>
    name === 'fetch_feedback_messages' ? { data: [], error: null } : { data: true, error: null },
  )
})

describe('syncFeedbackNow', () => {
  it('envoie image puis métadonnées et marque le retour envoyé', async () => {
    const item = report()
    reportRepo.getToSync.mockResolvedValue([item])

    await expect(syncFeedbackNow()).resolves.toBe(true)

    expect(uploadMock).toHaveBeenCalledWith('device-1', item.id, item.image_blob)
    expect(reportRepo.markImageUploaded).toHaveBeenCalledWith(item.id, 'device-1/report-1.jpg')
    expect(callRpcMock).toHaveBeenCalledWith('submit_feedback', expect.objectContaining({
      p_id: item.id,
      p_device_id: 'device-1',
      p_storage_path: 'device-1/report-1.jpg',
    }))
    expect(reportRepo.markSent).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('garde le chemin local et échoue silencieusement si les métadonnées sont refusées', async () => {
    const item = report()
    reportRepo.getToSync.mockResolvedValue([item])
    callRpcMock.mockResolvedValue({ data: null, error: new Error('offline') })

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(reportRepo.markImageUploaded).toHaveBeenCalledWith(item.id, 'device-1/report-1.jpg')
    expect(reportRepo.markFailed).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('ne lance aucun envoi lorsque la synchronisation est désactivée', async () => {
    getSyncConfigMock.mockReturnValue(null)
    reportRepo.getToSync.mockResolvedValue([report()])

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(reportRepo.getToSync).not.toHaveBeenCalled()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('laisse le retour en attente sans le marquer en échec quand le partage est refusé', async () => {
    consentMock.mockReturnValue(false)
    reportRepo.getToSync.mockResolvedValue([report()])

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(reportRepo.getToSync).not.toHaveBeenCalled()
    expect(uploadMock).not.toHaveBeenCalled()
    expect(reportRepo.markFailed).not.toHaveBeenCalled()
  })

  it('relance un retour en échec sans envoyer deux fois une image déjà déposée', async () => {
    const item = report({ sync_status: 'failed', image_path: 'device-1/report-1.jpg' })
    reportRepo.getToSync.mockResolvedValue([item])

    await expect(syncFeedbackNow({ force: true })).resolves.toBe(true)

    expect(uploadMock).not.toHaveBeenCalled()
    expect(callRpcMock.mock.calls.filter(([name]) => name === 'submit_feedback')).toHaveLength(1)
    expect(reportRepo.markSent).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('partage une tentative simultanée pour éviter le double envoi', async () => {
    const item = report()
    reportRepo.getToSync.mockResolvedValue([item])
    let resolveUpload!: (value: { data: { path: string }; error: null }) => void
    uploadMock.mockImplementationOnce(() => new Promise((resolve) => { resolveUpload = resolve }))

    const first = syncFeedbackNow()
    const second = syncFeedbackNow()
    await vi.waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(1))
    resolveUpload({ data: { path: 'device-1/report-1.jpg' }, error: null })

    await Promise.all([first, second])
    expect(uploadMock).toHaveBeenCalledTimes(1)
    expect(callRpcMock.mock.calls.filter(([name]) => name === 'submit_feedback')).toHaveLength(1)
  })

  it('un appel force pendant un cycle non force en cours enchaîne un second cycle plutôt que de s’y fondre', async () => {
    // Bug reel (roadmap_retours_conversationnels.md, Phase 6) : un clic sur Relancer pendant la
    // synchronisation de montage d'E123 rejoignait silencieusement ce cycle deja en cours sans
    // jamais retenter l'envoi (la relance ne se produisait qu'au hasard d'un cycle ulterieur).
    const item = report()
    reportRepo.getToSync.mockResolvedValue([item])
    let resolveUpload!: (value: { data: { path: string }; error: null }) => void
    uploadMock.mockImplementationOnce(() => new Promise((resolve) => { resolveUpload = resolve }))

    const first = syncFeedbackNow()
    await vi.waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(1))
    const second = syncFeedbackNow({ force: true })
    resolveUpload({ data: { path: 'device-1/report-1.jpg' }, error: null })

    await expect(Promise.all([first, second])).resolves.toEqual([true, true])
    expect(reportRepo.getToSync).toHaveBeenCalledTimes(2)
    expect(uploadMock).toHaveBeenCalledTimes(2)
    expect(reportRepo.markSent).toHaveBeenCalledTimes(2)
  })

  it('libère le verrou de tentative après une expiration du délai réseau', async () => {
    const item = report()
    reportRepo.getToSync.mockResolvedValue([item])
    uploadMock.mockResolvedValueOnce({ data: null, error: new Error('upload du retour a expiré (30000 ms)') })

    await expect(syncFeedbackNow()).resolves.toBe(false)
    expect(reportRepo.markFailed).toHaveBeenCalledWith(item.id, expect.any(String))

    reportRepo.getToSync.mockClear()
    uploadMock.mockResolvedValue({ data: { path: 'device-1/report-1.jpg' }, error: null })

    await expect(syncFeedbackNow({ force: true })).resolves.toBe(true)
    expect(reportRepo.getToSync).toHaveBeenCalledTimes(1)
  })

  it('libère le verrou même si la tentative rejette', async () => {
    reportRepo.getToSync.mockRejectedValueOnce(new Error('indexeddb indisponible'))

    await expect(syncFeedbackNow()).resolves.toBe(false)

    reportRepo.getToSync.mockClear()
    reportRepo.getToSync.mockResolvedValue([])
    await syncFeedbackNow({ force: true })
    expect(reportRepo.getToSync).toHaveBeenCalledTimes(1)
  })

  it('pousse un message en attente pour un retour déjà envoyé', async () => {
    const item = message()
    messageRepo.getToSync.mockResolvedValue([item])
    reportRepo.getById.mockResolvedValue(report({ sync_status: 'sent' }))

    await expect(syncFeedbackNow()).resolves.toBe(true)

    expect(callRpcMock).toHaveBeenCalledWith('submit_feedback_message', expect.objectContaining({
      p_id: item.id,
      p_report_id: item.report_id,
      p_body: item.body,
    }))
    expect(messageRepo.markSent).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('n’envoie pas un message tant que son retour n’est pas confirmé côté serveur', async () => {
    const item = message()
    messageRepo.getToSync.mockResolvedValue([item])
    reportRepo.getById.mockResolvedValue(report({ sync_status: 'pending' }))

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(callRpcMock).not.toHaveBeenCalledWith('submit_feedback_message', expect.anything())
    expect(messageRepo.markFailed).not.toHaveBeenCalled()
  })

  it('marque un message en échec si le serveur le refuse', async () => {
    const item = message()
    messageRepo.getToSync.mockResolvedValue([item])
    reportRepo.getById.mockResolvedValue(report({ sync_status: 'sent' }))
    callRpcMock.mockResolvedValue({ data: false, error: null })

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(messageRepo.markFailed).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('pousse la clôture d’un retour validé et déjà envoyé', async () => {
    const closed = report({ resolution_status: 'validated', resolution_sync_status: 'pending', validated_at: '2026-09-14T12:00:00.000Z' })
    reportRepo.getToCloseSync.mockResolvedValue([closed])

    await expect(syncFeedbackNow()).resolves.toBe(true)

    expect(callRpcMock).toHaveBeenCalledWith('close_feedback_report', expect.objectContaining({
      p_report_id: closed.id,
      p_resolved_at: closed.validated_at,
    }))
    expect(reportRepo.markResolutionSent).toHaveBeenCalledWith(closed.id, expect.any(String))
  })

  it('marque une clôture en échec si le serveur la refuse', async () => {
    const closed = report({ resolution_status: 'validated', resolution_sync_status: 'pending' })
    reportRepo.getToCloseSync.mockResolvedValue([closed])
    callRpcMock.mockResolvedValue({ data: null, error: new Error('offline') })

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(reportRepo.markResolutionFailed).toHaveBeenCalledWith(closed.id, expect.any(String))
  })

  it('reçoit un message d’agent et avance le curseur de lecture', async () => {
    callRpcMock.mockImplementation(async (name: string) =>
      name === 'fetch_feedback_messages'
        ? { data: [{ id: 'agent-1', report_id: 'report-1', body: 'Le correctif est en ligne', created_at: '2026-09-14T13:00:00.000Z' }], error: null }
        : { data: true, error: null },
    )

    await expect(syncFeedbackNow()).resolves.toBe(true)

    expect(callRpcMock).toHaveBeenCalledWith('fetch_feedback_messages', expect.objectContaining({
      p_device_id: 'device-1',
      p_device_secret: 'secret-1',
      p_since: '2026-09-01T00:00:00.000Z',
    }))
    expect(messageRepo.saveReceived).toHaveBeenCalledWith([expect.objectContaining({
      id: 'agent-1',
      report_id: 'report-1',
      author: 'agent',
      body: 'Le correctif est en ligne',
      sync_status: 'sent',
      read_at: null,
    })])
    expect(setFeedbackMessagesCursorMock).toHaveBeenCalledWith('2026-09-14T13:00:00.000Z')
  })

  it('n’enregistre rien et n’avance pas le curseur quand le serveur ne renvoie aucun message (isolation par appareil)', async () => {
    callRpcMock.mockImplementation(async (name: string) =>
      name === 'fetch_feedback_messages' ? { data: [], error: null } : { data: true, error: null },
    )

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(messageRepo.saveReceived).not.toHaveBeenCalled()
    expect(setFeedbackMessagesCursorMock).not.toHaveBeenCalled()
  })

  it('n’avance pas le curseur en cas d’échec réseau de la lecture', async () => {
    callRpcMock.mockImplementation(async (name: string) =>
      name === 'fetch_feedback_messages' ? { data: null, error: new Error('offline') } : { data: true, error: null },
    )

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(messageRepo.saveReceived).not.toHaveBeenCalled()
    expect(setFeedbackMessagesCursorMock).not.toHaveBeenCalled()
  })
})
