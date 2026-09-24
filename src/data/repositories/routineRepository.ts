import type { AppDatabase } from '@/data/db'
import type { Routine } from '@/domain/entities/routine'

export class RoutineRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(routine: Routine): Promise<string> {
    return this.db.routines.add(routine)
  }

  async getById(id: string): Promise<Routine | undefined> {
    return this.db.routines.get(id)
  }

  async getAll(): Promise<Routine[]> {
    return this.db.routines.toArray()
  }

  async update(routine: Routine): Promise<void> {
    await this.db.routines.put(routine)
  }

  async delete(id: string): Promise<void> {
    await this.db.routines.delete(id)
  }
}
