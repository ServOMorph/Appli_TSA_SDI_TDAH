import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'

const repository = vi.hoisted(() => ({
  getToSync: vi.fn(),
  markImageUploaded: vi.fn(),
  markSent: vi.fn(),
  markFailed: vi.fn(),
}))

vi.mock('@/app/repositories', () => ({ feedbackReportRepo: repository }))
vi.mock('@/data/sync/deviceIdentity', () => ({
  getDeviceIdentity: vi.fn(() => ({ deviceId: 'device-1', deviceSecret: 'secret-1' })),
}))
vi.mock('@/data/sync/syncConfig', () => ({ getSyncConfig: vi.fn() }))
vi.mock('@/data/sync/feedbackStorage', () => ({ uploadFeedbackImage: vi.fn() }))
vi.mock('@/data/sync/rpc', () => ({ callRpc: vi.fn() }))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { uploadFeedbackImage } from '@/data/sync/feedbackStorage'
import { callRpc } from '@/data/sync/rpc'
import { syncFeedbackNow } from './feedbackClient'

const getSyncConfigMock = vi.mocked(getSyncConfig)
const uploadMock = vi.mocked(uploadFeedbackImage)
const callRpcMock = vi.mocked(callRpc)

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
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  getSyncConfigMock.mockReturnValue({ url: 'https://example.supabase.co', anonKey: 'key' })
  repository.getToSync.mockResolvedValue([])
  repository.markImageUploaded.mockResolvedValue(undefined)
  repository.markSent.mockResolvedValue(undefined)
  repository.markFailed.mockResolvedValue(undefined)
  uploadMock.mockResolvedValue({ data: { path: 'device-1/report-1.jpg' }, error: null })
  callRpcMock.mockResolvedValue({ data: true, error: null })
})

describe('syncFeedbackNow', () => {
  it('envoie image puis métadonnées et marque le retour envoyé', async () => {
    const item = report()
    repository.getToSync.mockResolvedValue([item])

    await expect(syncFeedbackNow()).resolves.toBe(true)

    expect(uploadMock).toHaveBeenCalledWith('device-1', item.id, item.image_blob)
    expect(repository.markImageUploaded).toHaveBeenCalledWith(item.id, 'device-1/report-1.jpg')
    expect(callRpcMock).toHaveBeenCalledWith('submit_feedback', expect.objectContaining({
      p_id: item.id,
      p_device_id: 'device-1',
      p_storage_path: 'device-1/report-1.jpg',
    }))
    expect(repository.markSent).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('garde le chemin local et échoue silencieusement si les métadonnées sont refusées', async () => {
    const item = report()
    repository.getToSync.mockResolvedValue([item])
    callRpcMock.mockResolvedValue({ data: null, error: new Error('offline') })

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(repository.markImageUploaded).toHaveBeenCalledWith(item.id, 'device-1/report-1.jpg')
    expect(repository.markFailed).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('ne lance aucun envoi lorsque la synchronisation est désactivée', async () => {
    getSyncConfigMock.mockReturnValue(null)
    repository.getToSync.mockResolvedValue([report()])

    await expect(syncFeedbackNow()).resolves.toBe(false)

    expect(repository.getToSync).not.toHaveBeenCalled()
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('relance un retour en échec sans envoyer deux fois une image déjà déposée', async () => {
    const item = report({ sync_status: 'failed', image_path: 'device-1/report-1.jpg' })
    repository.getToSync.mockResolvedValue([item])

    await expect(syncFeedbackNow({ force: true })).resolves.toBe(true)

    expect(uploadMock).not.toHaveBeenCalled()
    expect(callRpcMock).toHaveBeenCalledTimes(1)
    expect(repository.markSent).toHaveBeenCalledWith(item.id, expect.any(String))
  })

  it('partage une tentative simultanée pour éviter le double envoi', async () => {
    const item = report()
    repository.getToSync.mockResolvedValue([item])
    let resolveUpload!: (value: { data: { path: string }; error: null }) => void
    uploadMock.mockImplementationOnce(() => new Promise((resolve) => { resolveUpload = resolve }))

    const first = syncFeedbackNow()
    const second = syncFeedbackNow()
    await vi.waitFor(() => expect(uploadMock).toHaveBeenCalledTimes(1))
    resolveUpload({ data: { path: 'device-1/report-1.jpg' }, error: null })

    await Promise.all([first, second])
    expect(uploadMock).toHaveBeenCalledTimes(1)
    expect(callRpcMock).toHaveBeenCalledTimes(1)
  })
})
