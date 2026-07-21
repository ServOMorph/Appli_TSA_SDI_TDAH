import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { BudgetCategory } from '@/domain/entities/budgetCategory'
import { BudgetCategoryRepository } from './budgetCategoryRepository'

describe('BudgetCategoryRepository', () => {
  let db: AppDatabase
  let repo: BudgetCategoryRepository

  const category = (overrides: Partial<BudgetCategory> = {}): BudgetCategory => ({
    id: 'category-1',
    name: 'Courses',
    kind: 'expense',
    period: 'week',
    amount: 60,
    position: 0,
    created_at: '2026-07-21T00:00:00Z',
    updated_at: '2026-07-21T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`budget-category-${crypto.randomUUID()}`)
    repo = new BudgetCategoryRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes a category', async () => {
    await repo.create(category())
    expect(await repo.getById('category-1')).toEqual(category())

    await repo.update(category({ name: 'Alimentation', amount: 70 }))
    expect(await repo.getById('category-1')).toMatchObject({ name: 'Alimentation', amount: 70 })

    await repo.delete('category-1')
    expect(await repo.getById('category-1')).toBeUndefined()
  })

  it('retrieves categories by period, kind and position', async () => {
    await repo.create(
      category({
        id: 'monthly-income',
        name: 'Salaire',
        kind: 'income',
        period: 'month',
        position: 1,
      }),
    )
    await repo.create(category({ id: 'weekly-expense', position: 0 }))

    expect((await repo.getAll()).map((item) => item.id)).toEqual([
      'weekly-expense',
      'monthly-income',
    ])
    expect((await repo.getByPeriod('week')).map((item) => item.id)).toEqual(['weekly-expense'])
    expect((await repo.getByKind('income')).map((item) => item.id)).toEqual(['monthly-income'])
  })
})
