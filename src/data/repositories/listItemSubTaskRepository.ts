import type { AppDatabase } from '@/data/db'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'

export class ListItemSubTaskRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(subTask: ListItemSubTask): Promise<string> {
    return this.db.listItemSubTasks.add(subTask)
  }

  async getById(id: string): Promise<ListItemSubTask | undefined> {
    return this.db.listItemSubTasks.get(id)
  }

  async getByListItemId(listItemId: string): Promise<ListItemSubTask[]> {
    return this.db.listItemSubTasks.where('list_item_id').equals(listItemId).sortBy('position')
  }

  async update(subTask: ListItemSubTask): Promise<void> {
    await this.db.listItemSubTasks.put(subTask)
  }

  async delete(id: string): Promise<void> {
    await this.db.listItemSubTasks.delete(id)
  }
}
