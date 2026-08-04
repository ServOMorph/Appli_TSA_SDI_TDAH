import type { AppDatabase } from '@/data/db'
import type { EnergyEntry } from '@/domain/entities/energyEntry'

export class EnergyEntryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(entry: EnergyEntry): Promise<string> {
    return this.db.energyEntries.add(entry)
  }

  async getById(id: string): Promise<EnergyEntry | undefined> {
    return this.db.energyEntries.get(id)
  }

  async update(entry: EnergyEntry): Promise<void> {
    await this.db.energyEntries.put(entry)
  }

  async delete(id: string): Promise<void> {
    await this.db.energyEntries.delete(id)
  }

  async getByDate(date: string): Promise<EnergyEntry | undefined> {
    return this.db.energyEntries.where('entry_date').equals(date).first()
  }

  async getLatestFilled(): Promise<EnergyEntry | undefined> {
    const entries = await this.db.energyEntries.toArray()
    const filled = entries
      .filter((e) => e.status === 'filled')
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date))

    return filled[0]
  }
}
