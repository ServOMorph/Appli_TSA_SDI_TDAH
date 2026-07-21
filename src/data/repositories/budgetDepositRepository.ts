import type { AppDatabase } from '@/data/db'
import type { BudgetDeposit } from '@/domain/entities/budgetDeposit'

export class BudgetDepositRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(deposit: BudgetDeposit): Promise<string> {
    return this.db.budgetDeposits.add(deposit)
  }

  async getById(id: string): Promise<BudgetDeposit | undefined> {
    return this.db.budgetDeposits.get(id)
  }

  async getAll(): Promise<BudgetDeposit[]> {
    return this.db.budgetDeposits.orderBy('date').toArray()
  }

  async getByAccountId(accountId: string): Promise<BudgetDeposit[]> {
    return this.db.budgetDeposits.where('account_id').equals(accountId).sortBy('date')
  }

  async getByPeriod(startDate: string, endDate: string): Promise<BudgetDeposit[]> {
    return this.db.budgetDeposits.where('date').between(startDate, endDate, true, true).toArray()
  }

  async getByAccountAndPeriod(
    accountId: string,
    startDate: string,
    endDate: string,
  ): Promise<BudgetDeposit[]> {
    const deposits = await this.getByAccountId(accountId)
    return deposits.filter((deposit) => deposit.date >= startDate && deposit.date <= endDate)
  }

  async update(deposit: BudgetDeposit): Promise<void> {
    await this.db.budgetDeposits.put(deposit)
  }

  async delete(id: string): Promise<void> {
    await this.db.budgetDeposits.delete(id)
  }
}
