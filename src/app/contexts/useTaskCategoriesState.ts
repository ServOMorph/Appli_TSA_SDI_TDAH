import { useState } from 'react'
import { taskCategoryRepo, newId } from '@/app/repositories'
import { createTaskCategory as createTaskCategoryRule } from '@/domain/rules/taskCategoryRules'
import type { TaskCategory } from '@/domain/entities/taskCategory'

export function useTaskCategoriesState() {
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([])

  async function load() {
    setTaskCategories(await taskCategoryRepo.getAll())
  }

  function reset() {
    setTaskCategories([])
  }

  async function createTaskCategory(name: string, color: string): Promise<string> {
    const now = new Date().toISOString()
    const category = createTaskCategoryRule(newId(), name, color, taskCategories.length, now)
    await taskCategoryRepo.create(category)
    setTaskCategories((prev) => [...prev, category])
    return category.id
  }

  async function renameTaskCategory(id: string, name: string) {
    const category = taskCategories.find((c) => c.id === id)
    if (!category) return
    const updated = { ...category, name }
    await taskCategoryRepo.update(updated)
    setTaskCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  async function updateTaskCategoryColor(id: string, color: string) {
    const category = taskCategories.find((c) => c.id === id)
    if (!category) return
    const updated = { ...category, color }
    await taskCategoryRepo.update(updated)
    setTaskCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  async function deleteTaskCategory(id: string) {
    await taskCategoryRepo.delete(id)
    setTaskCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    taskCategories,
    createTaskCategory,
    renameTaskCategory,
    updateTaskCategoryColor,
    deleteTaskCategory,
    load,
    reset,
  }
}
