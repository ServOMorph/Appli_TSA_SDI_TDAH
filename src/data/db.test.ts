import { beforeEach, describe, it, expect } from 'vitest'
import Dexie from 'dexie'
import { AppDatabase } from './db'
import { makeTask } from '@/test/factories'

let db: AppDatabase
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`test-db-${++testCount}`)
})

describe('AppDatabase', () => {
  it('initializes with all tables', () => {
    expect(db.users).toBeDefined()
    expect(db.tasks).toBeDefined()
    expect(db.lists).toBeDefined()
    expect(db.listItems).toBeDefined()
    expect(db.energyEntries).toBeDefined()
    expect(db.settings).toBeDefined()
    expect(db.budgetCategories).toBeDefined()
    expect(db.budgetEntries).toBeDefined()
    expect(db.budgetAccounts).toBeDefined()
    expect(db.budgetDeposits).toBeDefined()
    expect(db.taskRecurrences).toBeDefined()
    expect(db.taskExceptions).toBeDefined()
  })

  it('has correct version', () => {
    expect(db.verno).toBe(9)
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

  it('upgrades a version 5 database by migrating deposit periodicity and repairing orphaned data', async () => {
    const name = `migration-v5-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(5).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position, scheduled_date',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, kind, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date',
    })
    await legacy.open()
    await legacy.table('budgetAccounts').add({
      id: 'account-1',
      name: 'Livret A',
      created_at: '2026-07-21T00:00:00Z',
      updated_at: '2026-07-21T00:00:00Z',
    })
    await legacy.table('budgetCategories').add({
      id: 'category-1',
      name: 'Courses',
      kind: 'expense',
      period: 'week',
      amount: 60,
      position: 0,
      created_at: '2026-07-21T00:00:00Z',
      updated_at: '2026-07-21T00:00:00Z',
    })
    await legacy.table('budgetDeposits').bulkAdd([
      { id: 'deposit-valid', account_id: 'account-1', amount: 50, date: '2026-07-21', created_at: '2026-07-21T00:00:00Z' },
      { id: 'deposit-orphan', account_id: 'account-deleted', amount: 30, date: '2026-07-21', created_at: '2026-07-21T00:00:00Z' },
    ])
    await legacy.table('budgetEntries').bulkAdd([
      { id: 'entry-valid', category_id: 'category-1', amount: 20, date: '2026-07-21', created_at: '2026-07-21T00:00:00Z' },
      { id: 'entry-orphan', category_id: 'category-deleted', amount: 10, date: '2026-07-21', created_at: '2026-07-21T00:00:00Z' },
    ])
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(await upgraded.budgetDeposits.get('deposit-valid')).toMatchObject({ period: 'month' })
    expect(await upgraded.budgetDeposits.get('deposit-orphan')).toBeUndefined()
    expect(await upgraded.budgetEntries.get('entry-valid')).toBeDefined()
    expect(await upgraded.budgetEntries.get('entry-orphan')).toBeUndefined()
    await upgraded.delete()
  })

  it('upgrades a version 6 database by merging subTasks and tasksV2 into a single tasks table', async () => {
    const name = `migration-v6-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(6).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position, scheduled_date',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, kind, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date, period',
    })
    await legacy.open()
    await legacy.table('tasks').add({
      id: 'legacy-task',
      title: 'Tâche V1',
      status: 'today',
      position: 0,
      created_at: '2026-07-21T00:00:00Z',
      updated_at: '2026-07-21T00:00:00Z',
      completed_at: null,
    })
    await legacy.table('subTasks').bulkAdd([
      {
        id: 'legacy-sub-done',
        task_id: 'legacy-task',
        title: 'Étape terminée',
        is_completed: true,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
      },
      {
        id: 'legacy-sub-planned',
        task_id: 'legacy-task',
        title: 'Étape planifiée',
        is_completed: false,
        position: 1,
        scheduled_date: '2026-07-22',
        scheduled_start: '10:00',
        scheduled_end: '10:30',
      },
      {
        id: 'legacy-sub-orphan',
        task_id: 'parent-supprime',
        title: 'Étape orpheline',
        is_completed: false,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
      },
    ])
    await legacy.table('tasksV2').bulkAdd([
      {
        id: 'legacy-v2-planned',
        title: 'Tâche planifiée',
        status: 'planned',
        essential: true,
        energy_cost: 4,
        position: 0,
        scheduled_date: '2026-07-22',
        scheduled_start: '14:00',
        scheduled_end: '15:00',
        created_at: '2026-07-21T00:00:00Z',
        updated_at: '2026-07-21T00:00:00Z',
        completed_at: null,
      },
      {
        id: 'legacy-v2-todo',
        title: 'Tâche todo',
        status: 'todo',
        essential: false,
        position: 1,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: '2026-07-21T00:00:00Z',
        updated_at: '2026-07-21T00:00:00Z',
        completed_at: null,
      },
    ])
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(9)
    expect(upgraded.tables.map((t) => t.name)).not.toContain('subTasks')
    expect(upgraded.tables.map((t) => t.name)).not.toContain('tasksV2')

    expect(await upgraded.tasks.get('legacy-task')).toMatchObject({
      title: 'Tâche V1',
      status: 'today',
      parent_id: null,
      essential: false,
      energy_cost: null,
      postponed: false,
    })

    expect(await upgraded.tasks.get('legacy-sub-done')).toMatchObject({
      parent_id: 'legacy-task',
      status: 'completed',
      title: 'Étape terminée',
    })
    expect(await upgraded.tasks.get('legacy-sub-planned')).toMatchObject({
      parent_id: 'legacy-task',
      status: 'planned',
      scheduled_date: '2026-07-22',
      scheduled_start: '10:00',
    })
    expect(await upgraded.tasks.get('legacy-sub-orphan')).toBeUndefined()

    expect(await upgraded.tasks.get('legacy-v2-planned')).toMatchObject({
      parent_id: null,
      status: 'planned',
      essential: true,
      energy_cost: 4,
      scheduled_date: '2026-07-22',
    })
    expect(await upgraded.tasks.get('legacy-v2-todo')).toMatchObject({
      parent_id: null,
      status: 'inbox',
    })

    await upgraded.delete()
  })

  it('upgrades a version 8 database by adding recurrence fields with defaults', async () => {
    const name = `migration-v8-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(7).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date',
      subTasks: 'id, task_id, position, scheduled_date',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, kind, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date, period',
    })
    legacy.version(8).stores({
      subTasks: null,
      tasksV2: null,
    })
    await legacy.open()
    await legacy.table('tasks').add({
      id: 'legacy-task',
      parent_id: null,
      title: 'Tâche existante',
      status: 'inbox',
      essential: false,
      energy_cost: null,
      postponed: false,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: '2026-07-21T00:00:00Z',
      updated_at: '2026-07-21T00:00:00Z',
      completed_at: null,
    })
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(9)
    expect(await upgraded.tasks.get('legacy-task')).toMatchObject({
      title: 'Tâche existante',
      description: '',
      duration_minutes: null,
      icon: null,
      color: null,
      recurrence_id: null,
      is_recurrence_root: false,
      recurrence_exception: false,
    })
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
    const task = makeTask()
    await db.tasks.add(task)
    expect(await db.tasks.get('task-1')).toEqual(task)
  })

  it('creates and retrieves subtasks in the same table', async () => {
    const subTask = makeTask({ id: 'subtask-1', parent_id: 'task-1', title: 'Subtask' })
    await db.tasks.add(subTask)
    expect(await db.tasks.get('subtask-1')).toEqual(subTask)
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
    }

    await db.settings.add(settings)
    const retrieved = await db.settings.get('settings-1')
    expect(retrieved).toEqual(settings)
  })
})
