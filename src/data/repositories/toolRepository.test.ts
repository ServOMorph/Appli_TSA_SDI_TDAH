import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { ToolRepository } from './toolRepository'
import type { Tool } from '@/domain/entities/tool'

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: '1',
    type: 'liste',
    folder_id: null,
    list_id: 'list-1',
    position: 0,
    created_at: '2026-08-06T00:00:00Z',
    updated_at: '2026-08-06T00:00:00Z',
    ...overrides,
  }
}

describe('ToolRepository', () => {
  let db: AppDatabase
  let repo: ToolRepository

  beforeEach(async () => {
    db = new AppDatabase('test-tool')
    repo = new ToolRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates and retrieves a tool', async () => {
    await repo.create(makeTool())
    const retrieved = await repo.getById('1')
    expect(retrieved?.type).toBe('liste')
  })

  it('retrieves only root tools (folder_id null)', async () => {
    await repo.create(makeTool({ id: '1', folder_id: null }))
    await repo.create(makeTool({ id: '2', folder_id: 'folder-1' }))
    const root = await repo.getRoot()
    expect(root.map((t) => t.id)).toEqual(['1'])
  })

  it('retrieves tools by folder id sorted by position', async () => {
    await repo.create(makeTool({ id: '1', folder_id: 'folder-1', position: 1 }))
    await repo.create(makeTool({ id: '2', folder_id: 'folder-1', position: 0 }))
    await repo.create(makeTool({ id: '3', folder_id: 'folder-2', position: 0 }))
    const tools = await repo.getByFolderId('folder-1')
    expect(tools.map((t) => t.id)).toEqual(['2', '1'])
  })

  it('updates a tool', async () => {
    await repo.create(makeTool())
    await repo.update({ ...makeTool(), position: 5 })
    const retrieved = await repo.getById('1')
    expect(retrieved?.position).toBe(5)
  })

  it('deletes a tool', async () => {
    await repo.create(makeTool())
    await repo.delete('1')
    expect(await repo.getById('1')).toBeUndefined()
  })
})
