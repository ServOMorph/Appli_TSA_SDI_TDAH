import type { AppDatabase } from '@/data/db'
import type { List } from '@/domain/entities/list'

export class ListRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(list: List): Promise<string> {
    return this.db.lists.add(list)
  }

  async getById(id: string): Promise<List | undefined> {
    return this.db.lists.get(id)
  }

  async getAll(): Promise<List[]> {
    return this.db.lists.toArray()
  }

  async update(list: List): Promise<void> {
    await this.db.lists.put(list)
  }

  async delete(id: string): Promise<void> {
    await this.db.lists.delete(id)
  }
}
