import type { FeedbackReport } from '@/domain/entities/feedbackReport'

export function isFeedbackReportValid(
  report: Pick<FeedbackReport, 'screen_code' | 'comment' | 'image_blob' | 'image_bytes' | 'strokes'>,
): boolean {
  return (
    report.screen_code.trim().length > 0 &&
    report.image_blob.size > 0 &&
    report.image_bytes > 0 &&
    (report.comment.trim().length > 0 || report.strokes.length > 0)
  )
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
