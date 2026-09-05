import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskCategoryRepository } from './taskCategoryRepository'
import type { TaskCategory } from '@/domain/entities/taskCategory'

describe('TaskCategoryRepository', () => {
  let db: AppDatabase
  let repo: TaskCategoryRepository

  beforeEach(async () => {
    db = new AppDatabase('test-task-category')
    repo = new TaskCategoryRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a category', async () => {
    const category: TaskCategory = {
      id: '1',
      name: 'Travail',
      color: '#4a7c99',
      position: 0,
      created_at: '2026-09-05T00:00:00Z',
    }
    const id = await repo.create(category)
    expect(id).toBe('1')
  })

  it('retrieves a category by id', async () => {
    const category: TaskCategory = {
      id: '1',
      name: 'Travail',
      color: '#4a7c99',
      position: 0,
      created_at: '2026-09-05T00:00:00Z',
    }
    await repo.create(category)
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Travail')
  })

  it('retrieves all categories, sorted by position', async () => {
    await repo.create({ id: '2', name: 'Maison', color: '#22aa55', position: 1, created_at: '2026-09-05T00:00:00Z' })
    await repo.create({ id: '1', name: 'Travail', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' })
    const categories = await repo.getAll()
    expect(categories.map((c) => c.id)).toEqual(['1', '2'])
  })

  it('updates a category', async () => {
    const category: TaskCategory = {
      id: '1',
      name: 'Travail',
      color: '#4a7c99',
      position: 0,
      created_at: '2026-09-05T00:00:00Z',
    }
    await repo.create(category)
    await repo.update({ ...category, name: 'Travail (renommé)', color: '#ff8800' })
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Travail (renommé)')
    expect(retrieved?.color).toBe('#ff8800')
  })

  it('deletes a category', async () => {
    const category: TaskCategory = {
      id: '1',
      name: 'Travail',
      color: '#4a7c99',
      position: 0,
      created_at: '2026-09-05T00:00:00Z',
    }
    await repo.create(category)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })
})
