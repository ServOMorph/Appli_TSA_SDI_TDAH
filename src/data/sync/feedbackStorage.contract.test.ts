import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/data/sync/syncConfig', () => ({
  getSyncConfig: vi.fn(),
}))

import { getSyncConfig } from '@/data/sync/syncConfig'
import { uploadFeedbackImage } from './feedbackStorage'

const getSyncConfigMock = vi.mocked(getSyncConfig)
const SUPABASE_URL = 'https://exemple.supabase.co'
const ANON_KEY = 'cle-publiable'
const DEVICE_ID = '9ad1ebea-5dbf-4f5c-a3bd-6e496ab346d6'
const REPORT_ID = '2d4bd8c4-1d02-4ee2-8678-8ac7fcf34230'
const IMAGE = new Blob(['image-jpeg'], { type: 'image/jpeg' })

describe('contrat Storage émis par uploadFeedbackImage', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getSyncConfigMock.mockReset()
    getSyncConfigMock.mockReturnValue({ url: SUPABASE_URL, anonKey: ANON_KEY })
    fetchMock = vi.fn(async () => new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  it('émet le POST vers le chemin privé avec les en-têtes et le binaire attendus', async () => {
    const { data, error } = await uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE)

    expect(error).toBeNull()
    expect(data).toEqual({ path: `${DEVICE_ID}/${REPORT_ID}.jpg` })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)
    expect(url).toBe(`${SUPABASE_URL}/storage/v1/object/feedback/${DEVICE_ID}/${REPORT_ID}.jpg`)
    expect(init.method).toBe('POST')
    expect(headers.get('apikey')).toBe(ANON_KEY)
    expect(headers.get('Authorization')).toBe(`Bearer ${ANON_KEY}`)
    expect(headers.get('Content-Type')).toBe('image/jpeg')
    expect(init.body).toBe(IMAGE)
  })

  it('retourne une erreur HTTP sans lever', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 413 }))

    const { data, error } = await uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE)

    expect(data).toBeNull()
    expect(error?.message).toBe('upload du retour a échoué (413)')
  })

  it('retourne une erreur réseau sans lever', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))

    const { data, error } = await uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE)

    expect(data).toBeNull()
    expect(error?.message).toBe('offline')
  })

  it('n appelle pas le réseau lorsque la synchronisation est désactivée', async () => {
    getSyncConfigMock.mockReturnValue(null)

    const { data, error } = await uploadFeedbackImage(DEVICE_ID, REPORT_ID, IMAGE)

    expect(data).toBeNull()
    expect(error?.message).toBe('synchronisation non configurée')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
