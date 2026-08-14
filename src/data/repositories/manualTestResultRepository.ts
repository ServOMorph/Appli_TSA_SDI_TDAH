import type { AppDatabase } from '@/data/db'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'

export class ManualTestResultRepository {
  private db: AppDatabase

  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(result: ManualTestResult): Promise<string> {
    return this.db.manualTestResults.add(result)
  }

  async getAll(): Promise<ManualTestResult[]> {
    return this.db.manualTestResults.toCollection().sortBy('created_at')
  }

  async getByTestId(testId: string): Promise<ManualTestResult[]> {
    return this.db.manualTestResults.where('test_id').equals(testId).sortBy('created_at')
  }
}
