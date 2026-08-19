import { describe, it, expect } from 'vitest'
import { groupListItemsByCategory, sortListItems } from './listItemSortRules'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListCategory } from '@/domain/entities/listCategory'

function makeItem(overrides: Partial<ListItem> = {}): ListItem {
  return {
    id: 'i1',
    list_id: 'list-1',
    title: 'Item',
    position: 0,
    checked: false,
    category_id: 'cat-ete',
    description: '',
    created_at: '2026-08-06T00:00:00.000Z',
    ...overrides,
  }
}

function makeCategory(overrides: Partial<ListCategory> = {}): ListCategory {
  return {
    id: 'cat-ete',
    list_id: 'list-1',
    name: 'Été',
    position: 0,
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

describe('groupListItemsByCategory', () => {
  it('regroupe par catégorie dans l\'ordre de position des catégories', () => {
    const categories = [
      makeCategory({ id: 'cat-ete', name: 'Été', position: 0 }),
      makeCategory({ id: 'cat-hiver', name: 'Hiver', position: 1 }),
    ]
    const items = [
      makeItem({ id: 'a', category_id: 'cat-ete', position: 0 }),
      makeItem({ id: 'b', category_id: 'cat-hiver', position: 0 }),
      makeItem({ id: 'c', category_id: 'cat-ete', position: 1 }),
    ]
    const groups = groupListItemsByCategory(items, categories)
    expect(groups.map((g) => g.category.name)).toEqual(['Été', 'Hiver'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['a', 'c'])
  })

  it('respecte l\'ordre de position des catégories même inversé', () => {
    const categories = [
      makeCategory({ id: 'cat-hiver', name: 'Hiver', position: 0 }),
      makeCategory({ id: 'cat-ete', name: 'Été', position: 1 }),
    ]
    const items = [
      makeItem({ id: 'a', category_id: 'cat-ete' }),
      makeItem({ id: 'b', category_id: 'cat-hiver' }),
    ]
    const groups = groupListItemsByCategory(items, categories)
    expect(groups.map((g) => g.category.name)).toEqual(['Hiver', 'Été'])
  })

  it('trie les items cochés sous les non cochés au sein d\'un groupe', () => {
    const categories = [makeCategory({ id: 'cat-hiver', name: 'Hiver', position: 0 })]
    const items = [
      makeItem({ id: 'a', category_id: 'cat-hiver', checked: true, position: 0 }),
      makeItem({ id: 'b', category_id: 'cat-hiver', checked: false, position: 1 }),
    ]
    const groups = groupListItemsByCategory(items, categories)
    expect(groups[0].items.map((i) => i.id)).toEqual(['b', 'a'])
  })
})
