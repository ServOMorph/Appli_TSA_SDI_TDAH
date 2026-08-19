import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { ListItemSubTaskRepository } from './listItemSubTaskRepository'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'

describe('ListItemSubTaskRepository', () => {
  let db: AppDatabase
  let repo: ListItemSubTaskRepository

  beforeEach(async () => {
    db = new AppDatabase('test-list-item-subtask')
    repo = new ListItemSubTaskRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  function makeSubTask(overrides: Partial<ListItemSubTask> = {}): ListItemSubTask {
    return {
      id: '1',
      list_item_id: 'item-1',
      title: 'Étape 1',
      position: 0,
      checked: false,
      created_at: '2026-08-18T00:00:00Z',
      ...overrides,
    }
  }

  it('creates a sub-task', async () => {
    const id = await repo.create(makeSubTask())
    expect(id).toBe('1')
  })

  it('retrieves a sub-task by id', async () => {
    await repo.create(makeSubTask({ title: 'Ma sous-tâche' }))
    const retrieved = await repo.getById('1')
    expect(retrieved?.title).toBe('Ma sous-tâche')
  })

  it('retrieves sub-tasks by list item id, sorted by position', async () => {
    await repo.create(makeSubTask({ id: '1', list_item_id: 'item-1', position: 1 }))
    await repo.create(makeSubTask({ id: '2', list_item_id: 'item-1', position: 0 }))
    await repo.create(makeSubTask({ id: '3', list_item_id: 'item-2', position: 0 }))
    const subTasks = await repo.getByListItemId('item-1')
    expect(subTasks.map((s) => s.id)).toEqual(['2', '1'])
  })

  it('updates a sub-task', async () => {
    await repo.create(makeSubTask())
    await repo.update({ ...makeSubTask(), checked: true })
    const retrieved = await repo.getById('1')
    expect(retrieved?.checked).toBe(true)
  })

  it('deletes a sub-task', async () => {
    await repo.create(makeSubTask())
    await repo.delete('1')
    expect(await repo.getById('1')).toBeUndefined()
  })
})
