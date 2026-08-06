import type { Folder } from '@/domain/entities/folder'

export function createFolder(id: string, name: string, position: number, now: string): Folder {
  return { id, name, position, created_at: now, updated_at: now }
}
