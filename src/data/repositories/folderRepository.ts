import type { AppDatabase } from '@/data/db'
import type { Folder } from '@/domain/entities/folder'

export class FolderRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(folder: Folder): Promise<string> {
    return this.db.folders.add(folder)
  }

  async getById(id: string): Promise<Folder | undefined> {
    return this.db.folders.get(id)
  }

  async getAll(): Promise<Folder[]> {
    return this.db.folders.toCollection().sortBy('position')
  }

  async update(folder: Folder): Promise<void> {
    await this.db.folders.put(folder)
  }

  async delete(id: string): Promise<void> {
    await this.db.folders.delete(id)
  }
}
