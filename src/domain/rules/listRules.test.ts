import { describe, it, expect } from 'vitest'
import { createList, createListItem, togglePinList } from './listRules'

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

describe('togglePinList', () => {
  it('épingle une liste non épinglée', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const list = createList('id-1', 'Musiques', now)
    const pinned = togglePinList(list, '2026-07-01T10:00:00.000Z')
    expect(pinned.pinned_to_tools).toBe(true)
    expect(pinned.updated_at).toBe('2026-07-01T10:00:00.000Z')
  })

  it('désépingle une liste épinglée', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const list = { ...createList('id-1', 'Musiques', now), pinned_to_tools: true }
    const unpinned = togglePinList(list, '2026-07-01T10:00:00.000Z')
    expect(unpinned.pinned_to_tools).toBe(false)
  })
})

describe('createListItem', () => {
  it('crée un élément de liste avec les champs attendus', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-1', 'list-1', 'Hotel California', 0, now)
    expect(item.id).toBe('item-1')
    expect(item.list_id).toBe('list-1')
    expect(item.title).toBe('Hotel California')
    expect(item.position).toBe(0)
    expect(item.created_at).toBe(now)
  })

  it('respecte la position fournie', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-2', 'list-1', 'Titre B', 3, now)
    expect(item.position).toBe(3)
  })

  it('associe l\'élément à la bonne liste', () => {
    const now = '2026-06-30T10:00:00.000Z'
    const item = createListItem('item-1', 'list-42', 'Titre', 0, now)
    expect(item.list_id).toBe('list-42')
  })
})
