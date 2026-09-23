import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { BudgetDepositCategory } from '@/domain/entities/budgetDepositCategory'
import { BudgetDepositCategoryRepository } from './budgetDepositCategoryRepository'

describe('BudgetDepositCategoryRepository', () => {
  let db: AppDatabase
  let repo: BudgetDepositCategoryRepository

  const category = (overrides: Partial<BudgetDepositCategory> = {}): BudgetDepositCategory => ({
    id: 'category-1',
    account_id: 'account-1',
    name: 'Vacances',
    position: 0,
    created_at: '2026-07-21T00:00:00Z',
    updated_at: '2026-07-21T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`budget-deposit-category-${crypto.randomUUID()}`)
    repo = new BudgetDepositCategoryRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes a category', async () => {
    await repo.create(category())
    expect(await repo.getById('category-1')).toEqual(category())

    await repo.update(category({ name: 'Projets' }))
    expect(await repo.getById('category-1')).toMatchObject({ name: 'Projets' })

    await repo.delete('category-1')
    expect(await repo.getById('category-1')).toBeUndefined()
  })

  it('retrieves categories by account, ordered by position', async () => {
    await repo.create(category({ id: 'other-account-category', account_id: 'account-2', position: 5 }))
    await repo.create(category({ id: 'second', position: 1 }))
    await repo.create(category({ id: 'first', position: 0 }))

    expect((await repo.getByAccountId('account-1')).map((item) => item.id)).toEqual(['first', 'second'])
    expect((await repo.getAll()).map((item) => item.id)).toEqual(['first', 'second', 'other-account-category'])
  })
})
