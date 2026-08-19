import type { Tool, ToolType } from '@/domain/entities/tool'

export function createTool(
  id: string,
  type: ToolType,
  folderId: string | null,
  listId: string | null,
  position: number,
  now: string,
  color: string | null = null,
): Tool {
  return { id, type, folder_id: folderId, list_id: listId, position, color, created_at: now, updated_at: now }
}
