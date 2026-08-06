import { describe, it, expect } from 'vitest'
import { groupListItemsBySection, sortListItems } from './listItemSortRules'
import type { ListItem } from '@/domain/entities/listItem'

function makeItem(overrides: Partial<ListItem> = {}): ListItem {
  return {
    id: 'i1',
    list_id: 'list-1',
    title: 'Item',
    position: 0,
    checked: false,
    section: null,
    created_at: '2026-08-06T00:00:00.000Z',
    ...overrides,
  }
}

describe('sortListItems', () => {
  it('place les items cochés sous les non cochés', () => {
    const items = [
      makeItem({ id: 'a', checked: true, position: 0 }),
      makeItem({ id: 'b', checked: false, position: 1 }),
    ]
    const sorted = sortListItems(items)
    expect(sorted.map((i) => i.id)).toEqual(['b', 'a'])
  })

  it('conserve l\'ordre de position au sein de chaque groupe', () => {
    const items = [
      makeItem({ id: 'c', checked: true, position: 1 }),
      makeItem({ id: 'a', checked: false, position: 1 }),
      makeItem({ id: 'd', checked: true, position: 0 }),
      makeItem({ id: 'b', checked: false, position: 0 }),
    ]
    const sorted = sortListItems(items)
    expect(sorted.map((i) => i.id)).toEqual(['b', 'a', 'd', 'c'])
  })
})

describe('groupListItemsBySection', () => {
  it('regroupe par rubrique dans l\'ordre de première apparition', () => {
    const items = [
      makeItem({ id: 'a', section: 'Été', position: 0 }),
      makeItem({ id: 'b', section: 'Hiver', position: 0 }),
      makeItem({ id: 'c', section: 'Été', position: 1 }),
    ]
    const groups = groupListItemsBySection(items)
    expect(groups.map((g) => g.section)).toEqual(['Été', 'Hiver'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'c'])
  })

  it('place le groupe sans rubrique en dernier', () => {
    const items = [
      makeItem({ id: 'a', section: null }),
      makeItem({ id: 'b', section: 'Hiver' }),
    ]
    const groups = groupListItemsBySection(items)
    expect(groups.map((g) => g.section)).toEqual(['Hiver', null])
  })

  it('trie les items cochés sous les non cochés au sein d\'un groupe', () => {
    const items = [
      makeItem({ id: 'a', section: 'Hiver', checked: true, position: 0 }),
      makeItem({ id: 'b', section: 'Hiver', checked: false, position: 1 }),
    ]
    const groups = groupListItemsBySection(items)
    expect(groups[0].items.map((i) => i.id)).toEqual(['b', 'a'])
  })
})
