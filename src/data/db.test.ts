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
    expect(db.listCategories).toBeDefined()
    expect(db.energyEntries).toBeDefined()
    expect(db.settings).toBeDefined()
    expect(db.budgetCategories).toBeDefined()
    expect(db.budgetEntries).toBeDefined()
    expect(db.budgetAccounts).toBeDefined()
    expect(db.budgetDeposits).toBeDefined()
    expect(db.taskRecurrences).toBeDefined()
    expect(db.taskExceptions).toBeDefined()
    expect(db.folders).toBeDefined()
    expect(db.tools).toBeDefined()
  })

  it('has correct version', () => {
    expect(db.verno).toBe(19)
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

  it('upgrades a version 5 database by repairing orphaned budget data', async () => {
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

    expect(await upgraded.budgetDeposits.get('deposit-valid')).toBeDefined()
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

    expect(upgraded.verno).toBe(19)
    expect(upgraded.tables.map((t) => t.name)).not.toContain('subTasks')
    expect(upgraded.tables.map((t) => t.name)).not.toContain('tasksV2')

    expect(await upgraded.tasks.get('legacy-task')).toMatchObject({
      title: 'Tâche V1',
      status: 'inbox',
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

    expect(upgraded.verno).toBe(19)
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

  it('upgrades a version 9 database by seeding a default To Do list and tools, and adding checked/category_id to list items', async () => {
    const name = `migration-v9-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(9).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, kind, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date, period',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
    })
    await legacy.open()
    await legacy.table('lists').add({ id: 'existing-list', name: 'Musiques', created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' })
    await legacy.table('listItems').add({ id: 'existing-item', list_id: 'existing-list', title: 'Item existant', position: 0, created_at: '2026-08-01T00:00:00Z' })
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)

    const migratedItem = await upgraded.listItems.get('existing-item')
    expect(migratedItem).toMatchObject({ checked: false })
    expect(migratedItem?.category_id).toBeDefined()
    const category = await upgraded.listCategories.get(migratedItem!.category_id)
    expect(category).toMatchObject({ list_id: 'existing-list', name: 'Général' })

    const lists = await upgraded.lists.toArray()
    expect(lists.some((l) => l.name === 'To Do')).toBe(true)

    const tools = await upgraded.tools.toArray()
    expect(tools.some((t) => t.type === 'tableau_comptage')).toBe(true)
    const todoTool = tools.find((t) => t.type === 'liste')
    expect(todoTool).toBeDefined()
    const todoList = lists.find((l) => l.id === todoTool?.list_id)
    expect(todoList?.name).toBe('To Do')

    await upgraded.delete()
  })

  it('upgrades a version 11 database by grouping list items into categories by their former section', async () => {
    const name = `migration-v12-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(11).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position, checked',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, kind, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date, period',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
      folders: 'id, position',
      tools: 'id, type, folder_id, position',
      manualTestResults: 'id, test_id',
    })
    await legacy.open()
    await legacy.table('lists').add({ id: 'list-1', name: 'À acheter', created_at: '2026-08-14T00:00:00Z', updated_at: '2026-08-14T00:00:00Z' })
    await legacy.table('listItems').bulkAdd([
      { id: 'item-ete-1', list_id: 'list-1', title: 'Short', position: 0, checked: false, section: 'Habits été', created_at: '2026-08-14T00:00:00Z' },
      { id: 'item-ete-2', list_id: 'list-1', title: 'Sandales', position: 1, checked: false, section: 'Habits été', created_at: '2026-08-14T00:00:00Z' },
      { id: 'item-sans', list_id: 'list-1', title: 'Divers', position: 0, checked: false, section: null, created_at: '2026-08-14T00:00:00Z' },
    ])
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)
    const categories = await upgraded.listCategories.where('list_id').equals('list-1').toArray()
    expect(categories.map((c) => c.name).sort()).toEqual(['Général', 'Habits été'])

    const items = await upgraded.listItems.where('list_id').equals('list-1').toArray()
    const eteCategory = categories.find((c) => c.name === 'Habits été')!
    const generalCategory = categories.find((c) => c.name === 'Général')!
    expect(items.find((i) => i.id === 'item-ete-1')?.category_id).toBe(eteCategory.id)
    expect(items.find((i) => i.id === 'item-ete-2')?.category_id).toBe(eteCategory.id)
    expect(items.find((i) => i.id === 'item-sans')?.category_id).toBe(generalCategory.id)

    await upgraded.delete()
  })

  it('upgrades a version 13 database by convertissant les catégories income en revenus historiques', async () => {
    const name = `migration-v14-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(13).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position, checked, category_id',
      listCategories: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, kind, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date, period',
      budgetIncomeEntries: 'id, date',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
      folders: 'id, position',
      tools: 'id, type, folder_id, position',
      manualTestResults: 'id, test_id',
    })
    await legacy.open()
    await legacy.table('budgetCategories').bulkAdd([
      { id: 'income-1', name: 'Salaire', kind: 'income', period: 'month', amount: 1500, position: 0, created_at: '2026-07-21T00:00:00Z', updated_at: '2026-07-21T00:00:00Z' },
      { id: 'expense-1', name: 'Courses', kind: 'expense', period: 'week', amount: 60, position: 1, created_at: '2026-07-21T00:00:00Z', updated_at: '2026-07-21T00:00:00Z' },
    ])
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)
    expect(await upgraded.budgetCategories.get('income-1')).toBeUndefined()
    expect(await upgraded.budgetCategories.get('expense-1')).toBeDefined()

    const incomeEntries = await upgraded.budgetIncomeEntries.toArray()
    expect(incomeEntries).toHaveLength(1)
    expect(incomeEntries[0]).toMatchObject({ amount: 1500, label: 'Salaire' })

    await upgraded.delete()
  })

  it('upgrades a version 15 database by adding a default description to list items and a sub-tasks table', async () => {
    const name = `migration-v16-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(15).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position, checked, category_id',
      listCategories: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date',
      budgetIncomeEntries: 'id, date',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
      folders: 'id, position',
      tools: 'id, type, folder_id, position',
      manualTestResults: 'id, test_id',
    })
    await legacy.open()
    await legacy.table('lists').add({ id: 'list-1', name: 'À acheter', created_at: '2026-08-18T00:00:00Z', updated_at: '2026-08-18T00:00:00Z' })
    await legacy.table('listItems').add({
      id: 'item-1',
      list_id: 'list-1',
      title: 'Pain',
      position: 0,
      checked: false,
      category_id: 'cat-1',
      created_at: '2026-08-18T00:00:00Z',
    })
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)
    expect(await upgraded.listItems.get('item-1')).toMatchObject({ description: '' })
    expect(upgraded.listItemSubTasks).toBeDefined()

    await upgraded.delete()
  })

  it('upgrades a version 16 database by adding a default color to tools', async () => {
    const name = `migration-v17-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(16).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position, checked, category_id',
      listItemSubTasks: 'id, list_item_id, position',
      listCategories: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date',
      budgetIncomeEntries: 'id, date',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
      folders: 'id, position',
      tools: 'id, type, folder_id, position',
      manualTestResults: 'id, test_id',
    })
    await legacy.open()
    await legacy.table('tools').add({
      id: 'tool-1',
      type: 'liste',
      folder_id: null,
      list_id: 'list-1',
      position: 0,
      created_at: '2026-08-18T00:00:00Z',
      updated_at: '2026-08-18T00:00:00Z',
    })
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)
    expect(await upgraded.tools.get('tool-1')).toMatchObject({ color: null })

    await upgraded.delete()
  })

  it('upgrades a version 17 database by migrating tasks with status "today" to "inbox"', async () => {
    const name = `migration-v18-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(17).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position, checked, category_id',
      listItemSubTasks: 'id, list_item_id, position',
      listCategories: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date',
      budgetIncomeEntries: 'id, date',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
      folders: 'id, position',
      tools: 'id, type, folder_id, position',
      manualTestResults: 'id, test_id',
    })
    await legacy.open()
    await legacy.table('tasks').bulkAdd([
      {
        id: 'task-today',
        parent_id: null,
        title: 'Tâche du jour',
        status: 'today',
        essential: false,
        energy_cost: null,
        postponed: false,
        position: 0,
        scheduled_date: '2026-09-03',
        scheduled_start: '09:00',
        scheduled_end: '09:30',
        created_at: '2026-09-03T00:00:00Z',
        updated_at: '2026-09-03T00:00:00Z',
        completed_at: null,
      },
      {
        id: 'task-inbox',
        parent_id: null,
        title: 'Tâche réception',
        status: 'inbox',
        essential: false,
        energy_cost: null,
        postponed: false,
        position: 1,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: '2026-09-03T00:00:00Z',
        updated_at: '2026-09-03T00:00:00Z',
        completed_at: null,
      },
    ])
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)
    expect(await upgraded.tasks.get('task-today')).toMatchObject({
      status: 'inbox',
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
    })
    expect(await upgraded.tasks.get('task-inbox')).toMatchObject({ status: 'inbox', position: 1 })

    await upgraded.delete()
  })

  it('upgrades a version 18 database by adding feedback reports without altering existing data', async () => {
    const name = `migration-v19-db-${++testCount}`
    const legacy = new Dexie(name)
    legacy.version(18).stores({
      users: 'id',
      tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
      lists: 'id',
      listItems: 'id, list_id, position, checked, category_id',
      listItemSubTasks: 'id, list_item_id, position',
      listCategories: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
      budgetCategories: 'id, period, position',
      budgetEntries: 'id, category_id, date',
      budgetAccounts: 'id',
      budgetDeposits: 'id, account_id, date',
      budgetIncomeEntries: 'id, date',
      taskRecurrences: 'id',
      taskExceptions: 'id, recurrence_id',
      folders: 'id, position',
      tools: 'id, type, folder_id, position',
      manualTestResults: 'id, test_id',
    })
    await legacy.open()
    await legacy.table('users').add({ id: 'user-1', profile_type: 'adult' })
    legacy.close()

    const upgraded = new AppDatabase(name)
    await upgraded.open()

    expect(upgraded.verno).toBe(19)
    expect(await upgraded.users.get('user-1')).toMatchObject({ id: 'user-1' })
    expect(await upgraded.feedbackReports.toArray()).toEqual([])

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
