import { describe, expect, it } from 'vitest'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'
import { isFeedbackReportValid, sentFeedbackIdsToPurge } from './feedbackRules'

function report(overrides: Partial<FeedbackReport> = {}): FeedbackReport {
  return {
    id: 'feedback-1',
    screen_code: 'E20',
    comment: 'Le bouton est masqué',
    image_blob: new Blob(['image'], { type: 'image/jpeg' }),
    image_path: null,
    image_bytes: 5,
    strokes: [],
    app_version: '5.84',
    created_at: '2026-08-01T10:00:00.000Z',
    sync_status: 'sent',
    last_attempt_at: '2026-08-01T10:10:00.000Z',
    ...overrides,
  }
}

describe('isFeedbackReportValid', () => {
  it('exige une image, un code d’écran et un commentaire ou une annotation', () => {
    expect(isFeedbackReportValid(report())).toBe(true)
    expect(isFeedbackReportValid(report({ screen_code: '  ' }))).toBe(false)
    expect(isFeedbackReportValid(report({ image_blob: new Blob(), image_bytes: 0 }))).toBe(false)
    expect(isFeedbackReportValid(report({ comment: ' ', strokes: [] }))).toBe(false)
    expect(isFeedbackReportValid(report({ comment: ' ', strokes: [{ points: [{ x: 1, y: 2 }] }] }))).toBe(true)
  })
})

describe('sentFeedbackIdsToPurge', () => {
  it('retourne seulement les retours envoyés au-delà de la rétention', () => {
    const reports = [
      report({ id: 'old-sent', created_at: '2026-08-01T10:00:00.000Z' }),
      report({ id: 'recent-sent', created_at: '2026-08-25T10:00:00.000Z' }),
      report({ id: 'old-pending', sync_status: 'pending' }),
    ]

    expect(sentFeedbackIdsToPurge(reports, new Date('2026-09-04T10:00:00.000Z'))).toEqual(['old-sent'])
  })
})
