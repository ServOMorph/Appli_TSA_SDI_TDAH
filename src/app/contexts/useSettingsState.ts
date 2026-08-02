import { useEffect, useState } from 'react'
import { db, newId, settingsRepo, userRepo } from '@/app/repositories'
import type { Settings } from '@/domain/entities/settings'
import type { User, ProfileType } from '@/domain/entities/user'

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
      local_encryption: false,
    }
    await userRepo.create(user)
    await settingsRepo.create(defaultSettings)
    setCurrentUser(user)
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
    const [user, tasks, lists, listItems, energyEntries, settingsData, categories, entries, accounts, deposits] = await Promise.all([
      userRepo.getFirst(),
      db.tasks.toArray(),
      db.lists.toArray(),
      db.listItems.toArray(),
      db.energyEntries.toArray(),
      settingsRepo.getByUserId(currentUser.id),
      db.budgetCategories.toArray(),
      db.budgetEntries.toArray(),
      db.budgetAccounts.toArray(),
      db.budgetDeposits.toArray(),
    ])
    const payload = {
      export_date: new Date().toISOString(),
      version: '3.0',
      user,
      tasks,
      lists,
      list_items: listItems,
      energy_entries: energyEntries,
      settings: settingsData,
      budget_categories: categories,
      budget_entries: entries,
      budget_accounts: accounts,
      budget_deposits: deposits,
    }
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
      db.budgetCategories.clear(),
      db.budgetEntries.clear(),
      db.budgetAccounts.clear(),
      db.budgetDeposits.clear(),
    ])
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
    clearDatabase,
    completeOnboarding,
    reset,
  }
}
