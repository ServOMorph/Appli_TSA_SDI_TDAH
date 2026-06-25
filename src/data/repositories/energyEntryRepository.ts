import type { AppDatabase } from '@/data/db'
import type { EnergyEntry } from '@/domain/entities/energyEntry'
import { encrypt, decrypt } from '@/crypto/crypto'

interface StoredEnergyEntry {
  id: string
  value: string | null
  status: 'filled' | 'skipped'
  entry_date: string
}

export class EnergyEntryRepository {
  private db: AppDatabase
  private password?: string
  constructor(db: AppDatabase, password?: string) { this.db = db; this.password = password }

  private async encryptValue(value: number | null): Promise<string | null> {
    if (value === null) return null
    if (!this.password) return String(value)
    return encrypt(String(value), this.password)
  }

  private async decryptValue(encrypted: string | null): Promise<number | null> {
    if (encrypted === null || encrypted === '') return null
    if (!this.password) return parseInt(encrypted, 10)
    try {
      const decrypted = await decrypt(encrypted, this.password)
      return parseInt(decrypted, 10)
    } catch {
      return null
    }
  }

  async create(entry: EnergyEntry): Promise<string> {
    const stored: StoredEnergyEntry = {
      id: entry.id,
      value: await this.encryptValue(entry.value),
      status: entry.status,
      entry_date: entry.entry_date,
    }
    return this.db.energyEntries.add(stored as unknown as EnergyEntry)
  }

  async getById(id: string): Promise<EnergyEntry | undefined> {
    const entry = await this.db.energyEntries.get(id)
    if (!entry) return undefined

    const stored = entry as unknown as StoredEnergyEntry
    return {
      id: stored.id,
      value: await this.decryptValue(stored.value),
      status: stored.status,
      entry_date: stored.entry_date,
    }
  }

  async update(entry: EnergyEntry): Promise<void> {
    const stored: StoredEnergyEntry = {
      id: entry.id,
      value: await this.encryptValue(entry.value),
      status: entry.status,
      entry_date: entry.entry_date,
    }
    await this.db.energyEntries.put(stored as unknown as EnergyEntry)
  }

  async delete(id: string): Promise<void> {
    await this.db.energyEntries.delete(id)
  }

  async getByDate(date: string): Promise<EnergyEntry | undefined> {
    const entry = await this.db.energyEntries.where('entry_date').equals(date).first()
    if (!entry) return undefined

    const stored = entry as unknown as StoredEnergyEntry
    return {
      id: stored.id,
      value: await this.decryptValue(stored.value),
      status: stored.status,
      entry_date: stored.entry_date,
    }
  }

  async getLatestFilled(): Promise<EnergyEntry | undefined> {
    const entries = await this.db.energyEntries.toArray()
    const filled = entries
      .filter((e) => e.status === 'filled')
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date))

    if (filled.length === 0) return undefined

    const latest = filled[0] as unknown as StoredEnergyEntry
    return {
      id: latest.id,
      value: await this.decryptValue(latest.value),
      status: latest.status,
      entry_date: latest.entry_date,
    }
  }
}
