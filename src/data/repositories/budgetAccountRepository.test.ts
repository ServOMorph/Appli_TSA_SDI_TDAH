import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'
import { BudgetAccountRepository } from './budgetAccountRepository'

describe('BudgetAccountRepository', () => {
  let db: AppDatabase
  let repo: BudgetAccountRepository

  const account = (overrides: Partial<BudgetAccount> = {}): BudgetAccount => ({
    id: 'account-1',
    name: 'Livret A',
    created_at: '2026-07-21T00:00:00Z',
    updated_at: '2026-07-21T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`budget-account-${crypto.randomUUID()}`)
    repo = new BudgetAccountRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes an account', async () => {
    await repo.create(account())
    expect(await repo.getById('account-1')).toEqual(account())

    await repo.update(account({ name: 'Épargne' }))
    expect(await repo.getById('account-1')).toMatchObject({ name: 'Épargne' })

    await repo.delete('account-1')
    expect(await repo.getById('account-1')).toBeUndefined()
  })

  it('retrieves all accounts', async () => {
    await repo.create(account())
    await repo.create(account({ id: 'account-2', name: 'Livret jeune' }))

    expect(await repo.getAll()).toHaveLength(2)
  })
})
