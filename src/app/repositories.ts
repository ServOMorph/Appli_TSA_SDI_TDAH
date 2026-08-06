import { AppDatabase } from '@/data/db'
import { UserRepository } from '@/data/repositories/userRepository'
import { TaskRepository } from '@/data/repositories/taskRepository'
import { EnergyEntryRepository } from '@/data/repositories/energyEntryRepository'
import { SettingsRepository } from '@/data/repositories/settingsRepository'
import { ListRepository } from '@/data/repositories/listRepository'
import { ListItemRepository } from '@/data/repositories/listItemRepository'
import { BudgetCategoryRepository } from '@/data/repositories/budgetCategoryRepository'
import { BudgetEntryRepository } from '@/data/repositories/budgetEntryRepository'
import { BudgetAccountRepository } from '@/data/repositories/budgetAccountRepository'
import { BudgetDepositRepository } from '@/data/repositories/budgetDepositRepository'
import { TaskRecurrenceRepository } from '@/data/repositories/taskRecurrenceRepository'
import { TaskExceptionRepository } from '@/data/repositories/taskExceptionRepository'
import { FolderRepository } from '@/data/repositories/folderRepository'
import { ToolRepository } from '@/data/repositories/toolRepository'

export const db = new AppDatabase()
export const userRepo = new UserRepository(db)
export const taskRepo = new TaskRepository(db)
export const taskRecurrenceRepo = new TaskRecurrenceRepository(db)
export const taskExceptionRepo = new TaskExceptionRepository(db)
export const energyRepo = new EnergyEntryRepository(db)
export const settingsRepo = new SettingsRepository(db)
export const listRepo = new ListRepository(db)
export const listItemRepo = new ListItemRepository(db)
export const budgetCategoryRepo = new BudgetCategoryRepository(db)
export const budgetEntryRepo = new BudgetEntryRepository(db)
export const budgetAccountRepo = new BudgetAccountRepository(db)
export const budgetDepositRepo = new BudgetDepositRepository(db)
export const folderRepo = new FolderRepository(db)
export const toolRepo = new ToolRepository(db)

export function todayDate(): string {
  if (import.meta.env.DEV) {
    const fake = localStorage.getItem('dev_fake_date')
    if (fake) return fake
  }
  return new Date().toISOString().slice(0, 10)
}

export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  return [...b]
    .map((v, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + v.toString(16).padStart(2, '0'))
    .join('')
}
