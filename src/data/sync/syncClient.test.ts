import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()

vi.mock('@/data/sync/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}))
vi.mock('@/data/sync/deviceIdentity', () => ({
  getDeviceIdentity: vi.fn(() => ({ deviceId: 'device-1', deviceSecret: 'secret-1' })),
}))
vi.mock('@/data/sync/buildSnapshot', () => ({
  buildSnapshotPayload: vi.fn(async () => ({ version: '3.3', user: { id: 'user-1' } })),
  SNAPSHOT_SCHEMA_VERSION: '3.3',
}))

import { getSupabaseClient } from '@/data/sync/supabaseClient'
import { buildSnapshotPayload } from '@/data/sync/buildSnapshot'
import { getLastSyncSuccessAt, syncNow } from './syncClient'

const getSupabaseClientMock = vi.mocked(getSupabaseClient)
const buildSnapshotPayloadMock = vi.mocked(buildSnapshotPayload)

beforeEach(() => {
  localStorage.clear()
  rpc.mockReset()
  getSupabaseClientMock.mockReset()
  buildSnapshotPayloadMock.mockClear()
})

describe('syncNow', () => {
  it("ne fait rien si aucun client Supabase n'est configuré", async () => {
    getSupabaseClientMock.mockReturnValue(null)
    const result = await syncNow()
    expect(result).toBe(false)
    expect(getLastSyncSuccessAt()).toBeNull()
  })

  it('envoie le snapshot via rpc et enregistre le succès', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    // @ts-expect-error client minimal pour le test
    getSupabaseClientMock.mockReturnValue({ rpc })

    const result = await syncNow()

    expect(result).toBe(true)
    expect(rpc).toHaveBeenCalledWith('sync_device_snapshot', {
      p_device_id: 'device-1',
      p_device_secret: 'secret-1',
      p_payload: { version: '3.3', user: { id: 'user-1' } },
      p_schema_version: '3.3',
      p_app_version: __APP_DEV_VERSION__,
    })
    expect(getLastSyncSuccessAt()).not.toBeNull()
  })

  it('renvoie false sans lever si le secret est refusé (data: false)', async () => {
    rpc.mockResolvedValue({ data: false, error: null })
    // @ts-expect-error client minimal pour le test
    getSupabaseClientMock.mockReturnValue({ rpc })

    const result = await syncNow()

    expect(result).toBe(false)
    expect(getLastSyncSuccessAt()).toBeNull()
  })

  it('renvoie false sans lever en cas d’erreur réseau', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('offline') })
    // @ts-expect-error client minimal pour le test
    getSupabaseClientMock.mockReturnValue({ rpc })

    const result = await syncNow()

    expect(result).toBe(false)
  })

  it('throttle : ne relance pas avant une heure sans force', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    // @ts-expect-error client minimal pour le test
    getSupabaseClientMock.mockReturnValue({ rpc })

    await syncNow()
    expect(rpc).toHaveBeenCalledTimes(1)

    await syncNow()
    expect(rpc).toHaveBeenCalledTimes(1)
  })

  it('throttle : force ignore le délai', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    // @ts-expect-error client minimal pour le test
    getSupabaseClientMock.mockReturnValue({ rpc })

    await syncNow()
    await syncNow({ force: true })
    expect(rpc).toHaveBeenCalledTimes(2)
  })
})
