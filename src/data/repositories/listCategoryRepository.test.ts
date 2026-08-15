import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { ListCategoryRepository } from './listCategoryRepository'
import type { ListCategory } from '@/domain/entities/listCategory'

describe('ListCategoryRepository', () => {
  let db: AppDatabase
  let repo: ListCategoryRepository

  beforeEach(async () => {
    db = new AppDatabase('test-list-category')
    repo = new ListCategoryRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a category', async () => {
    const category: ListCategory = {
      id: '1',
      list_id: 'list-1',
      name: 'Été',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    const id = await repo.create(category)
    expect(id).toBe('1')
  })

  it('retrieves a category by id', async () => {
    const category: ListCategory = {
      id: '1',
      list_id: 'list-1',
      name: 'Été',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(category)
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Été')
  })

  it('retrieves categories by list id, sorted by position', async () => {
    await repo.create({ id: '2', list_id: 'list-1', name: 'Hiver', position: 1, created_at: '2026-06-29T00:00:00Z' })
    await repo.create({ id: '1', list_id: 'list-1', name: 'Été', position: 0, created_at: '2026-06-29T00:00:00Z' })
    await repo.create({ id: '3', list_id: 'list-2', name: 'Autre', position: 0, created_at: '2026-06-29T00:00:00Z' })
    const categories = await repo.getByListId('list-1')
    expect(categories.map((c) => c.id)).toEqual(['1', '2'])
  })

  it('updates a category', async () => {
    const category: ListCategory = {
      id: '1',
      list_id: 'list-1',
      name: 'Été',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(category)
    await repo.update({ ...category, name: 'Été (renommé)' })
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Été (renommé)')
  })

  it('deletes a category', async () => {
    const category: ListCategory = {
      id: '1',
      list_id: 'list-1',
      name: 'Été',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(category)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })
})
