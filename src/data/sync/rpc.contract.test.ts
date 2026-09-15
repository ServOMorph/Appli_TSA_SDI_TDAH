import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  getSyncConfig: vi.fn(),
}))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { callRpc } from './rpc'

const getSyncConfigMock = vi.mocked(getSyncConfig)

const SUPABASE_URL = 'https://exemple.supabase.co'
const ANON_KEY = 'cle-publiable'

const PARAMS = {
  p_device_id: 'device-1',
  p_device_secret: 'secret-1',
  p_payload: { version: '3.5', user: { id: 'user-1' } },
  p_schema_version: '3.5',
  p_app_version: '5.69',
}

/**
 * Référence capturée le 2026-09-01 en montant le SDK Supabase réel contre un `fetch` moqué
 * (méthode, URL, en-têtes et corps émis par `client.rpc('sync_device_snapshot', PARAMS)`).
 * `callRpc` doit reproduire ce sous-ensemble du contrat PostgREST à l'identique.
 */
describe('contrat PostgREST émis par callRpc (comparé à la référence SDK)', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getSyncConfigMock.mockReset()
    getSyncConfigMock.mockReturnValue({ url: SUPABASE_URL, anonKey: ANON_KEY })
    fetchMock = vi.fn(async () => new Response(JSON.stringify(true), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  it('émet un POST sur /rest/v1/rpc/sync_device_snapshot avec en-têtes et corps attendus', async () => {
    const { data, error } = await callRpc<boolean>('sync_device_snapshot', PARAMS)

    expect(error).toBeNull()
    expect(data).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)

    expect(url).toBe(`${SUPABASE_URL}/rest/v1/rpc/sync_device_snapshot`)
    expect(init.method).toBe('POST')
    expect(headers.get('apikey')).toBe(ANON_KEY)
    expect(headers.get('Authorization')).toBe(`Bearer ${ANON_KEY}`)
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(JSON.parse(init.body as string)).toEqual(PARAMS)
  })

  it('émet un POST sur /rest/v1/rpc/submit_feedback_message avec les mêmes garanties (Phase 3)', async () => {
    const params = {
      p_id: 'message-1',
      p_device_id: 'device-1',
      p_device_secret: 'secret-1',
      p_report_id: 'report-1',
      p_author: 'user',
      p_body: 'Toujours pas de retour visuel',
      p_created_at: '2026-09-14T10:00:00.000Z',
    }

    const { data, error } = await callRpc<boolean>('submit_feedback_message', params)

    expect(error).toBeNull()
    expect(data).toBe(true)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${SUPABASE_URL}/rest/v1/rpc/submit_feedback_message`)
    expect(JSON.parse(init.body as string)).toEqual(params)
  })

  it('émet un POST sur /rest/v1/rpc/close_feedback_report avec les mêmes garanties (Phase 3)', async () => {
    const params = {
      p_device_id: 'device-1',
      p_device_secret: 'secret-1',
      p_report_id: 'report-1',
      p_resolved_at: '2026-09-14T12:00:00.000Z',
    }

    const { data, error } = await callRpc<boolean>('close_feedback_report', params)

    expect(error).toBeNull()
    expect(data).toBe(true)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${SUPABASE_URL}/rest/v1/rpc/close_feedback_report`)
    expect(JSON.parse(init.body as string)).toEqual(params)
  })

  it('émet un POST sur /rest/v1/rpc/fetch_feedback_messages avec les mêmes garanties (Phase 4)', async () => {
    const params = {
      p_device_id: 'device-1',
      p_device_secret: 'secret-1',
      p_since: '2026-09-01T00:00:00.000Z',
    }
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))

    const { data, error } = await callRpc<unknown[]>('fetch_feedback_messages', params)

    expect(error).toBeNull()
    expect(data).toEqual([])
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${SUPABASE_URL}/rest/v1/rpc/fetch_feedback_messages`)
    expect(JSON.parse(init.body as string)).toEqual(params)
  })
})
