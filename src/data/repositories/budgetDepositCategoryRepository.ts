import type { AppDatabase } from '@/data/db'
import type { BudgetDepositCategory } from '@/domain/entities/budgetDepositCategory'

export class BudgetDepositCategoryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(category: BudgetDepositCategory): Promise<string> {
    return this.db.budgetDepositCategories.add(category)
  }

  async getById(id: string): Promise<BudgetDepositCategory | undefined> {
    return this.db.budgetDepositCategories.get(id)
  }

  async getAll(): Promise<BudgetDepositCategory[]> {
    return this.db.budgetDepositCategories.orderBy('position').toArray()
  }

  async getByAccountId(accountId: string): Promise<BudgetDepositCategory[]> {
    return this.db.budgetDepositCategories.where('account_id').equals(accountId).sortBy('position')
  }

  async update(category: BudgetDepositCategory): Promise<void> {
    await this.db.budgetDepositCategories.put(category)
  }

  async delete(id: string): Promise<void> {
    await this.db.budgetDepositCategories.delete(id)
  }
}
