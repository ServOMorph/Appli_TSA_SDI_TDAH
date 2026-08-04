import type { AppDatabase } from '@/data/db'
import type { TaskRecurrence } from '@/domain/entities/taskRecurrence'

export class TaskRecurrenceRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(recurrence: TaskRecurrence): Promise<string> {
    return this.db.taskRecurrences.add(recurrence)
  }

  async getById(id: string): Promise<TaskRecurrence | undefined> {
    return this.db.taskRecurrences.get(id)
  }

  async update(recurrence: TaskRecurrence): Promise<void> {
    await this.db.taskRecurrences.put(recurrence)
  }

  async delete(id: string): Promise<void> {
    await this.db.taskRecurrences.delete(id)
  }
}
