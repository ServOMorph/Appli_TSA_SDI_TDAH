import type { AppDatabase } from '@/data/db'
import type { ListCategory } from '@/domain/entities/listCategory'

export class ListCategoryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(category: ListCategory): Promise<string> {
    return this.db.listCategories.add(category)
  }

  async getById(id: string): Promise<ListCategory | undefined> {
    return this.db.listCategories.get(id)
  }

  async getByListId(listId: string): Promise<ListCategory[]> {
    return this.db.listCategories.where('list_id').equals(listId).sortBy('position')
  }

  async update(category: ListCategory): Promise<void> {
    await this.db.listCategories.put(category)
  }

  async delete(id: string): Promise<void> {
    await this.db.listCategories.delete(id)
  }
}
