import type { AppDatabase } from '@/data/db'
import type { BudgetCategory, BudgetPeriod } from '@/domain/entities/budgetCategory'

export class BudgetCategoryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(category: BudgetCategory): Promise<string> {
    return this.db.budgetCategories.add(category)
  }

  async getById(id: string): Promise<BudgetCategory | undefined> {
    return this.db.budgetCategories.get(id)
  }

  async getAll(): Promise<BudgetCategory[]> {
    return this.db.budgetCategories.orderBy('position').toArray()
  }

  async getByPeriod(period: BudgetPeriod): Promise<BudgetCategory[]> {
    return this.db.budgetCategories.where('period').equals(period).sortBy('position')
  }

  async update(category: BudgetCategory): Promise<void> {
    await this.db.budgetCategories.put(category)
  }

  async delete(id: string): Promise<void> {
    await this.db.budgetCategories.delete(id)
  }
}
