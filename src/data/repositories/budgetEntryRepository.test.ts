import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'
import { BudgetEntryRepository } from './budgetEntryRepository'

describe('BudgetEntryRepository', () => {
  let db: AppDatabase
  let repo: BudgetEntryRepository

  const entry = (overrides: Partial<BudgetEntry> = {}): BudgetEntry => ({
    id: 'entry-1',
    category_id: 'courses',
    amount: 25,
    label: 'Intermarché',
    date: '2026-07-21',
    created_at: '2026-07-21T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`budget-entry-${crypto.randomUUID()}`)
    repo = new BudgetEntryRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes an entry', async () => {
    await repo.create(entry())
    expect(await repo.getById('entry-1')).toEqual(entry())

    await repo.update(entry({ amount: 30, label: 'Marché' }))
    expect(await repo.getById('entry-1')).toMatchObject({ amount: 30, label: 'Marché' })

    await repo.delete('entry-1')
    expect(await repo.getById('entry-1')).toBeUndefined()
  })

  it('retrieves entries by category and period', async () => {
    await repo.create(entry({ id: 'outside', date: '2026-06-30' }))
    await repo.create(entry({ id: 'inside-later', date: '2026-07-25' }))
    await repo.create(entry({ id: 'inside-earlier', date: '2026-07-20' }))
    await repo.create(entry({ id: 'other-category', category_id: 'plaisir', date: '2026-07-22' }))

    expect((await repo.getByCategoryId('courses')).map((item) => item.id)).toEqual([
      'outside',
      'inside-earlier',
      'inside-later',
    ])
    expect((await repo.getByPeriod('2026-07-20', '2026-07-25')).map((item) => item.id)).toEqual([
      'inside-earlier',
      'other-category',
      'inside-later',
    ])
    expect(
      (await repo.getByCategoryAndPeriod('courses', '2026-07-20', '2026-07-25')).map(
        (item) => item.id,
      ),
    ).toEqual(['inside-earlier', 'inside-later'])
  })
})
