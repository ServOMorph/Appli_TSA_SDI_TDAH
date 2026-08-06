import type { AppDatabase } from '@/data/db'
import type { Tool } from '@/domain/entities/tool'

export class ToolRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) { this.db = db }

  async create(tool: Tool): Promise<string> {
    return this.db.tools.add(tool)
  }

  async getById(id: string): Promise<Tool | undefined> {
    return this.db.tools.get(id)
  }

  async getAll(): Promise<Tool[]> {
    return this.db.tools.toCollection().sortBy('position')
  }

  async getByFolderId(folderId: string): Promise<Tool[]> {
    const tools = await this.db.tools.where('folder_id').equals(folderId).toArray()
    return tools.sort((a, b) => a.position - b.position)
  }

  async getRoot(): Promise<Tool[]> {
    const all = await this.getAll()
    return all.filter((tool) => tool.folder_id === null)
  }

  async update(tool: Tool): Promise<void> {
    await this.db.tools.put(tool)
  }

  async delete(id: string): Promise<void> {
    await this.db.tools.delete(id)
  }
}
