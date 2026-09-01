import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  isSyncEnabled: vi.fn(),
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
import { callRpc } from '@/data/sync/rpc'
import { buildSnapshotPayload } from '@/data/sync/buildSnapshot'
import { getLastSyncSuccessAt, syncNow } from './syncClient'

const isSyncEnabledMock = vi.mocked(isSyncEnabled)
const callRpcMock = vi.mocked(callRpc)
const buildSnapshotPayloadMock = vi.mocked(buildSnapshotPayload)

beforeEach(() => {
  localStorage.clear()
  callRpcMock.mockReset()
  isSyncEnabledMock.mockReset()
  buildSnapshotPayloadMock.mockClear()
})

describe('syncNow', () => {
  it("ne fait rien si aucune synchronisation n'est configurée", async () => {
    isSyncEnabledMock.mockReturnValue(false)
    const result = await syncNow()
    expect(result).toBe(false)
    expect(getLastSyncSuccessAt()).toBeNull()
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
