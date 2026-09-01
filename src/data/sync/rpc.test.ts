import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  getSyncConfig: vi.fn(),
}))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { callRpc } from './rpc'

const getSyncConfigMock = vi.mocked(getSyncConfig)
const CONFIG = { url: 'https://exemple.supabase.co', anonKey: 'cle-publiable' }

describe('callRpc', () => {
  beforeEach(() => {
    getSyncConfigMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('renvoie une erreur sans appeler fetch si aucune configuration', async () => {
    getSyncConfigMock.mockReturnValue(null)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { data, error } = await callRpc('sync_device_snapshot', {})

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renvoie data sur une réponse 200', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(true), { status: 200 })),
    )

    const { data, error } = await callRpc<boolean>('sync_device_snapshot', { p_device_id: 'd1' })

    expect(error).toBeNull()
    expect(data).toBe(true)
  })

  it('renvoie une erreur sur une réponse 4xx', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ message: 'invalid' }), { status: 401 })),
    )

    const { data, error } = await callRpc('sync_device_snapshot', {})

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(error?.message).toContain('401')
  })

  it('renvoie une erreur sur une réponse 5xx', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('erreur serveur', { status: 500 })),
    )

    const { data, error } = await callRpc('sync_device_snapshot', {})

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(error?.message).toContain('500')
  })

  it('renvoie une erreur sans lever si fetch rejette (hors-ligne)', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )

    const { data, error } = await callRpc('sync_device_snapshot', {})

    expect(data).toBeNull()
    expect(error).not.toBeNull()
  })
})
