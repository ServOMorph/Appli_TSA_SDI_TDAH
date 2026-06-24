import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { SettingsRepository } from './settingsRepository'
import type { Settings } from '@/domain/entities/settings'

let db: AppDatabase
let repo: SettingsRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`settings-repo-test-${++testCount}`)
  repo = new SettingsRepository(db)
})

describe('SettingsRepository', () => {
  const mockSettings = (overrides?: Partial<Settings>): Settings => ({
    id: 'settings-1',
    user_id: 'user-1',
    stimulation_mode: 'standard',
    dark_mode: true,
    font_size: 'medium',
    reduced_motion: false,
    overload_mode: false,
    local_encryption: false,
    ...overrides,
  })

  it('creates and retrieves settings', async () => {
    const settings = mockSettings()
    const id = await repo.create(settings)
    const retrieved = await repo.getById(id)
    expect(retrieved).toEqual(settings)
  })

  it('updates settings', async () => {
    const settings = mockSettings()
    await repo.create(settings)
    const updated = mockSettings({ dark_mode: false, stimulation_mode: 'calm' })
    await repo.update(updated)
    const retrieved = await repo.getById(settings.id)
    expect(retrieved?.dark_mode).toBe(false)
    expect(retrieved?.stimulation_mode).toBe('calm')
  })

  it('deletes settings', async () => {
    const settings = mockSettings()
    await repo.create(settings)
    await repo.delete(settings.id)
    const retrieved = await repo.getById(settings.id)
    expect(retrieved).toBeUndefined()
  })

  it('gets settings by user_id', async () => {
    const settings = mockSettings({ user_id: 'user-1' })
    await repo.create(settings)
    const retrieved = await repo.getByUserId('user-1')
    expect(retrieved?.user_id).toBe('user-1')
  })

  it('returns undefined for non-existent user', async () => {
    const retrieved = await repo.getByUserId('non-existent')
    expect(retrieved).toBeUndefined()
  })
})
