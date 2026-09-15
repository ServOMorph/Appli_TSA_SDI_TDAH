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

  async getById(id: string): Promise<FeedbackReport | undefined> {
    return this.db.feedbackReports.get(id)
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

  async getOpen(): Promise<FeedbackReport[]> {
    return this.db.feedbackReports
      .filter((report) => report.resolution_status === 'open')
      .sortBy('created_at')
  }

  async validate(id: string, validatedAt: string): Promise<void> {
    await this.db.feedbackReports.update(id, {
      resolution_status: 'validated',
      validated_at: validatedAt,
      resolution_sync_status: 'pending',
    })
  }

  async getToCloseSync(): Promise<FeedbackReport[]> {
    return this.db.feedbackReports
      .filter((report) =>
        report.resolution_status === 'validated' &&
        report.sync_status === 'sent' &&
        report.resolution_sync_status !== 'sent',
      )
      .sortBy('created_at')
  }

  async markResolutionSent(id: string, attemptedAt: string): Promise<void> {
    await this.db.feedbackReports.update(id, { resolution_sync_status: 'sent', resolution_last_attempt_at: attemptedAt })
  }

  async markResolutionFailed(id: string, attemptedAt: string): Promise<void> {
    await this.db.feedbackReports.update(id, { resolution_sync_status: 'failed', resolution_last_attempt_at: attemptedAt })
  }
}
