import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListCategory } from '@/domain/entities/listCategory'

export function createList(id: string, name: string, now: string): List {
  return { id, name, created_at: now, updated_at: now }
}

export function createListCategory(
  id: string,
  listId: string,
  name: string,
  position: number,
  now: string,
): ListCategory {
  return { id, list_id: listId, name, position, created_at: now }
}

export function createListItem(
  id: string,
  listId: string,
  title: string,
  position: number,
  now: string,
  categoryId: string,
): ListItem {
  return { id, list_id: listId, title, position, checked: false, category_id: categoryId, created_at: now }
}

export function toggleListItemChecked(item: ListItem): ListItem {
  return { ...item, checked: !item.checked }
}
