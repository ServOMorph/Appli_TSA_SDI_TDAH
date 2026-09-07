import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  getSyncConfig: vi.fn(),
}))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { uploadFeedbackImage } from './feedbackStorage'
import { DEFAULT_NETWORK_TIMEOUT_MS } from './rpc'

const getSyncConfigMock = vi.mocked(getSyncConfig)
const CONFIG = { url: 'https://exemple.supabase.co', anonKey: 'cle-publiable' }
const DEVICE_ID = 'device-1'
const REPORT_ID = 'report-1'
const IMAGE = new Blob(['image'], { type: 'image/jpeg' })

function hangingFetch() {
  return vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      }),
  )
}

describe('uploadFeedbackImage — bornage réseau', () => {
  beforeEach(() => {
    getSyncConfigMock.mockReset()
    getSyncConfigMock.mockReturnValue(CONFIG)
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('transmet un signal d\'annulation à fetch', async () => {
    const fetchMock = vi.fn(
      (_url: string, _init: RequestInit) => Promise.resolve(new Response('', { status: 200 })),
    )
    vi.stubGlobal('fetch', fetchMock)

    await uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE)

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it('expire après le délai injecté et annule l\'upload', async () => {
    vi.useFakeTimers()
    const fetchMock = hangingFetch()
    vi.stubGlobal('fetch', fetchMock)

    const promise = uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE, { timeoutMs: 5_000 })
    await vi.advanceTimersByTimeAsync(5_000)
    const { data, error } = await promise

    expect(data).toBeNull()
    expect(error?.message).toContain('expiré')
    expect(error?.message).toContain('5000')
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(true)
  })

  it('applique le délai par défaut quand aucun n\'est fourni', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', hangingFetch())

    const promise = uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE)
    await vi.advanceTimersByTimeAsync(DEFAULT_NETWORK_TIMEOUT_MS)
    const { error } = await promise

    expect(error?.message).toContain(String(DEFAULT_NETWORK_TIMEOUT_MS))
  })

  it('nettoie le timer quand la réponse arrive avant l\'expiration', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 200 })))

    const { error } = await uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE, { timeoutMs: 5_000 })

    expect(error).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })
})
