export type FeedbackSyncStatus = 'pending' | 'sent' | 'failed'

export interface FeedbackPoint {
  x: number
  y: number
}

export interface FeedbackStroke {
  points: FeedbackPoint[]
}

export interface FeedbackReport {
  id: string
  screen_code: string
  comment: string
  image_blob: Blob
  image_path: string | null
  image_bytes: number
  strokes: FeedbackStroke[]
  app_version: string
  created_at: string
  sync_status: FeedbackSyncStatus
  last_attempt_at: string | null
}
