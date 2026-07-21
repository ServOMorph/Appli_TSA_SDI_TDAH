import type { AppDatabase } from '@/data/db'
import type { BudgetEntry } from '@/domain/entities/budgetEntry'

export class BudgetEntryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(entry: BudgetEntry): Promise<string> {
    return this.db.budgetEntries.add(entry)
  }

  async getById(id: string): Promise<BudgetEntry | undefined> {
    return this.db.budgetEntries.get(id)
  }

  async getAll(): Promise<BudgetEntry[]> {
    return this.db.budgetEntries.orderBy('date').toArray()
  }

  async getByCategoryId(categoryId: string): Promise<BudgetEntry[]> {
    return this.db.budgetEntries.where('category_id').equals(categoryId).sortBy('date')
  }

  async getByPeriod(startDate: string, endDate: string): Promise<BudgetEntry[]> {
    return this.db.budgetEntries.where('date').between(startDate, endDate, true, true).toArray()
  }

  async getByCategoryAndPeriod(
    categoryId: string,
    startDate: string,
    endDate: string,
  ): Promise<BudgetEntry[]> {
    const entries = await this.getByCategoryId(categoryId)
    return entries.filter((entry) => entry.date >= startDate && entry.date <= endDate)
  }

  async update(entry: BudgetEntry): Promise<void> {
    await this.db.budgetEntries.put(entry)
  }

  async delete(id: string): Promise<void> {
    await this.db.budgetEntries.delete(id)
  }
}
