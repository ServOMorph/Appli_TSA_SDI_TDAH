import type { AppDatabase } from '@/data/db'
import type { SubTask } from '@/domain/entities/subTask'
import { encrypt, decrypt } from '@/crypto/crypto'

export class SubTaskRepository {
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

  async create(subTask: SubTask): Promise<string> {
    const encrypted = {
      ...subTask,
      title: await this.encryptTitle(subTask.title),
    }
    return this.db.subTasks.add(encrypted)
  }

  async getById(id: string): Promise<SubTask | undefined> {
    const subTask = await this.db.subTasks.get(id)
    if (!subTask) return undefined
    return {
      ...subTask,
      title: await this.decryptTitle(subTask.title),
    }
  }

  async update(subTask: SubTask): Promise<void> {
    const encrypted = {
      ...subTask,
      title: await this.encryptTitle(subTask.title),
    }
    await this.db.subTasks.put(encrypted)
  }

  async delete(id: string): Promise<void> {
    await this.db.subTasks.delete(id)
  }

  async getByTaskId(taskId: string): Promise<SubTask[]> {
    const subTasks = await this.db.subTasks.where('task_id').equals(taskId).sortBy('position')
    return Promise.all(
      subTasks.map(async (st) => ({
        ...st,
        title: await this.decryptTitle(st.title),
      })),
    )
  }

  async reorder(ids: string[]): Promise<void> {
    const subTasks = await Promise.all(ids.map((id) => this.db.subTasks.get(id)))
    const filtered = subTasks.filter((st): st is SubTask => st !== undefined)
    for (const [index, st] of filtered.entries()) {
      await this.db.subTasks.put({ ...st, position: index })
    }
  }
}
