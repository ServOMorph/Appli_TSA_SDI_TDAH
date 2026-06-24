import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from './db'

let db: AppDatabase
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`test-db-${++testCount}`)
})

describe('AppDatabase', () => {
  it('initializes with all tables', () => {
    expect(db.users).toBeDefined()
    expect(db.tasks).toBeDefined()
    expect(db.subTasks).toBeDefined()
    expect(db.energyEntries).toBeDefined()
    expect(db.settings).toBeDefined()
  })

  it('has correct version', () => {
    expect(db.verno).toBe(1)
  })

  it('creates and retrieves users', async () => {
    const user = {
      id: 'user-1',
      profile_type: 'adult' as const,
      created_at: '2026-06-24T00:00:00Z',
      updated_at: '2026-06-24T00:00:00Z',
    }

    await db.users.add(user)
    const retrieved = await db.users.get('user-1')
    expect(retrieved).toEqual(user)
  })

  it('creates and retrieves tasks', async () => {
    const task = {
      id: 'task-1',
      title: 'Test task',
      status: 'inbox' as const,
      position: 0,
      created_at: '2026-06-24T00:00:00Z',
      updated_at: '2026-06-24T00:00:00Z',
      completed_at: null,
    }

    await db.tasks.add(task)
    const retrieved = await db.tasks.get('task-1')
    expect(retrieved).toEqual(task)
  })

  it('creates and retrieves subtasks', async () => {
    const subTask = {
      id: 'subtask-1',
      task_id: 'task-1',
      title: 'Subtask',
      is_completed: false,
      position: 0,
    }

    await db.subTasks.add(subTask)
    const retrieved = await db.subTasks.get('subtask-1')
    expect(retrieved).toEqual(subTask)
  })

  it('creates and retrieves energy entries', async () => {
    const entry = {
      id: 'energy-1',
      value: 5,
      status: 'filled' as const,
      entry_date: '2026-06-24',
    }

    await db.energyEntries.add(entry)
    const retrieved = await db.energyEntries.get('energy-1')
    expect(retrieved).toEqual(entry)
  })

  it('creates and retrieves settings', async () => {
    const settings = {
      id: 'settings-1',
      user_id: 'user-1',
      stimulation_mode: 'standard' as const,
      dark_mode: true,
      font_size: 'medium' as const,
      reduced_motion: false,
      overload_mode: false,
      local_encryption: false,
    }

    await db.settings.add(settings)
    const retrieved = await db.settings.get('settings-1')
    expect(retrieved).toEqual(settings)
  })
})
