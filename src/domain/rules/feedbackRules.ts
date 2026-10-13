import type { FeedbackReport } from '@/domain/entities/feedbackReport'

/** L'image est facultative : sans image, le commentaire est obligatoire. */
export function isFeedbackReportValid(
  report: Pick<FeedbackReport, 'screen_code' | 'comment' | 'image_blob' | 'image_bytes' | 'strokes'>,
): boolean {
  const hasComment = report.comment.trim().length > 0
  if (report.screen_code.trim().length === 0) return false
  if (report.image_blob === null) return hasComment
  return report.image_blob.size > 0 && report.image_bytes > 0 && (hasComment || report.strokes.length > 0)
}

const MAX_MESSAGE_LENGTH = 2000

export function isFeedbackMessageValid(body: string): boolean {
  const trimmed = body.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH
}

export function sentFeedbackIdsToPurge(
  reports: FeedbackReport[],
  referenceDate: Date,
  retentionDays = 30,
): string[] {
  const threshold = referenceDate.getTime() - retentionDays * 24 * 60 * 60 * 1000
  return reports
    .filter((report) => report.sync_status === 'sent' && Date.parse(report.created_at) < threshold)
    .map((report) => report.id)
}
