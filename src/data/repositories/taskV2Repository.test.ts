import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskV2Repository } from './taskV2Repository'
import type { TaskV2 } from '@/domain/entities/taskV2'

describe('TaskV2Repository', () => {
  let db: AppDatabase
  let repo: TaskV2Repository

  beforeEach(async () => {
    db = new AppDatabase('test-v2')
    repo = new TaskV2Repository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a task', async () => {
    const task: TaskV2 = {
      id: '1',
      title: 'Test task',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    const id = await repo.create(task)
    expect(id).toBe('1')
  })

  it('retrieves a task by id', async () => {
    const task: TaskV2 = {
      id: '1',
      title: 'Test task',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task)
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeDefined()
    expect(retrieved?.title).toBe('Test task')
  })

  it('updates a task', async () => {
    const task: TaskV2 = {
      id: '1',
      title: 'Original title',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task)
    const updated = { ...task, title: 'Updated title' }
    await repo.update(updated)
    const retrieved = await repo.getById('1')
    expect(retrieved?.title).toBe('Updated title')
  })

  it('deletes a task', async () => {
    const task: TaskV2 = {
      id: '1',
      title: 'Test task',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })

  it('retrieves tasks by status', async () => {
    const task1: TaskV2 = {
      id: '1',
      title: 'Todo task',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    const task2: TaskV2 = {
      id: '2',
      title: 'Planned task',
      status: 'planned',
      essential: true,
      position: 0,
      scheduled_date: '2026-06-29',
      scheduled_start: '10:00',
      scheduled_end: '11:00',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task1)
    await repo.create(task2)
    const todoTasks = await repo.getByStatus('todo')
    expect(todoTasks).toHaveLength(1)
    expect(todoTasks[0].id).toBe('1')
  })

  it('retrieves tasks by date', async () => {
    const task1: TaskV2 = {
      id: '1',
      title: 'Planned today',
      status: 'planned',
      essential: true,
      position: 0,
      scheduled_date: '2026-06-29',
      scheduled_start: '10:00',
      scheduled_end: '11:00',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    const task2: TaskV2 = {
      id: '2',
      title: 'Planned tomorrow',
      status: 'planned',
      essential: true,
      position: 0,
      scheduled_date: '2026-06-30',
      scheduled_start: '10:00',
      scheduled_end: '11:00',
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task1)
    await repo.create(task2)
    const tasks = await repo.getByDate('2026-06-29')
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('1')
  })

  it('retrieves essential tasks', async () => {
    const task1: TaskV2 = {
      id: '1',
      title: 'Essential task',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    const task2: TaskV2 = {
      id: '2',
      title: 'Non-essential task',
      status: 'todo',
      essential: false,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task1)
    await repo.create(task2)
    const essential = await repo.getEssentialTasks()
    expect(essential).toHaveLength(1)
    expect(essential[0].id).toBe('1')
  })

  it('reorders tasks', async () => {
    const task1: TaskV2 = {
      id: '1',
      title: 'Task 1',
      status: 'todo',
      essential: true,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    const task2: TaskV2 = {
      id: '2',
      title: 'Task 2',
      status: 'todo',
      essential: true,
      position: 1,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
      completed_at: null,
    }
    await repo.create(task1)
    await repo.create(task2)
    await repo.reorder(['2', '1'])
    const t1 = await repo.getById('2')
    const t2 = await repo.getById('1')
    expect(t1?.position).toBe(0)
    expect(t2?.position).toBe(1)
  })
})
