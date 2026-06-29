import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { ListItemRepository } from './listItemRepository'
import type { ListItem } from '@/domain/entities/listItem'

describe('ListItemRepository', () => {
  let db: AppDatabase
  let repo: ListItemRepository

  beforeEach(async () => {
    db = new AppDatabase('test-list-item')
    repo = new ListItemRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a list item', async () => {
    const item: ListItem = {
      id: '1',
      list_id: 'list-1',
      title: 'Item 1',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    const id = await repo.create(item)
    expect(id).toBe('1')
  })

  it('retrieves an item by id', async () => {
    const item: ListItem = {
      id: '1',
      list_id: 'list-1',
      title: 'My item',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(item)
    const retrieved = await repo.getById('1')
    expect(retrieved?.title).toBe('My item')
  })

  it('retrieves items by list id', async () => {
    const item1: ListItem = {
      id: '1',
      list_id: 'list-1',
      title: 'Item 1',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    const item2: ListItem = {
      id: '2',
      list_id: 'list-1',
      title: 'Item 2',
      position: 1,
      created_at: '2026-06-29T00:00:00Z',
    }
    const item3: ListItem = {
      id: '3',
      list_id: 'list-2',
      title: 'Item 3',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(item1)
    await repo.create(item2)
    await repo.create(item3)
    const items = await repo.getByListId('list-1')
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('1')
  })

  it('updates an item', async () => {
    const item: ListItem = {
      id: '1',
      list_id: 'list-1',
      title: 'Original',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(item)
    const updated = { ...item, title: 'Updated' }
    await repo.update(updated)
    const retrieved = await repo.getById('1')
    expect(retrieved?.title).toBe('Updated')
  })

  it('deletes an item', async () => {
    const item: ListItem = {
      id: '1',
      list_id: 'list-1',
      title: 'Item 1',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(item)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })

  it('reorders items', async () => {
    const item1: ListItem = {
      id: '1',
      list_id: 'list-1',
      title: 'Item 1',
      position: 0,
      created_at: '2026-06-29T00:00:00Z',
    }
    const item2: ListItem = {
      id: '2',
      list_id: 'list-1',
      title: 'Item 2',
      position: 1,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(item1)
    await repo.create(item2)
    await repo.reorder(['2', '1'])
    const i1 = await repo.getById('2')
    const i2 = await repo.getById('1')
    expect(i1?.position).toBe(0)
    expect(i2?.position).toBe(1)
  })
})
