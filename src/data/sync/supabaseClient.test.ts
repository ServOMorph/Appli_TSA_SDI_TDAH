import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSupabaseClient, resetSupabaseClient } from './supabaseClient'

afterEach(() => {
  resetSupabaseClient()
  vi.unstubAllEnvs()
})

describe('getSupabaseClient', () => {
  it('retourne null quand les variables d’environnement sont absentes', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    expect(getSupabaseClient()).toBeNull()
  })

  it('retourne null quand seule l’URL est fournie', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    expect(getSupabaseClient()).toBeNull()
  })

  it('construit un client quand les deux variables sont fournies', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publiable')
    expect(getSupabaseClient()).not.toBeNull()
  })

  it('met en cache le client entre deux appels', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publiable')
    expect(getSupabaseClient()).toBe(getSupabaseClient())
  })
})
