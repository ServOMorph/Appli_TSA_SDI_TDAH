import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'
import { BudgetDepositRepository } from './budgetDepositRepository'

describe('BudgetDepositRepository', () => {
  let db: AppDatabase
  let repo: BudgetDepositRepository

  const deposit = (overrides: Partial<BudgetDeposit> = {}): BudgetDeposit => ({
    id: 'deposit-1',
    account_id: 'livret-a',
    amount: 50,
    date: '2026-07-21',
    created_at: '2026-07-21T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`budget-deposit-${crypto.randomUUID()}`)
    repo = new BudgetDepositRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes a deposit', async () => {
    await repo.create(deposit())
    expect(await repo.getById('deposit-1')).toEqual(deposit())

    await repo.update(deposit({ amount: 75 }))
    expect(await repo.getById('deposit-1')).toMatchObject({ amount: 75 })

    await repo.delete('deposit-1')
    expect(await repo.getById('deposit-1')).toBeUndefined()
  })

  it('retrieves deposits by account and period', async () => {
    await repo.create(deposit({ id: 'outside', date: '2026-06-30' }))
    await repo.create(deposit({ id: 'inside-later', date: '2026-07-25' }))
    await repo.create(deposit({ id: 'inside-earlier', date: '2026-07-20' }))
    await repo.create(
      deposit({ id: 'other-account', account_id: 'livret-jeune', date: '2026-07-22' }),
    )

    expect((await repo.getByAccountId('livret-a')).map((item) => item.id)).toEqual([
      'outside',
      'inside-earlier',
      'inside-later',
    ])
    expect((await repo.getByPeriod('2026-07-20', '2026-07-25')).map((item) => item.id)).toEqual([
      'inside-earlier',
      'other-account',
      'inside-later',
    ])
    expect(
      (await repo.getByAccountAndPeriod('livret-a', '2026-07-20', '2026-07-25')).map(
        (item) => item.id,
      ),
    ).toEqual(['inside-earlier', 'inside-later'])
  })
  it("ne crée aucun mouvement d'un virement si l'un des deux échoue", async () => {
    await repo.create(deposit({ id: 'existing' }))
    await expect(
      repo.createMany([deposit({ id: 'new-leg', transfer_id: 't1' }), deposit({ id: 'existing', transfer_id: 't1' })]),
    ).rejects.toThrow()
    expect((await repo.getAll()).map((item) => item.id)).toEqual(['existing'])
  })

  it('supprime plusieurs mouvements en une transaction', async () => {
    await repo.createMany([deposit({ id: 'a', transfer_id: 't1' }), deposit({ id: 'b', amount: -50, transfer_id: 't1' })])
    await repo.deleteMany(['a', 'b'])
    expect(await repo.getAll()).toEqual([])
  })
})
