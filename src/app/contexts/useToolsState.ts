import { useState } from 'react'
import { folderRepo, listItemRepo, listRepo, newId, toolRepo } from '@/app/repositories'
import { createFolder as createFolderRule } from '@/domain/rules/folderRules'
import { createList as createListRule } from '@/domain/rules/listRules'
import { createTool as createToolRule } from '@/domain/rules/toolRules'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'

export function useToolsState(reloadLists: () => Promise<void>) {
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

  async function createFolder(name: string): Promise<string> {
    const now = new Date().toISOString()
    const folder = createFolderRule(newId(), name, folders.length, now)
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

  async function deleteTool(id: string) {
    const tool = tools.find((t) => t.id === id)
    if (!tool) return
    if (tool.type === 'liste' && tool.list_id) {
      const items = await listItemRepo.getByListId(tool.list_id)
      await Promise.all(items.map((item) => listItemRepo.delete(item.id)))
      await listRepo.delete(tool.list_id)
    }
    await toolRepo.delete(id)
    setTools((prev) => prev.filter((t) => t.id !== id))
    if (tool.type === 'liste') await reloadLists()
  }

  async function updateToolColor(id: string, color: string | null) {
    const tool = tools.find((t) => t.id === id)
    if (!tool) return
    const updated = { ...tool, color, updated_at: new Date().toISOString() }
    await toolRepo.update(updated)
    setTools((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function deleteFolder(id: string) {
    const contained = tools.filter((t) => t.folder_id === id)
    for (const tool of contained) {
      await deleteTool(tool.id)
    }
    await folderRepo.delete(id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }

  return {
    tools,
    folders,
    createFolder,
    createToolList,
    deleteTool,
    updateToolColor,
    deleteFolder,
    load,
    reset,
  }
}
