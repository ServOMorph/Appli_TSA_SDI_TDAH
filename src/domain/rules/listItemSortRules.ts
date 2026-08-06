import type { ListItem } from '@/domain/entities/listItem'

export interface ListItemSection {
  section: string | null
  items: ListItem[]
}

function byPosition(a: ListItem, b: ListItem): number {
  return a.position - b.position
}

/** Cochés relégués sous les non cochés, à position égale par groupe (référence : Rappels iOS). */
export function sortListItems(items: ListItem[]): ListItem[] {
  const unchecked = items.filter((i) => !i.checked).sort(byPosition)
  const checked = items.filter((i) => i.checked).sort(byPosition)
  return [...unchecked, ...checked]
}

/** Groupe par rubrique dans l'ordre de première apparition ; les items sans rubrique (`null`) forment le dernier groupe. */
export function groupListItemsBySection(items: ListItem[]): ListItemSection[] {
  const order: (string | null)[] = []
  const byKey = new Map<string | null, ListItem[]>()

  for (const item of items) {
    const key = item.section
    if (!byKey.has(key)) {
      byKey.set(key, [])
      order.push(key)
    }
    byKey.get(key)!.push(item)
  }

  const sortedOrder = [...order].sort((a, b) => {
    if (a === null) return 1
    if (b === null) return -1
    return 0
  })

  return sortedOrder.map((key) => ({ section: key, items: sortListItems(byKey.get(key)!) }))
}
