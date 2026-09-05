import type { AppDatabase } from '@/data/db'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'

export class FeedbackReportRepository {
  private db: AppDatabase

  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(report: FeedbackReport): Promise<string> {
    return this.db.feedbackReports.add(report)
  }

  async getAll(): Promise<FeedbackReport[]> {
    return this.db.feedbackReports.toCollection().sortBy('created_at')
  }

  async getPending(): Promise<FeedbackReport[]> {
    return this.db.feedbackReports.where('sync_status').equals('pending').sortBy('created_at')
  }

  async getToSync(): Promise<FeedbackReport[]> {
    return this.db.feedbackReports.where('sync_status').anyOf('pending', 'failed').sortBy('created_at')
  }

  async markImageUploaded(id: string, path: string): Promise<void> {
    await this.db.feedbackReports.update(id, { image_path: path })
  }

  async markSent(id: string, attemptedAt: string): Promise<void> {
    await this.db.feedbackReports.update(id, { sync_status: 'sent', last_attempt_at: attemptedAt })
  }

  async markFailed(id: string, attemptedAt: string): Promise<void> {
    await this.db.feedbackReports.update(id, { sync_status: 'failed', last_attempt_at: attemptedAt })
  }

  async markPending(id: string): Promise<void> {
    await this.db.feedbackReports.update(id, { sync_status: 'pending' })
  }
}
