import type { AppDatabase } from '@/data/db'
import type { FeedbackMessage } from '@/domain/entities/feedbackMessage'

export class FeedbackMessageRepository {
  private db: AppDatabase

  constructor(db: AppDatabase) {
    this.db = db
  }

  async create(message: FeedbackMessage): Promise<string> {
    return this.db.feedbackMessages.add(message)
  }

  async getByReport(reportId: string): Promise<FeedbackMessage[]> {
    return this.db.feedbackMessages.where('report_id').equals(reportId).sortBy('created_at')
  }

  async getToSync(): Promise<FeedbackMessage[]> {
    return this.db.feedbackMessages.where('sync_status').anyOf('pending', 'failed').sortBy('created_at')
  }

  async markSent(id: string, attemptedAt: string): Promise<void> {
    await this.db.feedbackMessages.update(id, { sync_status: 'sent', last_attempt_at: attemptedAt })
  }

  async markFailed(id: string, attemptedAt: string): Promise<void> {
    await this.db.feedbackMessages.update(id, { sync_status: 'failed', last_attempt_at: attemptedAt })
  }

  /**
   * Insertion idempotente des messages recus du serveur (cle primaire = identifiant serveur).
   * Un message deja present est laisse tel quel : le serveur renvoie le dernier message a chaque
   * cycle (curseur inclusif) et ne connait pas l'etat de lecture local, qu'un bulkPut ecraserait.
   */
  async saveReceived(messages: FeedbackMessage[]): Promise<void> {
    if (messages.length === 0) return
    await this.db.transaction('rw', this.db.feedbackMessages, async () => {
      const existing = await this.db.feedbackMessages.bulkGet(messages.map((message) => message.id))
      const unknown = messages.filter((_, index) => existing[index] === undefined)
      if (unknown.length > 0) await this.db.feedbackMessages.bulkAdd(unknown)
    })
  }

  /** Retours encore ouverts ayant au moins un message non lu : un retour valide ne signale plus rien. */
  async getUnreadReportIds(): Promise<string[]> {
    const unread = await this.db.feedbackMessages.filter((message) => message.read_at === null).toArray()
    const reportIds = [...new Set(unread.map((message) => message.report_id))]
    if (reportIds.length === 0) return []
    const reports = await this.db.feedbackReports.bulkGet(reportIds)
    return reportIds.filter((_, index) => reports[index]?.resolution_status === 'open')
  }

  async markReportRead(reportId: string, readAt: string): Promise<void> {
    await this.db.feedbackMessages
      .where('report_id')
      .equals(reportId)
      .filter((message) => message.read_at === null)
      .modify({ read_at: readAt })
  }
}
