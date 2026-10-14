import { useState } from 'react'
import {
  folderRepo,
  listItemRepo,
  listRepo,
  newId,
  routineRepo,
  routineScheduleRepo,
  routineStepCompletionRepo,
  routineStepRepo,
  taskRepo,
  toolRepo,
} from '@/app/repositories'
import {
  canMoveFolder,
  createFolder as createFolderRule,
  getChildFolders,
  getDescendantFolderIds,
} from '@/domain/rules/folderRules'
import { createList as createListRule } from '@/domain/rules/listRules'
import { createRoutine as createRoutineRule } from '@/domain/rules/routineRules'
import { createTool as createToolRule } from '@/domain/rules/toolRules'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'

export function useToolsState(reloadLists: () => Promise<void>, reloadRoutines: () => Promise<void>) {
  const [tools, setTools] = useState<Tool[]>([])
  const [folders, setFolders] = useState<Folder[]>([])

  async function load() {
    setTools(await toolRepo.getAll())
    setFolders(await folderRepo.getAll())
  }

  function reset() {
    setTools([])
    setFolders([])
  }

  async function createFolder(name: string, parentId: string | null = null): Promise<string> {
    const now = new Date().toISOString()
    const siblings = getChildFolders(folders, parentId)
    const folder = createFolderRule(newId(), name, siblings.length, now, parentId)
    await folderRepo.create(folder)
    setFolders((prev) => [...prev, folder])
    return folder.id
  }

  async function createToolList(name: string, folderId: string | null): Promise<string> {
    const now = new Date().toISOString()
    const list = createListRule(newId(), name, now)
    await listRepo.create(list)

    const siblings = tools.filter((t) => t.folder_id === folderId)
    const tool = createToolRule(newId(), 'liste', folderId, list.id, siblings.length, now)
    await toolRepo.create(tool)
    setTools((prev) => [...prev, tool])
    await reloadLists()
    return list.id
  }

  async function createToolRoutine(name: string, folderId: string | null, durationMinutes: number | null = null): Promise<string> {
    const now = new Date().toISOString()
    const routine = createRoutineRule(newId(), name.trim(), now, null, durationMinutes)
    await routineRepo.create(routine)

    const siblings = tools.filter((t) => t.folder_id === folderId)
    const tool = createToolRule(newId(), 'routine', folderId, null, siblings.length, now, null, routine.id)
    await toolRepo.create(tool)
    setTools((prev) => [...prev, tool])
    await reloadRoutines()
    return routine.id
  }

  async function deleteTool(id: string) {
    const tool = tools.find((t) => t.id === id)
    if (!tool) return
    if (tool.type === 'liste' && tool.list_id) {
      const items = await listItemRepo.getByListId(tool.list_id)
      await Promise.all(items.map((item) => listItemRepo.delete(item.id)))
      await listRepo.delete(tool.list_id)
    }
    if (tool.type === 'routine' && tool.routine_id) {
      const steps = await routineStepRepo.getByRoutineId(tool.routine_id)
      for (const step of steps) await taskRepo.deleteWithChildren(step.id)
      await Promise.all(steps.map((step) => routineStepRepo.delete(step.id)))
      const schedules = await routineScheduleRepo.getByRoutineId(tool.routine_id)
      await Promise.all(schedules.map((schedule) => routineScheduleRepo.delete(schedule.id)))
      await routineStepCompletionRepo.deleteByRoutineId(tool.routine_id)
      await routineRepo.delete(tool.routine_id)
    }
    await toolRepo.delete(id)
    setTools((prev) => prev.filter((t) => t.id !== id))
    if (tool.type === 'liste') await reloadLists()
    if (tool.type === 'routine') await reloadRoutines()
  }

  async function updateToolColor(id: string, color: string | null) {
    const tool = tools.find((t) => t.id === id)
    if (!tool) return
    const updated = { ...tool, color, updated_at: new Date().toISOString() }
    await toolRepo.update(updated)
    setTools((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function moveTool(id: string, folderId: string | null) {
    const tool = tools.find((t) => t.id === id)
    if (!tool || tool.folder_id === folderId) return
    const siblings = tools.filter((t) => t.folder_id === folderId)
    const updated = { ...tool, folder_id: folderId, position: siblings.length, updated_at: new Date().toISOString() }
    await toolRepo.update(updated)
    setTools((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function moveFolder(id: string, parentId: string | null) {
    if (!canMoveFolder(folders, id, parentId)) return
    const folder = folders.find((f) => f.id === id)
    if (!folder) return
    const siblings = getChildFolders(folders, parentId)
    const updated = { ...folder, parent_id: parentId, position: siblings.length, updated_at: new Date().toISOString() }
    await folderRepo.update(updated)
    setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)))
  }

  async function deleteFolder(id: string) {
    const doomed = [id, ...getDescendantFolderIds(folders, id)]
    const contained = tools.filter((t) => t.folder_id !== null && doomed.includes(t.folder_id))
    const rootSiblings = tools.filter((t) => t.folder_id === null).length
    let kept = 0
    for (const tool of contained) {
      if (tool.type === 'tableau_comptage') {
        const updated = { ...tool, folder_id: null, position: rootSiblings + kept, updated_at: new Date().toISOString() }
        kept += 1
        await toolRepo.update(updated)
        setTools((prev) => prev.map((t) => (t.id === tool.id ? updated : t)))
      } else {
        await deleteTool(tool.id)
      }
    }
    for (const folderId of [...doomed].reverse()) {
      await folderRepo.delete(folderId)
    }
    setFolders((prev) => prev.filter((f) => !doomed.includes(f.id)))
  }

  return {
    tools,
    folders,
    createFolder,
    createToolList,
    createToolRoutine,
    deleteTool,
    updateToolColor,
    moveTool,
    moveFolder,
    deleteFolder,
    load,
    reset,
  }
}
