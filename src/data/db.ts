import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { User } from '@/domain/entities/user'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'
import type { TaskV2 } from '@/domain/entities/taskV2'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { EnergyEntry } from '@/domain/entities/energyEntry'
import type { Settings } from '@/domain/entities/settings'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'

export class AppDatabase extends Dexie {
  users!: Table<User>
  tasks!: Table<Task>
  subTasks!: Table<SubTask>
  tasksV2!: Table<TaskV2>
  lists!: Table<List>
  listItems!: Table<ListItem>
  energyEntries!: Table<EnergyEntry>
  settings!: Table<Settings>
  budgetCategories!: Table<BudgetCategory>
  budgetEntries!: Table<BudgetEntry>
  budgetAccounts!: Table<BudgetAccount>
  budgetDeposits!: Table<BudgetDeposit>

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
  }
}

export const db = new AppDatabase()
