import type { AppDatabase } from '@/data/db'
import type { BudgetIncomeEntry } from '@/domain/entities/budgetIncomeEntry'

export class BudgetIncomeEntryRepository {
  private db: AppDatabase
  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(entry: BudgetIncomeEntry): Promise<string> {
    return this.db.budgetIncomeEntries.add(entry)
  }

  async getById(id: string): Promise<BudgetIncomeEntry | undefined> {
    return this.db.budgetIncomeEntries.get(id)
  }

  async getAll(): Promise<BudgetIncomeEntry[]> {
    return this.db.budgetIncomeEntries.orderBy('date').toArray()
  }

  async getByPeriod(startDate: string, endDate: string): Promise<BudgetIncomeEntry[]> {
    return this.db.budgetIncomeEntries.where('date').between(startDate, endDate, true, true).toArray()
  }

  async update(entry: BudgetIncomeEntry): Promise<void> {
    await this.db.budgetIncomeEntries.put(entry)
  }

  async delete(id: string): Promise<void> {
    await this.db.budgetIncomeEntries.delete(id)
  }
}
