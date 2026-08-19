import { useCallback, useState } from 'react'
import { listCategoryRepo, listItemRepo, listItemSubTaskRepo, listRepo, newId } from '@/app/repositories'
import {
  createList as createListRule,
  createListCategory as createListCategoryRule,
  createListItem as createListItemRule,
  createListItemSubTask as createListItemSubTaskRule,
  toggleListItemChecked as toggleListItemCheckedRule,
  toggleListItemSubTaskChecked as toggleListItemSubTaskCheckedRule,
} from '@/domain/rules/listRules'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'
import type { ListCategory } from '@/domain/entities/listCategory'

export function useListsState() {
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedListItemId, setSelectedListItemId] = useState<string | null>(null)

  async function load() {
    setLists(await listRepo.getAll())
  }

  function reset() {
    setLists([])
    setSelectedListId(null)
    setSelectedListItemId(null)
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
    await Promise.all(items.map((item) => deleteListItem(item.id)))
    const categories = await listCategoryRepo.getByListId(id)
    await Promise.all(categories.map((category) => listCategoryRepo.delete(category.id)))
    await listRepo.delete(id)
    setLists((prev) => prev.filter((l) => l.id !== id))
  }

  const getListItems = useCallback(async (listId: string): Promise<ListItem[]> => {
    return listItemRepo.getByListId(listId)
  }, [])

  const getListCategories = useCallback(async (listId: string): Promise<ListCategory[]> => {
    return listCategoryRepo.getByListId(listId)
  }, [])

  async function createListCategory(listId: string, name: string): Promise<string> {
    const existing = await listCategoryRepo.getByListId(listId)
    const now = new Date().toISOString()
    const category = createListCategoryRule(newId(), listId, name, existing.length, now)
    await listCategoryRepo.create(category)
    return category.id
  }

  async function renameListCategory(id: string, name: string) {
    const category = await listCategoryRepo.getById(id)
    if (!category) return
    await listCategoryRepo.update({ ...category, name })
  }

  async function deleteListCategory(id: string) {
    const items = await listItemRepo.getByCategoryId(id)
    await Promise.all(items.map((item) => deleteListItem(item.id)))
    await listCategoryRepo.delete(id)
  }

  async function addListItem(listId: string, title: string, categoryId: string) {
    const existing = await listItemRepo.getByListId(listId)
    const now = new Date().toISOString()
    const item = createListItemRule(newId(), listId, title, existing.length, now, categoryId)
    await listItemRepo.create(item)
  }

  async function deleteListItem(id: string) {
    const subTasks = await listItemSubTaskRepo.getByListItemId(id)
    await Promise.all(subTasks.map((subTask) => listItemSubTaskRepo.delete(subTask.id)))
    await listItemRepo.delete(id)
  }

  async function toggleListItem(id: string) {
    const item = await listItemRepo.getById(id)
    if (!item) return
    await listItemRepo.update(toggleListItemCheckedRule(item))
  }

  const getListItem = useCallback(async (id: string): Promise<ListItem | undefined> => {
    return listItemRepo.getById(id)
  }, [])

  async function updateListItemDescription(id: string, description: string) {
    const item = await listItemRepo.getById(id)
    if (!item) return
    await listItemRepo.update({ ...item, description })
  }

  const getListItemSubTasks = useCallback(async (listItemId: string): Promise<ListItemSubTask[]> => {
    return listItemSubTaskRepo.getByListItemId(listItemId)
  }, [])

  async function addListItemSubTask(listItemId: string, title: string) {
    const existing = await listItemSubTaskRepo.getByListItemId(listItemId)
    const now = new Date().toISOString()
    const subTask = createListItemSubTaskRule(newId(), listItemId, title, existing.length, now)
    await listItemSubTaskRepo.create(subTask)
  }

  async function toggleListItemSubTask(id: string) {
    const subTask = await listItemSubTaskRepo.getById(id)
    if (!subTask) return
    await listItemSubTaskRepo.update(toggleListItemSubTaskCheckedRule(subTask))
  }

  async function deleteListItemSubTask(id: string) {
    await listItemSubTaskRepo.delete(id)
  }

  return {
    lists,
    selectedListId,
    selectList: setSelectedListId,
    selectedListItemId,
    selectListItem: setSelectedListItemId,
    createList,
    renameList,
    deleteList,
    getListItems,
    getListItem,
    getListCategories,
    createListCategory,
    renameListCategory,
    deleteListCategory,
    addListItem,
    deleteListItem,
    toggleListItem,
    updateListItemDescription,
    getListItemSubTasks,
    addListItemSubTask,
    toggleListItemSubTask,
    deleteListItemSubTask,
    load,
    reset,
  }
}
