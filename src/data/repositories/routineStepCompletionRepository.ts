import type { AppDatabase } from '@/data/db'
import type { RoutineStepCompletion } from '@/domain/entities/routineStepCompletion'

export class RoutineStepCompletionRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(completion: RoutineStepCompletion): Promise<string> {
    return this.db.routineStepCompletions.add(completion)
  }

  async getByRoutineAndDate(routineId: string, date: string): Promise<RoutineStepCompletion[]> {
    const all = await this.db.routineStepCompletions.where('routine_id').equals(routineId).toArray()
    return all.filter((c) => c.date === date)
  }

  async getByRoutineId(routineId: string): Promise<RoutineStepCompletion[]> {
    return this.db.routineStepCompletions.where('routine_id').equals(routineId).toArray()
  }

  async delete(id: string): Promise<void> {
    await this.db.routineStepCompletions.delete(id)
  }

  async deleteByRoutineId(routineId: string): Promise<void> {
    await this.db.routineStepCompletions.where('routine_id').equals(routineId).delete()
  }

  async deleteByStepIds(stepIds: string[]): Promise<void> {
    if (!stepIds.length) return
    await this.db.routineStepCompletions.where('routine_step_id').anyOf(stepIds).delete()
  }
}
