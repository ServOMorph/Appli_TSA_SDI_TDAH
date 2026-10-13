import type { Folder } from '@/domain/entities/folder'

export function createFolder(id: string, name: string, position: number, now: string, parentId: string | null = null): Folder {
  return { id, name, parent_id: parentId, position, created_at: now, updated_at: now }
}

export function getChildFolders(folders: Folder[], parentId: string | null): Folder[] {
  return folders.filter((f) => (f.parent_id ?? null) === parentId)
}

export function getDescendantFolderIds(folders: Folder[], folderId: string): string[] {
  const result: string[] = []
  const queue = [folderId]
  while (queue.length > 0) {
    const current = queue.shift() as string
    for (const child of folders) {
      if (child.parent_id === current && !result.includes(child.id)) {
        result.push(child.id)
        queue.push(child.id)
      }
    }
  }
  return result
}

export function canMoveFolder(folders: Folder[], folderId: string, targetParentId: string | null): boolean {
  const folder = folders.find((f) => f.id === folderId)
  if (!folder) return false
  if ((folder.parent_id ?? null) === targetParentId) return false
  if (targetParentId === null) return true
  if (targetParentId === folderId) return false
  if (!folders.some((f) => f.id === targetParentId)) return false
  return !getDescendantFolderIds(folders, folderId).includes(targetParentId)
}
