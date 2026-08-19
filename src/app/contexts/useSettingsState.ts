import { useEffect, useState } from 'react'
import { db, listRepo, newId, settingsRepo, toolRepo, userRepo } from '@/app/repositories'
import { buildSnapshotPayload } from '@/data/sync/buildSnapshot'
import { createList } from '@/domain/rules/listRules'
import { createTool } from '@/domain/rules/toolRules'
import type { Settings } from '@/domain/entities/settings'
import type { User, ProfileType } from '@/domain/entities/user'
import type { Task } from '@/domain/entities/task'
import type { TaskRecurrence } from '@/domain/entities/taskRecurrence'
import type { TaskException } from '@/domain/entities/taskException'
import type { List } from '@/domain/entities/list'
import type { ListItem } from '@/domain/entities/listItem'
import type { ListItemSubTask } from '@/domain/entities/listItemSubTask'
import type { ListCategory } from '@/domain/entities/listCategory'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'
import type { EnergyEntry } from '@/domain/entities/energyEntry'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'

export type ImportResult = { ok: true } | { ok: false; error: string }

export function useSettingsState() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    const fontSizes: Record<string, string> = { small: '13px', medium: '16px', large: '22px' }
    root.style.fontSize = fontSizes[settings.font_size] ?? '16px'
    root.classList.toggle('dark-mode', settings.dark_mode)
    root.classList.toggle('reduce-motion', settings.reduced_motion)
    root.style.setProperty('--color-accent', settings.ambiance_color ?? 'var(--color-primary)')
  }, [settings])

  function reset() {
    setCurrentUser(null)
    setSettings(null)
  }

  async function createUser(profile: ProfileType) {
    const now = new Date().toISOString()
    const userId = newId()
    const user: User = {
      id: userId,
      profile_type: profile,
      onboarding_completed: false,
      created_at: now,
      updated_at: now,
    }
    const defaultSettings: Settings = {
      id: newId(),
      user_id: userId,
      dark_mode: false,
      font_size: 'medium',
      reduced_motion: false,
    }
    await userRepo.create(user)
    await settingsRepo.create(defaultSettings)
    await seedDefaultToolsIfMissing()
    setCurrentUser(user)
  }

  /**
   * Une installation neuve crée la base Dexie directement au dernier schéma, sans exécuter
   * les callbacks `.upgrade()` des versions précédentes (rien à migrer) : la To Do et le
   * Budget seedés par la migration v10 n'existent alors pas encore. Cette fonction couvre
   * ce cas ; sur une base déjà migrée depuis v9, les outils existent déjà et rien n'est créé.
   */
  async function seedDefaultToolsIfMissing() {
    const existing = await toolRepo.getAll()
    if (existing.length > 0) return
    const now = new Date().toISOString()
    const todoList = createList(newId(), 'To Do', now)
    await listRepo.create(todoList)
    await toolRepo.create(createTool(newId(), 'liste', null, todoList.id, 0, now))
    await toolRepo.create(createTool(newId(), 'tableau_comptage', null, null, 1, now))
  }

  async function updateSettings(patch: Partial<Settings>) {
    if (!currentUser) return
    const s = await settingsRepo.getByUserId(currentUser.id)
    if (!s) return
    const updated = { ...s, ...patch }
    await settingsRepo.update(updated)
    setSettings(updated)
  }

  async function exportData() {
    if (!currentUser) return
    const snapshot = await buildSnapshotPayload()
    if (!snapshot) return
    const payload = { export_date: new Date().toISOString(), ...snapshot }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-audhd-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function clearDatabase() {
    await Promise.all([
      db.users.clear(),
      db.tasks.clear(),
      db.energyEntries.clear(),
      db.settings.clear(),
      db.lists.clear(),
      db.listItems.clear(),
      db.listItemSubTasks.clear(),
      db.listCategories.clear(),
      db.budgetCategories.clear(),
      db.budgetEntries.clear(),
      db.budgetAccounts.clear(),
      db.budgetDeposits.clear(),
      db.folders.clear(),
      db.tools.clear(),
      db.taskRecurrences.clear(),
      db.taskExceptions.clear(),
      db.manualTestResults.clear(),
    ])
  }

  /**
   * Restaure intégralement les données à partir d'un export JSON : remplace tout le contenu
   * de la base (§clearDatabase) par le contenu du fichier. Accepte les exports v3.0 (avant
   * l'ajout de `folders`/`tools`/`task_recurrences`/`task_exceptions` à l'export) en recréant
   * l'entrée Outil manquante pour chaque liste qui n'en a pas, ainsi que l'entrée Outil Budget
   * (`tableau_comptage`) si elle est absente. Les exports plus anciens sans résultats de tests
   * manuels sont acceptés avec un historique vide. Les exports antérieurs à v3.3 n'ont pas de
   * catégories de listes : une catégorie « Général » par liste est recréée et les éléments
   * orphelins y sont rattachés, faute de quoi ils resteraient invisibles.
   */
  async function importData(raw: unknown): Promise<ImportResult> {
    if (typeof raw !== 'object' || raw === null) {
      return { ok: false, error: 'Fichier invalide : JSON attendu.' }
    }
    const data = raw as Record<string, unknown>
    const importedUser = data.user
    if (
      !importedUser ||
      typeof importedUser !== 'object' ||
      typeof (importedUser as User).id !== 'string' ||
      typeof (importedUser as User).profile_type !== 'string'
    ) {
      return { ok: false, error: 'Fichier invalide : profil utilisateur manquant ou incomplet.' }
    }
    const user = importedUser as User
    const tasks = Array.isArray(data.tasks) ? (data.tasks as Task[]) : []
    const taskRecurrences = Array.isArray(data.task_recurrences) ? (data.task_recurrences as TaskRecurrence[]) : []
    const taskExceptions = Array.isArray(data.task_exceptions) ? (data.task_exceptions as TaskException[]) : []
    const lists = Array.isArray(data.lists) ? (data.lists as List[]) : []
    const listItems = Array.isArray(data.list_items) ? (data.list_items as ListItem[]) : []
    const listItemSubTasks = Array.isArray(data.list_item_sub_tasks)
      ? (data.list_item_sub_tasks as ListItemSubTask[])
      : []
    const listCategories = Array.isArray(data.list_categories) ? (data.list_categories as ListCategory[]) : []
    const folders = Array.isArray(data.folders) ? (data.folders as Folder[]) : []
    const tools = Array.isArray(data.tools) ? (data.tools as Tool[]) : []
    const energyEntries = Array.isArray(data.energy_entries) ? (data.energy_entries as EnergyEntry[]) : []
    const categories = Array.isArray(data.budget_categories) ? (data.budget_categories as BudgetCategory[]) : []
    const entries = Array.isArray(data.budget_entries) ? (data.budget_entries as BudgetEntry[]) : []
    const accounts = Array.isArray(data.budget_accounts) ? (data.budget_accounts as BudgetAccount[]) : []
    const deposits = Array.isArray(data.budget_deposits) ? (data.budget_deposits as BudgetDeposit[]) : []
    const manualTestResults = Array.isArray(data.manual_test_results) ? (data.manual_test_results as ManualTestResult[]) : []

    const importedSettings = data.settings
    const now = new Date().toISOString()
    const settingsData: Settings =
      importedSettings && typeof importedSettings === 'object' && typeof (importedSettings as Settings).id === 'string'
        ? (importedSettings as Settings)
        : { id: newId(), user_id: user.id, dark_mode: false, font_size: 'medium', reduced_motion: false }

    const repairedTools = [...tools]
    let nextPosition = repairedTools.length
    for (const list of lists) {
      const hasTool = repairedTools.some((t) => t.type === 'liste' && t.list_id === list.id)
      if (!hasTool) {
        repairedTools.push(createTool(newId(), 'liste', null, list.id, nextPosition, now))
        nextPosition += 1
      }
    }
    const hasBudgetTool = repairedTools.some((t) => t.type === 'tableau_comptage')
    if (!hasBudgetTool) {
      repairedTools.push(createTool(newId(), 'tableau_comptage', null, null, nextPosition, now))
      nextPosition += 1
    }

    const repairedCategories = [...listCategories]
    const knownCategoryIds = new Set(repairedCategories.map((c) => c.id))
    const fallbackCategoryByList = new Map<string, string>()
    const repairedListItems = listItems.map((item) => {
      if (knownCategoryIds.has(item.category_id)) return item
      let categoryId = fallbackCategoryByList.get(item.list_id)
      if (!categoryId) {
        categoryId = newId()
        fallbackCategoryByList.set(item.list_id, categoryId)
        repairedCategories.push({
          id: categoryId,
          list_id: item.list_id,
          name: 'Général',
          position: repairedCategories.filter((c) => c.list_id === item.list_id).length,
          created_at: now,
        })
      }
      return { ...item, category_id: categoryId }
    }).map((item) => ({ ...item, description: item.description ?? '' }))

    try {
      await clearDatabase()
      await db.users.add(user)
      await Promise.all([
        tasks.length ? db.tasks.bulkAdd(tasks) : Promise.resolve(),
        taskRecurrences.length ? db.taskRecurrences.bulkAdd(taskRecurrences) : Promise.resolve(),
        taskExceptions.length ? db.taskExceptions.bulkAdd(taskExceptions) : Promise.resolve(),
        lists.length ? db.lists.bulkAdd(lists) : Promise.resolve(),
        repairedListItems.length ? db.listItems.bulkAdd(repairedListItems) : Promise.resolve(),
        listItemSubTasks.length ? db.listItemSubTasks.bulkAdd(listItemSubTasks) : Promise.resolve(),
        repairedCategories.length ? db.listCategories.bulkAdd(repairedCategories) : Promise.resolve(),
        folders.length ? db.folders.bulkAdd(folders) : Promise.resolve(),
        repairedTools.length ? db.tools.bulkAdd(repairedTools) : Promise.resolve(),
        energyEntries.length ? db.energyEntries.bulkAdd(energyEntries) : Promise.resolve(),
        db.settings.add(settingsData),
        categories.length ? db.budgetCategories.bulkAdd(categories) : Promise.resolve(),
        entries.length ? db.budgetEntries.bulkAdd(entries) : Promise.resolve(),
        accounts.length ? db.budgetAccounts.bulkAdd(accounts) : Promise.resolve(),
        deposits.length ? db.budgetDeposits.bulkAdd(deposits) : Promise.resolve(),
        manualTestResults.length ? db.manualTestResults.bulkAdd(manualTestResults) : Promise.resolve(),
      ])
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Échec de l\'import.' }
    }

    setCurrentUser(user)
    setSettings(settingsData)
    return { ok: true }
  }

  async function completeOnboarding(): Promise<boolean> {
    if (!currentUser) return false
    const updated: User = { ...currentUser, onboarding_completed: true, updated_at: new Date().toISOString() }
    await userRepo.update(updated)
    setCurrentUser(updated)
    return true
  }

  return {
    currentUser,
    settings,
    setCurrentUser,
    setSettings,
    createUser,
    updateSettings,
    exportData,
    importData,
    clearDatabase,
    completeOnboarding,
    reset,
  }
}
