import type { AppDatabase } from '@/data/db'
import type { TaskException } from '@/domain/entities/taskException'

export class TaskExceptionRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(exception: TaskException): Promise<string> {
    return this.db.taskExceptions.add(exception)
  }

  async delete(id: string): Promise<void> {
    await this.db.taskExceptions.delete(id)
  }

  /** Dates exclues de la (re)matérialisation pour une série donnée. */
  async getByRecurrence(recurrenceId: string): Promise<TaskException[]> {
    return this.db.taskExceptions.where('recurrence_id').equals(recurrenceId).toArray()
  }

  async isExcluded(recurrenceId: string, occurrenceDate: string): Promise<boolean> {
    const matches = await this.db.taskExceptions
      .where('recurrence_id')
      .equals(recurrenceId)
      .toArray()
    return matches.some((exception) => exception.occurrence_date === occurrenceDate)
  }
}
