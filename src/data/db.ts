import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { User } from '@/domain/entities/user'
import type { Task } from '@/domain/entities/task'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'
import type { ListCategory } from '@/domain/entities/listCategory'
import type { EnergyEntry } from '@/domain/entities/energyEntry'
import type { Settings } from '@/domain/entities/settings'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { TaskRecurrence } from '@/domain/entities/taskRecurrence'
import type { TaskException } from '@/domain/entities/taskException'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'

function migrationId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  return [...b]
    .map((v, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + v.toString(16).padStart(2, '0'))
    .join('')
}

export class AppDatabase extends Dexie {
  users!: Table<User>
  tasks!: Table<Task>
  lists!: Table<List>
  listItems!: Table<ListItem>
  listItemSubTasks!: Table<ListItemSubTask>
  listCategories!: Table<ListCategory>
  energyEntries!: Table<EnergyEntry>
  settings!: Table<Settings>
  budgetCategories!: Table<BudgetCategory>
  budgetEntries!: Table<BudgetEntry>
  budgetAccounts!: Table<BudgetAccount>
  budgetDeposits!: Table<BudgetDeposit>
  taskRecurrences!: Table<TaskRecurrence>
  taskExceptions!: Table<TaskException>
  folders!: Table<Folder>
  tools!: Table<Tool>
  manualTestResults!: Table<ManualTestResult>

  constructor(name = 'appli-tsa-sdi-tdah') {
    super(name)
    this.version(1).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
    this.version(2).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
    this.version(3).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
    this.version(4).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position, scheduled_date',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
    this.version(5).stores({
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
    this.version(6)
      .stores({
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
      .upgrade(async (tx) => {
        await tx
          .table('budgetDeposits')
          .toCollection()
          .modify((deposit) => {
            deposit.period = 'month'
          })

        const accountIds = new Set((await tx.table('budgetAccounts').toArray()).map((account) => account.id))
        const orphanDeposits = await tx
          .table('budgetDeposits')
          .filter((deposit) => !accountIds.has(deposit.account_id))
          .primaryKeys()
        await tx.table('budgetDeposits').bulkDelete(orphanDeposits)

        const categoryIds = new Set((await tx.table('budgetCategories').toArray()).map((category) => category.id))
        const orphanEntries = await tx
          .table('budgetEntries')
          .filter((entry) => !categoryIds.has(entry.category_id))
          .primaryKeys()
        await tx.table('budgetEntries').bulkDelete(orphanEntries)
      })
    this.version(7)
      .stores({
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
      .upgrade(async (tx) => {
        const tasksTable = tx.table('tasks')

        await tasksTable.toCollection().modify((task) => {
          task.parent_id = null
          task.essential = false
          task.energy_cost = null
          task.postponed = false
          task.scheduled_date = null
          task.scheduled_start = null
          task.scheduled_end = null
        })

        const legacyTasks = await tasksTable.toArray()
        const parentById = new Map(legacyTasks.map((task) => [task.id, task]))
        const fallbackDate = new Date().toISOString()

        const legacySubTasks = await tx.table('subTasks').toArray()
        const migratedSubTasks = legacySubTasks
          .filter((subTask) => parentById.has(subTask.task_id))
          .map((subTask) => {
            const parent = parentById.get(subTask.task_id)
            const scheduledDate = subTask.scheduled_date ?? null
            return {
              id: subTask.id,
              parent_id: subTask.task_id,
              title: subTask.title,
              status: subTask.is_completed ? 'completed' : scheduledDate ? 'planned' : 'inbox',
              essential: false,
              energy_cost: null,
              postponed: subTask.postponed ?? false,
              position: subTask.position,
              scheduled_date: scheduledDate,
              scheduled_start: subTask.scheduled_start ?? null,
              scheduled_end: subTask.scheduled_end ?? null,
              created_at: parent?.created_at ?? fallbackDate,
              updated_at: parent?.updated_at ?? fallbackDate,
              completed_at: null,
            }
          })

        const legacyTasksV2 = await tx.table('tasksV2').toArray()
        const migratedTasksV2 = legacyTasksV2.map((task) => ({
          id: task.id,
          parent_id: null,
          title: task.title,
          status: task.status === 'todo' ? 'inbox' : task.status,
          essential: task.essential ?? false,
          energy_cost: task.energy_cost ?? null,
          postponed: task.postponed ?? false,
          position: task.position,
          scheduled_date: task.scheduled_date ?? null,
          scheduled_start: task.scheduled_start ?? null,
          scheduled_end: task.scheduled_end ?? null,
          created_at: task.created_at,
          updated_at: task.updated_at,
          completed_at: task.completed_at ?? null,
        }))

        await tasksTable.bulkPut([...migratedSubTasks, ...migratedTasksV2])
      })
    this.version(8).stores({
      subTasks: null,
      tasksV2: null,
    })
    this.version(9)
      .stores({
        tasks: 'id, parent_id, status, position, scheduled_date, recurrence_id',
        taskRecurrences: 'id',
        taskExceptions: 'id, recurrence_id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('tasks')
          .toCollection()
          .modify((task) => {
            task.description = ''
            task.duration_minutes = null
            task.icon = null
            task.color = null
            task.recurrence_id = null
            task.is_recurrence_root = false
            task.recurrence_exception = false
          })
      })
    this.version(10)
      .stores({
        listItems: 'id, list_id, position, checked',
        folders: 'id, position',
        tools: 'id, type, folder_id, position',
      })
      .upgrade(async (tx) => {
        await tx
          .table('listItems')
          .toCollection()
          .modify((item) => {
            item.checked = false
            item.section = null
          })

        const now = new Date().toISOString()
        const todoListId = migrationId()
        await tx.table('lists').add({ id: todoListId, name: 'To Do', created_at: now, updated_at: now })
        await tx.table('tools').add({
          id: migrationId(),
          type: 'liste',
          folder_id: null,
          list_id: todoListId,
          position: 0,
          created_at: now,
          updated_at: now,
        })
        await tx.table('tools').add({
          id: migrationId(),
          type: 'tableau_comptage',
          folder_id: null,
          list_id: null,
          position: 1,
          created_at: now,
          updated_at: now,
        })
      })
    this.version(11).stores({
      manualTestResults: 'id, test_id',
    })
    this.version(12)
      .stores({
        listItems: 'id, list_id, position, checked, category_id',
        listCategories: 'id, list_id, position',
      })
      .upgrade(async (tx) => {
        const now = new Date().toISOString()
        const items = await tx.table('listItems').toArray()
        const byList = new Map<string, typeof items>()
        for (const item of items) {
          const arr = byList.get(item.list_id) ?? []
          arr.push(item)
          byList.set(item.list_id, arr)
        }

        for (const [listId, listItems] of byList) {
          const categoryIdByName = new Map<string, string>()
          let position = 0
          for (const item of listItems) {
            const name = item.section ?? 'Général'
            if (!categoryIdByName.has(name)) {
              const id = migrationId()
              categoryIdByName.set(name, id)
              await tx.table('listCategories').add({ id, list_id: listId, name, position, created_at: now })
              position += 1
            }
          }

          const updated = listItems.map((item) => {
            const name = item.section ?? 'Général'
            const { section: _section, ...rest } = item
            return { ...rest, category_id: categoryIdByName.get(name)! }
          })
          await tx.table('listItems').bulkPut(updated)
        }
      })
    this.version(13)
      .stores({
        listItemSubTasks: 'id, list_item_id, position',
      })
      .upgrade(async (tx) => {
        await tx
          .table('listItems')
          .toCollection()
          .modify((item) => {
            item.description = ''
          })
      })
    this.version(14)
      .stores({})
      .upgrade(async (tx) => {
        await tx
          .table('tools')
          .toCollection()
          .modify((tool) => {
            tool.color = null
          })
      })
  }
}

export const db = new AppDatabase()
