import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { EnergyEntryRepository } from './energyEntryRepository'
import type { EnergyEntry } from '@/domain/entities/energyEntry'

let db: AppDatabase
let repo: EnergyEntryRepository
let repoEncrypted: EnergyEntryRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`energy-repo-test-${++testCount}`)
  repo = new EnergyEntryRepository(db)
  repoEncrypted = new EnergyEntryRepository(db, 'test-password')
})

describe('EnergyEntryRepository', () => {
  const mockEntry = (overrides?: Partial<EnergyEntry>): EnergyEntry => ({
    id: 'entry-1',
    value: 5,
    status: 'filled',
    entry_date: '2026-06-24',
    ...overrides,
  })

  describe('without encryption', () => {
    it('creates and retrieves entry', async () => {
      const entry = mockEntry()
      const id = await repo.create(entry)
      const retrieved = await repo.getById(id)
      expect(retrieved).toEqual(entry)
    })

    it('creates skipped entry with null value', async () => {
      const entry = mockEntry({ value: null, status: 'skipped' })
      const id = await repo.create(entry)
      const retrieved = await repo.getById(id)
      expect(retrieved?.value).toBeNull()
      expect(retrieved?.status).toBe('skipped')
    })

    it('updates entry', async () => {
      const entry = mockEntry()
      await repo.create(entry)
      const updated = mockEntry({ value: 7 })
      await repo.update(updated)
      const retrieved = await repo.getById(entry.id)
      expect(retrieved?.value).toBe(7)
    })

    it('deletes entry', async () => {
      const entry = mockEntry()
      await repo.create(entry)
      await repo.delete(entry.id)
      const retrieved = await repo.getById(entry.id)
      expect(retrieved).toBeUndefined()
    })

    it('gets entry by date', async () => {
      const entry = mockEntry({ entry_date: '2026-06-24' })
      await repo.create(entry)
      const retrieved = await repo.getByDate('2026-06-24')
      expect(retrieved?.value).toBe(5)
    })

    it('gets latest filled entry', async () => {
      await repo.create(mockEntry({ id: 'e1', entry_date: '2026-06-22', value: 3 }))
      await repo.create(mockEntry({ id: 'e2', entry_date: '2026-06-24', value: 7 }))
      await repo.create(mockEntry({ id: 'e3', entry_date: '2026-06-23', status: 'skipped', value: null }))

      const latest = await repo.getLatestFilled()
      expect(latest?.value).toBe(7)
      expect(latest?.entry_date).toBe('2026-06-24')
    })

    it('returns undefined when no filled entries', async () => {
      await repo.create(mockEntry({ status: 'skipped', value: null }))
      const latest = await repo.getLatestFilled()
      expect(latest).toBeUndefined()
    })
  })

  describe('with encryption', () => {
    it('encrypts value on create', async () => {
      const entry = mockEntry({ value: 5 })
      const id = await repoEncrypted.create(entry)

      const raw = await db.energyEntries.get(id)
      expect(raw?.value).not.toBe(5)
    })

    it('decrypts value on read', async () => {
      const entry = mockEntry({ value: 5 })
      const id = await repoEncrypted.create(entry)

      const retrieved = await repoEncrypted.getById(id)
      expect(retrieved?.value).toBe(5)
    })

    it('handles skipped entries with null value', async () => {
      const entry = mockEntry({ value: null, status: 'skipped' })
      const id = await repoEncrypted.create(entry)

      const retrieved = await repoEncrypted.getById(id)
      expect(retrieved?.value).toBeNull()
    })
  })
})
