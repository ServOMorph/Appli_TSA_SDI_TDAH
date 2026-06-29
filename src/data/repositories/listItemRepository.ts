import type { AppDatabase } from '@/data/db'
import type { ListItem } from '@/domain/entities/listItem'
import { encrypt, decrypt } from '@/crypto/crypto'

export class ListItemRepository {
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

  async create(item: ListItem): Promise<string> {
    const encrypted = {
      ...item,
      title: await this.encryptTitle(item.title),
    }
    return this.db.listItems.add(encrypted)
  }

  async getById(id: string): Promise<ListItem | undefined> {
    const item = await this.db.listItems.get(id)
    if (!item) return undefined
    return {
      ...item,
      title: await this.decryptTitle(item.title),
    }
  }

  async getByListId(listId: string): Promise<ListItem[]> {
    const items = await this.db.listItems.where('list_id').equals(listId).sortBy('position')
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        title: await this.decryptTitle(item.title),
      })),
    )
  }

  async update(item: ListItem): Promise<void> {
    const encrypted = {
      ...item,
      title: await this.encryptTitle(item.title),
    }
    await this.db.listItems.put(encrypted)
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
