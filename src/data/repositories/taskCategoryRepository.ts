import type { AppDatabase } from '@/data/db'
import type { TaskCategory } from '@/domain/entities/taskCategory'

export class TaskCategoryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(category: TaskCategory): Promise<string> {
    return this.db.taskCategories.add(category)
  }

  async getById(id: string): Promise<TaskCategory | undefined> {
    return this.db.taskCategories.get(id)
  }

  async getAll(): Promise<TaskCategory[]> {
    return this.db.taskCategories.toCollection().sortBy('position')
  }

  async update(category: TaskCategory): Promise<void> {
    await this.db.taskCategories.put(category)
  }

  async delete(id: string): Promise<void> {
    await this.db.taskCategories.delete(id)
  }
}
