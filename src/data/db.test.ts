import { beforeEach, describe, it, expect } from 'vitest'
import Dexie from 'dexie'
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
    expect(db.tasksV2).toBeDefined()
    expect(db.lists).toBeDefined()
    expect(db.listItems).toBeDefined()
    expect(db.energyEntries).toBeDefined()
    expect(db.settings).toBeDefined()
    expect(db.budgetCategories).toBeDefined()
    expect(db.budgetEntries).toBeDefined()
    expect(db.budgetAccounts).toBeDefined()
    expect(db.budgetDeposits).toBeDefined()
  })

  it('has correct version', () => {
    expect(db.verno).toBe(5)
  })

  it('upgrades a version 4 database without losing existing data', async () => {
    const name = `migration-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(4).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position, scheduled_date',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
    await legacy.open()
    await legacy.table('lists').add({
      id: 'list-1',
      name: 'Existante',
      created_at: '2026-07-21T00:00:00Z',
      updated_at: '2026-07-21T00:00:00Z',
    })
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(await upgraded.lists.get('list-1')).toMatchObject({ name: 'Existante' })
    expect(upgraded.budgetCategories).toBeDefined()
    await upgraded.delete()
  })

  it('creates and retrieves users', async () => {
    const user = {
      id: 'user-1',
      profile_type: 'adult' as const,
      onboarding_completed: true,
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
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
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
      dark_mode: true,
      font_size: 'medium' as const,
      reduced_motion: false,
      local_encryption: false,
    }

    await db.settings.add(settings)
    const retrieved = await db.settings.get('settings-1')
    expect(retrieved).toEqual(settings)
  })
})
