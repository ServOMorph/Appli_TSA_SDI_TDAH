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
import type { TaskCategory } from '@/domain/entities/taskCategory'
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
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'

export type ImportResult = { ok: true } | { ok: false; error: string }

const IMPORT_TABLES = [
  db.users, db.tasks, db.taskRecurrences, db.taskExceptions, db.taskCategories,
  db.lists, db.listItems, db.listItemSubTasks, db.listCategories, db.folders,
  db.tools, db.energyEntries, db.settings, db.budgetCategories, db.budgetEntries,
  db.budgetAccounts, db.budgetDeposits, db.budgetIncomeEntries, db.manualTestResults,
] as const

function readImportArray(data: Record<string, unknown>, key: string): unknown[] {
  const value = data[key]
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((item) => item === null || typeof item !== 'object')) {
    throw new Error(`Fichier invalide : ${key} doit être une liste d’éléments.`)
  }
  return value
}

function assertUniqueIds(name: string, items: { id: string }[]) {
  const ids = new Set<string>()
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id)) {
      throw new Error(`Fichier invalide : identifiants ${name} absents ou dupliqués.`)
    }
    ids.add(item.id)
  }
}

function assertReferences(name: string, items: object[], field: string, ids: Set<string>) {
  if (items.some((item) => {
    const value = (item as Record<string, unknown>)[field]
    return typeof value === 'string' && !ids.has(value)
  })) {
    throw new Error(`Fichier invalide : référence ${name} orpheline.`)
  }
}

function assertSupportedVersion(version: unknown) {
  if (version === undefined) return
  if (typeof version !== 'string' || !/^\d+\.\d+(?:\.\d+)?$/.test(version)) {
    throw new Error('Fichier invalide : version d’export inconnue.')
  }
  const parts = version.split('.').map(Number)
  const major = parts[0]
  const minor = parts[1]
  const patch = parts[2] ?? 0
  const [currentMajor, currentMinor, currentPatch] = [3, 6, 0]
  if (major > currentMajor || (major === currentMajor && (minor > currentMinor || (minor === currentMinor && patch > currentPatch)))) {
    throw new Error('Fichier incompatible : version d’export plus récente.')
  }
}

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
      db.budgetIncomeEntries.clear(),
      db.folders.clear(),
      db.tools.clear(),
      db.taskRecurrences.clear(),
      db.taskExceptions.clear(),
      db.taskCategories.clear(),
      db.manualTestResults.clear(),
    ])
  }

  /**
   * Restaure intégralement les données à partir d'un export JSON : remplace tout le contenu
   * de la base (§clearDatabase) par le contenu du fichier. Accepte les exports v3.0 (avant
   * l'ajout de `folders`/`tools`/`task_recurrences`/`task_exceptions` à l'export) en recréant
   * l'entrée Outil manquante pour chaque liste qui n'en a pas, ainsi que l'entrée Outil Budget
   * (`tableau_comptage`) si elle est absente. Les exports plus anciens sans résultats de tests
   * manuels sont acceptés avec un historique vide. Les exports antérieurs à v3.3 (avant l'ajout
   * de `list_categories`) sont acceptés en recréant une catégorie par valeur de `section` sur
   * les éléments de liste, comme le fait la migration Dexie v12 à l'installation. Les exports
   * antérieurs à v3.5 (avant `description`/`list_item_sub_tasks`) sont acceptés avec une
   * description vide par défaut et aucune sous-tâche.
   */
  async function importData(raw: unknown): Promise<ImportResult> {
    if (typeof raw !== 'object' || raw === null) {
      return { ok: false, error: 'Fichier invalide : JSON attendu.' }
    }
    const data = raw as Record<string, unknown>
    try {
      assertSupportedVersion(data.version)
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Fichier invalide.' }
    }
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
    let tasks: Task[], taskRecurrences: TaskRecurrence[], taskExceptions: TaskException[], taskCategories: TaskCategory[]
    let lists: List[], rawListItems: (ListItem & { section?: string | null })[], listItemSubTasks: ListItemSubTask[], listCategories: ListCategory[]
    let folders: Folder[], tools: Tool[], energyEntries: EnergyEntry[], categories: BudgetCategory[], entries: BudgetEntry[]
    let accounts: BudgetAccount[], deposits: BudgetDeposit[], incomeEntries: BudgetIncomeEntry[], manualTestResults: ManualTestResult[]
    try {
      tasks = readImportArray(data, 'tasks') as Task[]
      taskRecurrences = readImportArray(data, 'task_recurrences') as TaskRecurrence[]
      taskExceptions = readImportArray(data, 'task_exceptions') as TaskException[]
      taskCategories = readImportArray(data, 'task_categories') as TaskCategory[]
      lists = readImportArray(data, 'lists') as List[]
      rawListItems = readImportArray(data, 'list_items') as (ListItem & { section?: string | null })[]
      listItemSubTasks = readImportArray(data, 'list_item_sub_tasks') as ListItemSubTask[]
      listCategories = readImportArray(data, 'list_categories') as ListCategory[]
      folders = readImportArray(data, 'folders') as Folder[]
      tools = readImportArray(data, 'tools') as Tool[]
      energyEntries = readImportArray(data, 'energy_entries') as EnergyEntry[]
      categories = readImportArray(data, 'budget_categories') as BudgetCategory[]
      entries = readImportArray(data, 'budget_entries') as BudgetEntry[]
      accounts = readImportArray(data, 'budget_accounts') as BudgetAccount[]
      deposits = readImportArray(data, 'budget_deposits') as BudgetDeposit[]
      incomeEntries = readImportArray(data, 'budget_income_entries') as BudgetIncomeEntry[]
      manualTestResults = readImportArray(data, 'manual_test_results') as ManualTestResult[]
      for (const [name, items] of Object.entries({ tasks, taskRecurrences, taskExceptions, taskCategories, lists, rawListItems, listItemSubTasks, listCategories, folders, tools, energyEntries, categories, entries, accounts, deposits, incomeEntries, manualTestResults })) {
        assertUniqueIds(name, items as { id: string }[])
      }
      const taskIds = new Set(tasks.map((item) => item.id))
      const listIds = new Set(lists.map((item) => item.id))
      const listItemIds = new Set(rawListItems.map((item) => item.id))
      const listCategoryIds = new Set(listCategories.map((item) => item.id))
      const recurrenceIds = new Set(taskRecurrences.map((item) => item.id))
      const accountIds = new Set(accounts.map((item) => item.id))
      const categoryIds = new Set(categories.map((item) => item.id))
      assertReferences('tâche parente', tasks, 'parent_id', taskIds)
      assertReferences('récurrence de tâche', tasks, 'recurrence_id', recurrenceIds)
      assertReferences('récurrence', taskExceptions, 'recurrence_id', recurrenceIds)
      assertReferences('liste', rawListItems, 'list_id', listIds)
      assertReferences('catégorie de liste', rawListItems, 'category_id', listCategoryIds)
      assertReferences('élément de liste', listItemSubTasks, 'list_item_id', listItemIds)
      assertReferences('liste d’outil', tools, 'list_id', listIds)
      assertReferences('compte budget', deposits, 'account_id', accountIds)
      assertReferences('catégorie budget', entries, 'category_id', categoryIds)
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Fichier invalide.' }
    }

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

    /**
     * Les exports antérieurs à la migration Dexie v12 (catégories de listes) n'ont pas de
     * `list_categories` et leurs éléments portent `section` au lieu de `category_id`. Comme
     * l'upgrade Dexie qui fait cette réparation ne s'exécute que sur un changement de version
     * de schéma (jamais lors d'un import qui vide puis réinsère les données), on reproduit ici
     * la même logique : une catégorie par valeur de `section` (« Général » si absente), par liste.
     */
    const repairedCategories = [...listCategories]
    const categoryPositionByList = new Map<string, number>()
    for (const category of repairedCategories) {
      const current = categoryPositionByList.get(category.list_id) ?? -1
      if (category.position > current) categoryPositionByList.set(category.list_id, category.position)
    }
    const categoryIdByListAndName = new Map(repairedCategories.map((c) => [`${c.list_id}::${c.name}`, c.id]))

    const repairedListItems: ListItem[] = rawListItems.map((item) => {
      if (item.category_id) return { ...item, description: item.description ?? '' }
      const name = item.section ?? 'Général'
      const key = `${item.list_id}::${name}`
      let categoryId = categoryIdByListAndName.get(key)
      if (!categoryId) {
        categoryId = newId()
        categoryIdByListAndName.set(key, categoryId)
        const position = (categoryPositionByList.get(item.list_id) ?? -1) + 1
        categoryPositionByList.set(item.list_id, position)
        repairedCategories.push({ id: categoryId, list_id: item.list_id, name, position, created_at: now })
      }
      return {
        id: item.id,
        list_id: item.list_id,
        title: item.title,
        position: item.position,
        checked: item.checked,
        created_at: item.created_at,
        category_id: categoryId,
        description: item.description ?? '',
      }
    })

    try {
      await db.transaction('rw', IMPORT_TABLES, async () => {
        await Promise.all(IMPORT_TABLES.map((table) => table.clear()))
        await db.users.add(user)
        if (tasks.length) await db.tasks.bulkAdd(tasks)
        if (taskRecurrences.length) await db.taskRecurrences.bulkAdd(taskRecurrences)
        if (taskExceptions.length) await db.taskExceptions.bulkAdd(taskExceptions)
        if (taskCategories.length) await db.taskCategories.bulkAdd(taskCategories)
        if (lists.length) await db.lists.bulkAdd(lists)
        if (repairedListItems.length) await db.listItems.bulkAdd(repairedListItems)
        if (listItemSubTasks.length) await db.listItemSubTasks.bulkAdd(listItemSubTasks)
        if (repairedCategories.length) await db.listCategories.bulkAdd(repairedCategories)
        if (folders.length) await db.folders.bulkAdd(folders)
        if (repairedTools.length) await db.tools.bulkAdd(repairedTools)
        if (energyEntries.length) await db.energyEntries.bulkAdd(energyEntries)
        await db.settings.add(settingsData)
        if (categories.length) await db.budgetCategories.bulkAdd(categories)
        if (entries.length) await db.budgetEntries.bulkAdd(entries)
        if (accounts.length) await db.budgetAccounts.bulkAdd(accounts)
        if (deposits.length) await db.budgetDeposits.bulkAdd(deposits)
        if (incomeEntries.length) await db.budgetIncomeEntries.bulkAdd(incomeEntries)
        if (manualTestResults.length) await db.manualTestResults.bulkAdd(manualTestResults)
      })
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
