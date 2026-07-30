import { useCallback, useState } from 'react'
import { listItemRepo, listRepo, newId } from '@/app/repositories'
import { createList as createListRule, createListItem as createListItemRule, togglePinList as togglePinListRule } from '@/domain/rules/listRules'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'

export function useListsState() {
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  async function load() {
    setLists(await listRepo.getAll())
  }

  function reset() {
    setLists([])
    setSelectedListId(null)
  }

  async function createList(name: string): Promise<string> {
    const now = new Date().toISOString()
    const list = createListRule(newId(), name, now)
    await listRepo.create(list)
    setLists((prev) => [...prev, list])
    return list.id
  }

  async function renameList(id: string, name: string) {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    const updated = { ...list, name, updated_at: new Date().toISOString() }
    await listRepo.update(updated)
    setLists((prev) => prev.map((l) => (l.id === id ? updated : l)))
  }

  async function deleteList(id: string) {
    const items = await listItemRepo.getByListId(id)
    await Promise.all(items.map((item) => listItemRepo.delete(item.id)))
    await listRepo.delete(id)
    setLists((prev) => prev.filter((l) => l.id !== id))
  }

  async function togglePinList(id: string) {
    const list = lists.find((l) => l.id === id)
    if (!list) return
    const updated = togglePinListRule(list, new Date().toISOString())
    await listRepo.update(updated)
    setLists((prev) => prev.map((l) => (l.id === id ? updated : l)))
  }

  const getListItems = useCallback(async (listId: string): Promise<ListItem[]> => {
    return listItemRepo.getByListId(listId)
  }, [])

  async function addListItem(listId: string, title: string) {
    const existing = await listItemRepo.getByListId(listId)
    const now = new Date().toISOString()
    const item = createListItemRule(newId(), listId, title, existing.length, now)
    await listItemRepo.create(item)
  }

  async function deleteListItem(id: string) {
    await listItemRepo.delete(id)
  }

  return {
    lists,
    selectedListId,
    selectList: setSelectedListId,
    createList,
    renameList,
    deleteList,
    togglePinList,
    getListItems,
    addListItem,
    deleteListItem,
    load,
    reset,
  }
}
