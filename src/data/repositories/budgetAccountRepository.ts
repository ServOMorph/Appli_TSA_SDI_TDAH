import type { AppDatabase } from '@/data/db'
import type { BudgetAccount } from '@/domain/entities/budgetAccount'

export class BudgetAccountRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(account: BudgetAccount): Promise<string> {
    return this.db.budgetAccounts.add(account)
  }

  async getById(id: string): Promise<BudgetAccount | undefined> {
    return this.db.budgetAccounts.get(id)
  }

  async getAll(): Promise<BudgetAccount[]> {
    return this.db.budgetAccounts.toArray()
  }

  async update(account: BudgetAccount): Promise<void> {
    await this.db.budgetAccounts.put(account)
  }

  async delete(id: string): Promise<void> {
    await this.db.budgetAccounts.delete(id)
  }
}
