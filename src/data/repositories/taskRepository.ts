import type { AppDatabase } from '@/data/db'
import type { Task, TaskStatus } from '@/domain/entities/task'
import { encrypt, decrypt } from '@/crypto/crypto'

function isRoot(task: Task): boolean {
  return task.parent_id === null || task.parent_id === undefined
}

export class TaskRepository {
  private db: AppDatabase
  private password?: string
  constructor(db: AppDatabase, password?: string) { this.db = db; this.password = password }

  private async encryptTitle(title: string): Promise<string> {
    if (!this.password) return title
    return encrypt(title, this.password)
  }

  private async decryptTitle(title: string): Promise<string> {
    if (!this.password) return title
    try {
      return await decrypt(title, this.password)
    } catch {
      return title
    }
  }

  private async decryptAll(tasks: Task[]): Promise<Task[]> {
    return Promise.all(
      tasks.map(async (task) => ({
        ...task,
        title: await this.decryptTitle(task.title),
      })),
    )
  }

  async create(task: Task): Promise<string> {
    const encrypted = {
      ...task,
      title: await this.encryptTitle(task.title),
    }
    return this.db.tasks.add(encrypted)
  }

  async getById(id: string): Promise<Task | undefined> {
    const task = await this.db.tasks.get(id)
    if (!task) return undefined
    return {
      ...task,
      title: await this.decryptTitle(task.title),
    }
  }

  async update(task: Task): Promise<void> {
    const encrypted = {
      ...task,
      title: await this.encryptTitle(task.title),
    }
    await this.db.tasks.put(encrypted)
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
    return this.decryptAll(tasks.filter(isRoot))
  }

  async getTodayTasks(): Promise<Task[]> {
    const today = new Date().toISOString().slice(0, 10)
    const [activeTasks, completedTasks] = await Promise.all([
      this.db.tasks.where('status').equals('today').toArray(),
      this.db.tasks.where('status').equals('completed').toArray(),
    ])
    const tasks = [
      ...activeTasks.filter(isRoot),
      ...completedTasks.filter((task) => isRoot(task) && task.completed_at?.slice(0, 10) === today),
    ].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'completed' ? 1 : -1
      return a.position - b.position
    })
    return this.decryptAll(tasks)
  }

  /** Sous-étapes d'une tâche, triées par position. */
  async getChildren(parentId: string): Promise<Task[]> {
    const children = await this.db.tasks.where('parent_id').equals(parentId).sortBy('position')
    return this.decryptAll(children)
  }

  /** Tâches principales planifiées à une date, triées par position. */
  async getRootByDate(date: string): Promise<Task[]> {
    const tasks = await this.db.tasks.where('scheduled_date').equals(date).sortBy('position')
    return this.decryptAll(tasks.filter(isRoot))
  }

  /** Sous-étapes planifiées à une date. */
  async getChildrenByDate(date: string): Promise<Task[]> {
    const tasks = await this.db.tasks.where('scheduled_date').equals(date).toArray()
    return this.decryptAll(tasks.filter((task) => !isRoot(task)))
  }

  async getEssentialTasks(): Promise<Task[]> {
    const tasks = await this.db.tasks.toArray()
    return this.decryptAll(tasks.filter((task) => task.essential))
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
