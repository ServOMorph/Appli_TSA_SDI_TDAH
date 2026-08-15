import type { ListItem } from '@/domain/entities/listItem'
import type { ListCategory } from '@/domain/entities/listCategory'

export interface ListItemGroup {
  category: ListCategory
  items: ListItem[]
}

function byPosition(a: { position: number }, b: { position: number }): number {
  return a.position - b.position
}

/** Cochés relégués sous les non cochés, à position égale par groupe (référence : Rappels iOS). */
export function sortListItems(items: ListItem[]): ListItem[] {
  const unchecked = items.filter((i) => !i.checked).sort(byPosition)
  const checked = items.filter((i) => i.checked).sort(byPosition)
  return [...unchecked, ...checked]
}

/** Groupe les items par catégorie, dans l'ordre de position des catégories. */
export function groupListItemsByCategory(items: ListItem[], categories: ListCategory[]): ListItemGroup[] {
  const sortedCategories = [...categories].sort(byPosition)
  return sortedCategories.map((category) => ({
    category,
    items: sortListItems(items.filter((item) => item.category_id === category.id)),
  }))
}
