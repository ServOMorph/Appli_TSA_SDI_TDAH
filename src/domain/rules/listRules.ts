import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'

export function createList(id: string, name: string, now: string): List {
  return { id, name, created_at: now, updated_at: now }
}

export function createListItem(
  id: string,
  listId: string,
  title: string,
  position: number,
  now: string,
): ListItem {
  return { id, list_id: listId, title, position, created_at: now }
}
