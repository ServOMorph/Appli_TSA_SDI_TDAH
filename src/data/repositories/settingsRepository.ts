import type { AppDatabase } from '@/data/db'
import type { Settings } from '@/domain/entities/settings'

export class SettingsRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(settings: Settings): Promise<string> {
    return this.db.settings.add(settings)
  }

  async getById(id: string): Promise<Settings | undefined> {
    return this.db.settings.get(id)
  }

  async update(settings: Settings): Promise<void> {
    await this.db.settings.put(settings)
  }

  async delete(id: string): Promise<void> {
    await this.db.settings.delete(id)
  }

  async getByUserId(userId: string): Promise<Settings | undefined> {
    return this.db.settings.where('user_id').equals(userId).first()
  }
}
