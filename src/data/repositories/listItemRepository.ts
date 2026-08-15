import type { AppDatabase } from '@/data/db'
import type { ListItem } from '@/domain/entities/listItem'

export class ListItemRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(item: ListItem): Promise<string> {
    return this.db.listItems.add(item)
  }

  async getById(id: string): Promise<ListItem | undefined> {
    return this.db.listItems.get(id)
  }

  async getByListId(listId: string): Promise<ListItem[]> {
    return this.db.listItems.where('list_id').equals(listId).sortBy('position')
  }

  async getByCategoryId(categoryId: string): Promise<ListItem[]> {
    return this.db.listItems.where('category_id').equals(categoryId).sortBy('position')
  }

  async update(item: ListItem): Promise<void> {
    await this.db.listItems.put(item)
  }

  async delete(id: string): Promise<void> {
    await this.db.listItems.delete(id)
  }

  async reorder(ids: string[]): Promise<void> {
    const items = await Promise.all(ids.map((id) => this.db.listItems.get(id)))
    const filtered = items.filter((i): i is ListItem => i !== undefined)

    const updated = filtered.map((item, index) => ({
      ...item,
      position: index,
    }))

    for (const item of updated) {
      await this.update(item)
    }
  }
}
