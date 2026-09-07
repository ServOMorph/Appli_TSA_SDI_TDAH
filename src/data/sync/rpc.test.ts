import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  getSyncConfig: vi.fn(),
}))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { callRpc, DEFAULT_NETWORK_TIMEOUT_MS } from './rpc'

const getSyncConfigMock = vi.mocked(getSyncConfig)
const CONFIG = { url: 'https://exemple.supabase.co', anonKey: 'cle-publiable' }

describe('callRpc', () => {
  beforeEach(() => {
    getSyncConfigMock.mockReset()
    vi.unstubAllGlobals()
    vi.useRealTimers()
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

  it('transmet un signal d\'annulation à fetch', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    const fetchMock = vi.fn(
      (_url: string, _init: RequestInit) =>
        Promise.resolve(new Response(JSON.stringify(true), { status: 200 })),
    )
    vi.stubGlobal('fetch', fetchMock)

    await callRpc('sync_device_snapshot', {})

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('expire après le délai injecté et annule la requête en cours', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.useFakeTimers()
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const promise = callRpc('sync_device_snapshot', {}, { timeoutMs: 5_000 })
    await vi.advanceTimersByTimeAsync(5_000)
    const { data, error } = await promise

    expect(data).toBeNull()
    expect(error?.message).toContain('expiré')
    expect(error?.message).toContain('5000')
    expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true)
  })

  it('applique le délai par défaut quand aucun n\'est fourni', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.useFakeTimers()
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const promise = callRpc('sync_device_snapshot', {})
    await vi.advanceTimersByTimeAsync(DEFAULT_NETWORK_TIMEOUT_MS)
    const { error } = await promise

    expect(error?.message).toContain(String(DEFAULT_NETWORK_TIMEOUT_MS))
  })

  it('nettoie le timer quand la réponse arrive avant l\'expiration', async () => {
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(true), { status: 200 })),
    )

    const { data } = await callRpc<boolean>('sync_device_snapshot', {}, { timeoutMs: 5_000 })

    expect(data).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })
})
