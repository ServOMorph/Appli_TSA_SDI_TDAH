import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSyncConfig, isSyncEnabled, resetSyncConfig } from './syncConfig'

afterEach(() => {
  resetSyncConfig()
  vi.unstubAllEnvs()
})

describe('getSyncConfig', () => {
  it('retourne null quand aucune variable d’environnement n’est fournie', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    expect(getSyncConfig()).toBeNull()
  })

  it('retourne null quand seule l’URL est fournie', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    expect(getSyncConfig()).toBeNull()
  })

  it('retourne null quand seule la clé est fournie', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publiable')
    expect(getSyncConfig()).toBeNull()
  })

  it('construit une configuration quand les deux variables sont fournies', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publiable')
    expect(getSyncConfig()).toEqual({
      url: 'https://exemple.supabase.co',
      anonKey: 'cle-publiable',
    })
  })

  it('met en cache la configuration entre deux appels', () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publiable')
    expect(getSyncConfig()).toBe(getSyncConfig())
  })
})

describe('isSyncEnabled', () => {
  it('reflète la présence de la configuration', () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    expect(isSyncEnabled()).toBe(false)

    resetSyncConfig()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://exemple.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'cle-publiable')
    expect(isSyncEnabled()).toBe(true)
  })
})
