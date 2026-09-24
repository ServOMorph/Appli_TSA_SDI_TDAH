import type { AppDatabase } from '@/data/db'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'

export class RoutineScheduleRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(schedule: RoutineSchedule): Promise<string> {
    return this.db.routineSchedules.add(schedule)
  }

  async getById(id: string): Promise<RoutineSchedule | undefined> {
    return this.db.routineSchedules.get(id)
  }

  async getByRoutineId(routineId: string): Promise<RoutineSchedule[]> {
    return this.db.routineSchedules.where('routine_id').equals(routineId).sortBy('weekday')
  }

  async getByWeekday(weekday: number): Promise<RoutineSchedule[]> {
    return this.db.routineSchedules.where('weekday').equals(weekday).toArray()
  }

  async update(schedule: RoutineSchedule): Promise<void> {
    await this.db.routineSchedules.put(schedule)
  }

  async delete(id: string): Promise<void> {
    await this.db.routineSchedules.delete(id)
  }
}
