import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { FolderRepository } from './folderRepository'
import type { Folder } from '@/domain/entities/folder'

function makeFolder(overrides: Partial<Folder> = {}): Folder {
  return {
    id: '1',
    name: 'Maison',
    position: 0,
    created_at: '2026-08-06T00:00:00Z',
    updated_at: '2026-08-06T00:00:00Z',
    ...overrides,
  }
}

describe('FolderRepository', () => {
  let db: AppDatabase
  let repo: FolderRepository

  beforeEach(async () => {
    db = new AppDatabase('test-folder')
    repo = new FolderRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates and retrieves a folder', async () => {
    await repo.create(makeFolder())
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Maison')
  })

  it('retrieves all folders sorted by position', async () => {
    await repo.create(makeFolder({ id: '2', position: 1 }))
    await repo.create(makeFolder({ id: '1', position: 0 }))
    const folders = await repo.getAll()
    expect(folders.map((f) => f.id)).toEqual(['1', '2'])
  })

  it('updates a folder', async () => {
    await repo.create(makeFolder())
    await repo.update({ ...makeFolder(), name: 'Bureau' })
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Bureau')
  })

  it('deletes a folder', async () => {
    await repo.create(makeFolder())
    await repo.delete('1')
    expect(await repo.getById('1')).toBeUndefined()
  })
})
