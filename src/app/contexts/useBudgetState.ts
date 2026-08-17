import { useState } from 'react'
import {
  budgetAccountRepo,
  budgetCategoryRepo,
  budgetDepositRepo,
  budgetEntryRepo,
  budgetIncomeEntryRepo,
  newId,
  todayDate,
} from '@/app/repositories'
import type { BudgetCategory, BudgetCategoryKind, BudgetPeriod } from '@/domain/entities/budgetCategory'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'

export function useBudgetState() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [budgetAccounts, setBudgetAccounts] = useState<BudgetAccount[]>([])
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([])
  const [budgetDeposits, setBudgetDeposits] = useState<BudgetDeposit[]>([])
  const [budgetIncomeEntries, setBudgetIncomeEntries] = useState<BudgetIncomeEntry[]>([])

  async function load() {
    const [categories, accounts, entries, deposits, incomeEntries] = await Promise.all([
      budgetCategoryRepo.getAll(),
      budgetAccountRepo.getAll(),
      budgetEntryRepo.getAll(),
      budgetDepositRepo.getAll(),
      budgetIncomeEntryRepo.getAll(),
    ])
    setBudgetCategories(categories)
    setBudgetAccounts(accounts)
    setBudgetEntries(entries)
    setBudgetDeposits(deposits)
    setBudgetIncomeEntries(incomeEntries)
  }

  function reset() {
    setBudgetCategories([])
    setBudgetAccounts([])
    setBudgetEntries([])
    setBudgetDeposits([])
    setBudgetIncomeEntries([])
  }

  async function createBudgetCategory(
    name: string,
    kind: BudgetCategoryKind,
    period: BudgetPeriod,
    amount: number,
  ) {
    const trimmed = name.trim()
    if (!trimmed || !Number.isFinite(amount) || amount <= 0) return
    const now = new Date().toISOString()
    const category: BudgetCategory = {
      id: newId(),
      name: trimmed,
      kind,
      period,
      amount,
      position: budgetCategories.filter((item) => item.period === period).length,
      created_at: now,
      updated_at: now,
    }
    await budgetCategoryRepo.create(category)
    setBudgetCategories((previous) => [...previous, category])
  }

  async function renameBudgetCategory(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const category = budgetCategories.find((item) => item.id === id)
    if (!category) return
    const updated = { ...category, name: trimmed, updated_at: new Date().toISOString() }
    await budgetCategoryRepo.update(updated)
    setBudgetCategories((previous) => previous.map((item) => (item.id === id ? updated : item)))
  }

  async function updateBudgetCategoryAmount(id: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return
    const category = budgetCategories.find((item) => item.id === id)
    if (!category) return
    const updated = { ...category, amount, updated_at: new Date().toISOString() }
    await budgetCategoryRepo.update(updated)
    setBudgetCategories((previous) => previous.map((item) => (item.id === id ? updated : item)))
  }

  async function deleteBudgetCategory(id: string, confirmed = false): Promise<'deleted' | 'needs_confirmation'> {
    const entries = await budgetEntryRepo.getByCategoryId(id)
    if (entries.length > 0 && !confirmed) return 'needs_confirmation'
    await Promise.all(entries.map((entry) => budgetEntryRepo.delete(entry.id)))
    await budgetCategoryRepo.delete(id)
    setBudgetCategories((previous) => previous.filter((item) => item.id !== id))
    setBudgetEntries((previous) => previous.filter((item) => item.category_id !== id))
    return 'deleted'
  }

  async function createBudgetAccount(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    const account: BudgetAccount = { id: newId(), name: trimmed, created_at: now, updated_at: now }
    await budgetAccountRepo.create(account)
    setBudgetAccounts((previous) => [...previous, account])
  }

  async function renameBudgetAccount(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const account = budgetAccounts.find((item) => item.id === id)
    if (!account) return
    const updated = { ...account, name: trimmed, updated_at: new Date().toISOString() }
    await budgetAccountRepo.update(updated)
    setBudgetAccounts((previous) => previous.map((item) => (item.id === id ? updated : item)))
  }

  async function deleteBudgetAccount(id: string, confirmed = false): Promise<'deleted' | 'needs_confirmation'> {
    const deposits = await budgetDepositRepo.getByAccountId(id)
    if (deposits.length > 0 && !confirmed) return 'needs_confirmation'
    await Promise.all(deposits.map((deposit) => budgetDepositRepo.delete(deposit.id)))
    await budgetAccountRepo.delete(id)
    setBudgetAccounts((previous) => previous.filter((item) => item.id !== id))
    setBudgetDeposits((previous) => previous.filter((item) => item.account_id !== id))
    return 'deleted'
  }

  async function createBudgetEntry(categoryId: string, amount: number, label?: string, date = todayDate()) {
    if (!Number.isFinite(amount) || amount <= 0) return
    const entry: BudgetEntry = {
      id: newId(),
      category_id: categoryId,
      amount,
      label: label?.trim() || undefined,
      date,
      created_at: new Date().toISOString(),
    }
    await budgetEntryRepo.create(entry)
    setBudgetEntries(await budgetEntryRepo.getAll())
  }

  async function deleteBudgetEntry(id: string) {
    await budgetEntryRepo.delete(id)
    setBudgetEntries(await budgetEntryRepo.getAll())
  }

  async function createBudgetDeposit(
    accountId: string,
    amount: number,
    period: BudgetPeriod = 'month',
    date = todayDate(),
  ) {
    if (!Number.isFinite(amount) || amount === 0) return
    const deposit: BudgetDeposit = {
      id: newId(),
      account_id: accountId,
      amount,
      period,
      date,
      created_at: new Date().toISOString(),
    }
    await budgetDepositRepo.create(deposit)
    setBudgetDeposits(await budgetDepositRepo.getAll())
  }

  async function deleteBudgetDeposit(id: string) {
    await budgetDepositRepo.delete(id)
    setBudgetDeposits(await budgetDepositRepo.getAll())
  }

  async function createBudgetIncomeEntry(amount: number, label?: string, date = todayDate()) {
    if (!Number.isFinite(amount) || amount <= 0) return
    const entry: BudgetIncomeEntry = {
      id: newId(),
      amount,
      label: label?.trim() || undefined,
      date,
      created_at: new Date().toISOString(),
    }
    await budgetIncomeEntryRepo.create(entry)
    setBudgetIncomeEntries(await budgetIncomeEntryRepo.getAll())
  }

  async function deleteBudgetIncomeEntry(id: string) {
    await budgetIncomeEntryRepo.delete(id)
    setBudgetIncomeEntries(await budgetIncomeEntryRepo.getAll())
  }

  return {
    budgetCategories,
    budgetAccounts,
    budgetEntries,
    budgetDeposits,
    budgetIncomeEntries,
    createBudgetCategory,
    renameBudgetCategory,
    updateBudgetCategoryAmount,
    deleteBudgetCategory,
    createBudgetAccount,
    renameBudgetAccount,
    deleteBudgetAccount,
    createBudgetEntry,
    deleteBudgetEntry,
    createBudgetDeposit,
    deleteBudgetDeposit,
    createBudgetIncomeEntry,
    deleteBudgetIncomeEntry,
    load,
    reset,
  }
}
