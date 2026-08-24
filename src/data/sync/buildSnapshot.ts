import { db, userRepo, settingsRepo } from '@/app/repositories'

export const SNAPSHOT_SCHEMA_VERSION = '3.5'

/**
 * Payload complet des donnees applicatives, partage par l'export manuel (useSettingsState)
 * et la synchronisation automatique (syncClient) : une seule source pour les 18 tables
 * Dexie a serialiser evite qu'une table ajoutee soit oubliee dans l'un des deux flux.
 */
export async function buildSnapshotPayload() {
  const user = await userRepo.getFirst()
  if (!user) return null

  const [
    tasks,
    taskRecurrences,
    taskExceptions,
    lists,
    listItems,
    listItemSubTasks,
    listCategories,
    folders,
    tools,
    energyEntries,
    settingsData,
    budgetCategories,
    budgetEntries,
    budgetAccounts,
    budgetDeposits,
    budgetIncomeEntries,
    manualTestResults,
  ] = await Promise.all([
    db.tasks.toArray(),
    db.taskRecurrences.toArray(),
    db.taskExceptions.toArray(),
    db.lists.toArray(),
    db.listItems.toArray(),
    db.listItemSubTasks.toArray(),
    db.listCategories.toArray(),
    db.folders.toArray(),
    db.tools.toArray(),
    db.energyEntries.toArray(),
    settingsRepo.getByUserId(user.id),
    db.budgetCategories.toArray(),
    db.budgetEntries.toArray(),
    db.budgetAccounts.toArray(),
    db.budgetDeposits.toArray(),
    db.budgetIncomeEntries.toArray(),
    db.manualTestResults.toArray(),
  ])

  return {
    version: SNAPSHOT_SCHEMA_VERSION,
    user,
    tasks,
    task_recurrences: taskRecurrences,
    task_exceptions: taskExceptions,
    lists,
    list_items: listItems,
    list_item_sub_tasks: listItemSubTasks,
    list_categories: listCategories,
    folders,
    tools,
    energy_entries: energyEntries,
    settings: settingsData,
    budget_categories: budgetCategories,
    budget_entries: budgetEntries,
    budget_accounts: budgetAccounts,
    budget_deposits: budgetDeposits,
    budget_income_entries: budgetIncomeEntries,
    manual_test_results: manualTestResults,
  }
}
