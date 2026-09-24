import type { AppDatabase } from '@/data/db'
import type { RoutineStep } from '@/domain/entities/routineStep'

export class RoutineStepRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(step: RoutineStep): Promise<string> {
    return this.db.routineSteps.add(step)
  }

  async getById(id: string): Promise<RoutineStep | undefined> {
    return this.db.routineSteps.get(id)
  }

  async getByRoutineId(routineId: string): Promise<RoutineStep[]> {
    return this.db.routineSteps.where('routine_id').equals(routineId).sortBy('position')
  }

  async update(step: RoutineStep): Promise<void> {
    await this.db.routineSteps.put(step)
  }

  async delete(id: string): Promise<void> {
    await this.db.routineSteps.delete(id)
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.db.routineSteps.bulkDelete(ids)
  }

  async reorder(ids: string[]): Promise<void> {
    const steps = await Promise.all(ids.map((id) => this.db.routineSteps.get(id)))
    const filtered = steps.filter((s): s is RoutineStep => s !== undefined)

    const updated = filtered.map((step, index) => ({
      ...step,
      position: index,
      updated_at: new Date().toISOString(),
    }))

    for (const step of updated) {
      await this.db.routineSteps.put(step)
    }
  }
}
