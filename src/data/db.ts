import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { User } from '@/domain/entities/user'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'
import type { EnergyEntry } from '@/domain/entities/energyEntry'
import type { Settings } from '@/domain/entities/settings'

export class AppDatabase extends Dexie {
  users!: Table<User>
  tasks!: Table<Task>
  subTasks!: Table<SubTask>
  energyEntries!: Table<EnergyEntry>
  settings!: Table<Settings>

  constructor(name = 'appli-tsa-sdi-tdah') {
    super(name)
    this.version(1).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
  }
}

export const db = new AppDatabase()
