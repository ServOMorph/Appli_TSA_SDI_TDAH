import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { User } from '@/domain/entities/user'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'
import type { TaskV2 } from '@/domain/entities/taskV2'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { Routine } from '@/domain/entities/routine'
import type { RoutineStep } from '@/domain/entities/routineStep'
import type { EnergyEntry } from '@/domain/entities/energyEntry'
import type { Settings } from '@/domain/entities/settings'

export class AppDatabase extends Dexie {
  users!: Table<User>
  tasks!: Table<Task>
  subTasks!: Table<SubTask>
  tasksV2!: Table<TaskV2>
  lists!: Table<List>
  listItems!: Table<ListItem>
  routines!: Table<Routine>
  routineSteps!: Table<RoutineStep>
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
    this.version(2).stores({
      users: 'id',
      tasks: 'id, status, position',
      subTasks: 'id, task_id, position',
      tasksV2: 'id, status, position, scheduled_date, essential',
      lists: 'id',
      listItems: 'id, list_id, position',
      routines: 'id, type',
      routineSteps: 'id, routine_id, position',
      energyEntries: 'id, entry_date',
      settings: 'id, user_id',
    })
  }
}

export const db = new AppDatabase()
