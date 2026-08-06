import { useCallback, useState } from 'react'
import { listItemRepo, listRepo, newId } from '@/app/repositories'
import { createList as createListRule, createListItem as createListItemRule, toggleListItemChecked as toggleListItemCheckedRule } from '@/domain/rules/listRules'
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

  const getListItems = useCallback(async (listId: string): Promise<ListItem[]> => {
    return listItemRepo.getByListId(listId)
  }, [])

  async function addListItem(listId: string, title: string, section: string | null = null) {
    const existing = await listItemRepo.getByListId(listId)
    const now = new Date().toISOString()
    const item = createListItemRule(newId(), listId, title, existing.length, now, section)
    await listItemRepo.create(item)
  }

  async function deleteListItem(id: string) {
    await listItemRepo.delete(id)
  }

  async function toggleListItem(id: string) {
    const item = await listItemRepo.getById(id)
    if (!item) return
    await listItemRepo.update(toggleListItemCheckedRule(item))
  }

  async function updateListItemSection(id: string, section: string | null) {
    const item = await listItemRepo.getById(id)
    if (!item) return
    await listItemRepo.update({ ...item, section })
  }

  return {
    lists,
    selectedListId,
    selectList: setSelectedListId,
    createList,
    renameList,
    deleteList,
    getListItems,
    addListItem,
    deleteListItem,
    toggleListItem,
    updateListItemSection,
    load,
    reset,
  }
}
