import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'
import { BudgetIncomeEntryRepository } from './budgetIncomeEntryRepository'

describe('BudgetIncomeEntryRepository', () => {
  let db: AppDatabase
  let repo: BudgetIncomeEntryRepository

  const entry = (overrides: Partial<BudgetIncomeEntry> = {}): BudgetIncomeEntry => ({
    id: 'income-1',
    amount: 500,
    label: 'Salaire',
    date: '2026-07-21',
    created_at: '2026-07-21T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`budget-income-entry-${crypto.randomUUID()}`)
    repo = new BudgetIncomeEntryRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes an entry', async () => {
    await repo.create(entry())
    expect(await repo.getById('income-1')).toEqual(entry())

    await repo.update(entry({ amount: 600, label: 'Prime' }))
    expect(await repo.getById('income-1')).toMatchObject({ amount: 600, label: 'Prime' })

    await repo.delete('income-1')
    expect(await repo.getById('income-1')).toBeUndefined()
  })

  it('retrieves entries by period', async () => {
    await repo.create(entry({ id: 'outside', date: '2026-06-30' }))
    await repo.create(entry({ id: 'inside-later', date: '2026-07-25' }))
    await repo.create(entry({ id: 'inside-earlier', date: '2026-07-20' }))

    expect((await repo.getAll()).map((item) => item.id)).toEqual(['outside', 'inside-earlier', 'inside-later'])
    expect((await repo.getByPeriod('2026-07-20', '2026-07-25')).map((item) => item.id)).toEqual([
      'inside-earlier',
      'inside-later',
    ])
  })
})
