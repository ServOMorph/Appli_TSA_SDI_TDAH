import type { AppDatabase } from '@/data/db'
import type { TaskV2, TaskStatusV2 } from '@/domain/entities/taskV2'
import { encrypt, decrypt } from '@/crypto/crypto'

export class TaskV2Repository {
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

  async create(task: TaskV2): Promise<string> {
    const encrypted = {
      ...task,
      title: await this.encryptTitle(task.title),
    }
    return this.db.tasksV2.add(encrypted)
  }

  async getById(id: string): Promise<TaskV2 | undefined> {
    const task = await this.db.tasksV2.get(id)
    if (!task) return undefined
    return {
      ...task,
      title: await this.decryptTitle(task.title),
    }
  }

  async update(task: TaskV2): Promise<void> {
    const encrypted = {
      ...task,
      title: await this.encryptTitle(task.title),
    }
    await this.db.tasksV2.put(encrypted)
  }

  async delete(id: string): Promise<void> {
    await this.db.tasksV2.delete(id)
  }

  async getByStatus(status: TaskStatusV2): Promise<TaskV2[]> {
    const tasks = await this.db.tasksV2.where('status').equals(status).toArray()
    return Promise.all(
      tasks.map(async (task) => ({
        ...task,
        title: await this.decryptTitle(task.title),
      })),
    )
  }

  async getByDate(date: string): Promise<TaskV2[]> {
    const tasks = await this.db.tasksV2.where('scheduled_date').equals(date).sortBy('position')
    return Promise.all(
      tasks.map(async (task) => ({
        ...task,
        title: await this.decryptTitle(task.title),
      })),
    )
  }

  async getTodoTasks(): Promise<TaskV2[]> {
    return this.getByStatus('todo')
  }

  async getPlannedTasks(): Promise<TaskV2[]> {
    return this.getByStatus('planned')
  }

  async getToPlantasks(): Promise<TaskV2[]> {
    return this.getByStatus('to_plan')
  }

  async getEssentialTasks(): Promise<TaskV2[]> {
    const tasks = await this.db.tasksV2.toArray()
    const essential = tasks.filter((t) => t.essential)
    return Promise.all(
      essential.map(async (task) => ({
        ...task,
        title: await this.decryptTitle(task.title),
      })),
    )
  }

  async reorder(ids: string[]): Promise<void> {
    const tasks = await Promise.all(ids.map((id) => this.db.tasksV2.get(id)))
    const filtered = tasks.filter((t): t is TaskV2 => t !== undefined)

    const updated = filtered.map((task, index) => ({
      ...task,
      position: index,
      updated_at: new Date().toISOString(),
    }))

    for (const task of updated) {
      await this.update(task)
    }
  }
}
