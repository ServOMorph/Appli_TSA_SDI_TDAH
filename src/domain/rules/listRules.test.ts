import { describe, it, expect } from 'vitest'
import { createList, createListCategory, createListItem, toggleListItemChecked } from './listRules'

describe('createList', () => {
  it('crée une liste avec les champs attendus', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const list = createList('id-1', 'Musiques', now)
    expect(list.id).toBe('id-1')
    expect(list.name).toBe('Musiques')
    expect(list.created_at).toBe(now)
    expect(list.updated_at).toBe(now)
  })

  it('crée deux listes indépendantes', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const a = createList('id-1', 'Musiques', now)
    const b = createList('id-2', 'Livres', now)
    expect(a.id).not.toBe(b.id)
    expect(a.name).toBe('Musiques')
    expect(b.name).toBe('Livres')
  })
})

describe('createListCategory', () => {
  it('crée une catégorie avec les champs attendus', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const category = createListCategory('cat-1', 'list-1', 'Habits été', 0, now)
    expect(category.id).toBe('cat-1')
    expect(category.list_id).toBe('list-1')
    expect(category.name).toBe('Habits été')
    expect(category.position).toBe(0)
    expect(category.created_at).toBe(now)
  })
})

describe('toggleListItemChecked', () => {
  it('coche un item non coché', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-1', 'list-1', 'Titre', 0, now, 'cat-1')
    const toggled = toggleListItemChecked(item)
    expect(toggled.checked).toBe(true)
  })

  it('décoche un item coché', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = { ...createListItem('item-1', 'list-1', 'Titre', 0, now, 'cat-1'), checked: true }
    const toggled = toggleListItemChecked(item)
    expect(toggled.checked).toBe(false)
  })
})

describe('createListItem', () => {
  it('crée un élément de liste avec les champs attendus', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-1', 'list-1', 'Hotel California', 0, now, 'cat-1')
    expect(item.id).toBe('item-1')
    expect(item.list_id).toBe('list-1')
    expect(item.title).toBe('Hotel California')
    expect(item.position).toBe(0)
    expect(item.checked).toBe(false)
    expect(item.category_id).toBe('cat-1')
    expect(item.created_at).toBe(now)
  })

  it('respecte la position fournie', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-2', 'list-1', 'Titre B', 3, now, 'cat-1')
    expect(item.position).toBe(3)
  })

  it('associe l\'élément à la bonne liste', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-1', 'list-42', 'Titre', 0, now, 'cat-1')
    expect(item.list_id).toBe('list-42')
  })
})
