import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  isSyncEnabled: vi.fn(),
}))
vi.mock('@/data/sync/syncConsent', () => ({
  isSyncConsentGranted: vi.fn(),
  isSyncConsentCurrent: vi.fn(),
}))
vi.mock('@/data/sync/rpc', () => ({
  callRpc: vi.fn(),
}))
vi.mock('@/data/sync/deviceIdentity', () => ({
  getDeviceIdentity: vi.fn(() => ({ deviceId: 'device-1', deviceSecret: 'secret-1' })),
}))
vi.mock('@/data/sync/buildSnapshot', () => ({
  buildSnapshotPayload: vi.fn(async () => ({ version: '3.3', user: { id: 'user-1' } })),
  SNAPSHOT_SCHEMA_VERSION: '3.3',
}))

import { isSyncEnabled } from '@/data/sync/syncConfig'
import { isSyncConsentCurrent, isSyncConsentGranted } from '@/data/sync/syncConsent'
import { callRpc } from '@/data/sync/rpc'
import { buildSnapshotPayload } from '@/data/sync/buildSnapshot'
import { getLastSyncSuccessAt, syncNow } from './syncClient'

const isSyncEnabledMock = vi.mocked(isSyncEnabled)
const isSyncConsentGrantedMock = vi.mocked(isSyncConsentGranted)
const isSyncConsentCurrentMock = vi.mocked(isSyncConsentCurrent)
const callRpcMock = vi.mocked(callRpc)
const buildSnapshotPayloadMock = vi.mocked(buildSnapshotPayload)

beforeEach(() => {
  localStorage.clear()
  callRpcMock.mockReset()
  isSyncEnabledMock.mockReset()
  isSyncConsentGrantedMock.mockReset()
  isSyncConsentGrantedMock.mockReturnValue(true)
  isSyncConsentCurrentMock.mockReset()
  isSyncConsentCurrentMock.mockReturnValue(true)
  buildSnapshotPayloadMock.mockClear()
})

describe('syncNow', () => {
  it("ne fait rien si aucune synchronisation n'est configurée", async () => {
    isSyncEnabledMock.mockReturnValue(false)
    const result = await syncNow()
    expect(result).toBe(false)
    expect(getLastSyncSuccessAt()).toBeNull()
  })

  it("n'émet aucun RPC si le consentement n'est pas accordé", async () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentGrantedMock.mockReturnValue(false)
    callRpcMock.mockResolvedValue({ data: true, error: null })

    const result = await syncNow()

    expect(result).toBe(false)
    expect(callRpcMock).not.toHaveBeenCalled()
    expect(localStorage.getItem('sync_last_attempt_at')).toBeNull()
    expect(getLastSyncSuccessAt()).toBeNull()
  })

  it('reprend la synchronisation quand le consentement est ensuite retiré', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: true, error: null })

    await syncNow()
    expect(callRpcMock).toHaveBeenCalledTimes(1)

    isSyncConsentGrantedMock.mockReturnValue(false)
    const result = await syncNow({ force: true })

    expect(result).toBe(false)
    expect(callRpcMock).toHaveBeenCalledTimes(1)
  })

  it('envoie le snapshot via rpc et enregistre le succès', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: true, error: null })

    const result = await syncNow()

    expect(result).toBe(true)
    expect(callRpcMock).toHaveBeenCalledWith('sync_device_snapshot', {
      p_device_id: 'device-1',
      p_device_secret: 'secret-1',
      p_payload: { version: '3.3', user: { id: 'user-1' } },
      p_schema_version: '3.3',
      p_app_version: __APP_DEV_VERSION__,
    })
    expect(getLastSyncSuccessAt()).not.toBeNull()
  })

  it('retire les catégories de santé et l’âge si le consentement est ancien', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentCurrentMock.mockReturnValue(false)
    callRpcMock.mockResolvedValue({ data: true, error: null })
    buildSnapshotPayloadMock.mockResolvedValueOnce({
      version: '3.3',
      user: { id: 'user-1', neuro_categories: ['tsa'], age: 30 },
    } as never)

    await syncNow()

    expect(callRpcMock).toHaveBeenCalledWith(
      'sync_device_snapshot',
      expect.objectContaining({ p_payload: { version: '3.3', user: { id: 'user-1' } } }),
    )
  })

  it('conserve les catégories de santé et l’âge si le consentement est à jour', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: true, error: null })
    const user = { id: 'user-1', neuro_categories: ['tsa'], age: 30 }
    buildSnapshotPayloadMock.mockResolvedValueOnce({ version: '3.3', user } as never)

    await syncNow()

    expect(callRpcMock).toHaveBeenCalledWith(
      'sync_device_snapshot',
      expect.objectContaining({ p_payload: { version: '3.3', user } }),
    )
  })

  it('renvoie false sans lever si le secret est refusé (data: false)', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: false, error: null })

    const result = await syncNow()

    expect(result).toBe(false)
    expect(getLastSyncSuccessAt()).toBeNull()
  })

  it('renvoie false sans lever en cas d’erreur réseau', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: null, error: new Error('offline') })

    const result = await syncNow()

    expect(result).toBe(false)
  })

  it('conserve le throttle après une expiration du délai réseau', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({
      data: null,
      error: new Error('rpc sync_device_snapshot a expiré (30000 ms)'),
    })

    await expect(syncNow()).resolves.toBe(false)

    callRpcMock.mockResolvedValue({ data: true, error: null })
    await expect(syncNow()).resolves.toBe(false)
    expect(callRpcMock).toHaveBeenCalledTimes(1)
  })

  it('throttle : ne relance pas avant une heure sans force', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: true, error: null })

    await syncNow()
    expect(callRpcMock).toHaveBeenCalledTimes(1)

    await syncNow()
    expect(callRpcMock).toHaveBeenCalledTimes(1)
  })

  it('throttle : force ignore le délai', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    callRpcMock.mockResolvedValue({ data: true, error: null })

    await syncNow()
    await syncNow({ force: true })
    expect(callRpcMock).toHaveBeenCalledTimes(2)
  })
})
