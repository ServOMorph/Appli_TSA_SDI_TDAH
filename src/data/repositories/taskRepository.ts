import type { AppDatabase } from '@/data/db'
import type { Task } from '@/domain/entities/task'
import type { TaskStatus } from '@/domain/entities/task'
import { encrypt, decrypt } from '@/crypto/crypto'

export class TaskRepository {
  constructor(
    private db: AppDatabase,
    private password?: string,
  ) {}

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

  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const tasks = await this.db.tasks.where('status').equals(status).toArray()
    return Promise.all(
      tasks.map(async (task) => ({
        ...task,
        title: await this.decryptTitle(task.title),
      })),
    )
  }

  async getTodayTasks(): Promise<Task[]> {
    return this.getByStatus('today')
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
      await this.update(task)
    }
  }
}
