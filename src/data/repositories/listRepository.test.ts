import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { ListRepository } from './listRepository'
import type { List } from '@/domain/entities/list'

describe('ListRepository', () => {
  let db: AppDatabase
  let repo: ListRepository

  beforeEach(async () => {
    db = new AppDatabase('test-list')
    repo = new ListRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a list', async () => {
    const list: List = {
      id: '1',
      name: 'Musiques',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    const id = await repo.create(list)
    expect(id).toBe('1')
  })

  it('retrieves a list by id', async () => {
    const list: List = {
      id: '1',
      name: 'Habits',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(list)
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Habits')
  })

  it('retrieves all lists', async () => {
    const list1: List = {
      id: '1',
      name: 'Musiques',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    const list2: List = {
      id: '2',
      name: 'Livres',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(list1)
    await repo.create(list2)
    const lists = await repo.getAll()
    expect(lists).toHaveLength(2)
  })

  it('updates a list', async () => {
    const list: List = {
      id: '1',
      name: 'Original',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(list)
    const updated = { ...list, name: 'Updated' }
    await repo.update(updated)
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Updated')
  })

  it('deletes a list', async () => {
    const list: List = {
      id: '1',
      name: 'Musiques',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(list)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })
})
