import type { AppDatabase } from '@/data/db'
import type { Task, TaskStatus } from '@/domain/entities/task'

function isRoot(task: Task): boolean {
  return task.parent_id === null || task.parent_id === undefined
}

export class TaskRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(task: Task): Promise<string> {
    return this.db.tasks.add(task)
  }

  async getById(id: string): Promise<Task | undefined> {
    return this.db.tasks.get(id)
  }

  async update(task: Task): Promise<void> {
    await this.db.tasks.put(task)
  }

  async delete(id: string): Promise<void> {
    await this.db.tasks.delete(id)
  }

  /** Supprime une tâche et toutes ses sous-étapes. */
  async deleteWithChildren(id: string): Promise<void> {
    const children = await this.db.tasks.where('parent_id').equals(id).primaryKeys()
    await this.db.tasks.bulkDelete([...children, id])
  }

  /** Tâches principales d'un statut donné, sous-étapes exclues. */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const tasks = await this.db.tasks.where('status').equals(status).toArray()
    return tasks.filter(isRoot)
  }

  async getTodayTasks(): Promise<Task[]> {
    const today = new Date().toISOString().slice(0, 10)
    const [activeTasks, completedTasks] = await Promise.all([
      this.db.tasks.where('status').equals('today').toArray(),
      this.db.tasks.where('status').equals('completed').toArray(),
    ])
    return [
      ...activeTasks.filter(isRoot),
      ...completedTasks.filter((task) => isRoot(task) && task.completed_at?.slice(0, 10) === today),
    ].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'completed' ? 1 : -1
      return a.position - b.position
    })
  }

  /** Sous-étapes d'une tâche, triées par position. */
  async getChildren(parentId: string): Promise<Task[]> {
    return this.db.tasks.where('parent_id').equals(parentId).sortBy('position')
  }

  /** Tâches principales planifiées à une date, triées par position. */
  async getRootByDate(date: string): Promise<Task[]> {
    const tasks = await this.db.tasks.where('scheduled_date').equals(date).sortBy('position')
    return tasks.filter(isRoot)
  }

  /** Sous-étapes planifiées à une date. */
  async getChildrenByDate(date: string): Promise<Task[]> {
    const tasks = await this.db.tasks.where('scheduled_date').equals(date).toArray()
    return tasks.filter((task) => !isRoot(task))
  }

  async getEssentialTasks(): Promise<Task[]> {
    const tasks = await this.db.tasks.toArray()
    return tasks.filter((task) => task.essential)
  }

  /** Toutes les occurrences d'une série récurrente (racine incluse). */
  async getByRecurrenceId(recurrenceId: string): Promise<Task[]> {
    const tasks = await this.db.tasks.where('recurrence_id').equals(recurrenceId).toArray()
    return tasks.filter(isRoot)
  }

  async reorder(ids: string[]): Promise<void> {
    const tasks = await Promise.all(ids.map((id) => this.db.tasks.get(id)))
    const filtered = tasks.filter((t): t is Task => t !== undefined)

    const updated = filtered.map((task, index) => ({
      ...task,
      position: index,
      updated_at: new Date().toISOString(),
    }))

    for (const task of updated) {
      await this.db.tasks.put(task)
    }
  }
}
