import type { Tool, ToolType } from '@/domain/entities/tool'

export function createTool(
  id: string,
  type: ToolType,
  folderId: string | null,
  listId: string | null,
  position: number,
  now: string,
): Tool {
  return { id, type, folder_id: folderId, list_id: listId, position, created_at: now, updated_at: now }
}
