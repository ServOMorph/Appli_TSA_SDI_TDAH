import type { AppDatabase } from '@/data/db'
import type { RoutineStep } from '@/domain/entities/routineStep'
import { encrypt, decrypt } from '@/crypto/crypto'

export class RoutineStepRepository {
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

  async create(step: RoutineStep): Promise<string> {
    const encrypted = {
      ...step,
      title: await this.encryptTitle(step.title),
    }
    return this.db.routineSteps.add(encrypted)
  }

  async getById(id: string): Promise<RoutineStep | undefined> {
    const step = await this.db.routineSteps.get(id)
    if (!step) return undefined
    return {
      ...step,
      title: await this.decryptTitle(step.title),
    }
  }

  async getByRoutineId(routineId: string): Promise<RoutineStep[]> {
    const steps = await this.db.routineSteps.where('routine_id').equals(routineId).sortBy('position')
    return Promise.all(
      steps.map(async (step) => ({
        ...step,
        title: await this.decryptTitle(step.title),
      })),
    )
  }

  async update(step: RoutineStep): Promise<void> {
    const encrypted = {
      ...step,
      title: await this.encryptTitle(step.title),
    }
    await this.db.routineSteps.put(encrypted)
  }

  async delete(id: string): Promise<void> {
    await this.db.routineSteps.delete(id)
  }

  async reorder(ids: string[]): Promise<void> {
    const steps = await Promise.all(ids.map((id) => this.db.routineSteps.get(id)))
    const filtered = steps.filter((s): s is RoutineStep => s !== undefined)

    const updated = filtered.map((step, index) => ({
      ...step,
      position: index,
    }))

    for (const step of updated) {
      await this.update(step)
    }
  }
}
