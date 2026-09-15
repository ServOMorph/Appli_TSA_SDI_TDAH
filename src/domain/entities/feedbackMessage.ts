export type FeedbackMessageAuthor = 'user' | 'agent'
export type FeedbackMessageSyncStatus = 'pending' | 'sent' | 'failed'

export interface FeedbackMessage {
  id: string
  report_id: string
  author: FeedbackMessageAuthor
  body: string
  created_at: string
  sync_status: FeedbackMessageSyncStatus
  last_attempt_at: string | null
  read_at: string | null
}
