import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'
import { FeedbackReportRepository } from './feedbackReportRepository'

describe('FeedbackReportRepository', () => {
  let db: AppDatabase
  let repo: FeedbackReportRepository

  const report = (overrides: Partial<FeedbackReport> = {}): FeedbackReport => ({
    id: 'feedback-1',
    screen_code: 'E20',
    comment: 'Le bouton est masqué',
    image_blob: new Blob(['image'], { type: 'image/jpeg' }),
    image_path: null,
    image_bytes: 5,
    strokes: [],
    app_version: '5.84',
    created_at: '2026-09-04T10:00:00.000Z',
    sync_status: 'pending',
    last_attempt_at: null,
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`feedback-report-${crypto.randomUUID()}`)
    repo = new FeedbackReportRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('crée et liste les retours par date de création', async () => {
    await repo.create(report({ id: 'later', created_at: '2026-09-04T11:00:00.000Z' }))
    await repo.create(report({ id: 'earlier', created_at: '2026-09-04T09:00:00.000Z' }))

    expect((await repo.getAll()).map((item) => item.id)).toEqual(['earlier', 'later'])
  })

  it('retourne uniquement les retours en attente', async () => {
    await repo.create(report({ id: 'pending' }))
    await repo.create(report({ id: 'failed', sync_status: 'failed' }))
    await repo.create(report({ id: 'sent', sync_status: 'sent' }))

    expect((await repo.getPending()).map((item) => item.id)).toEqual(['pending'])
  })

  it('retourne les retours à synchroniser et conserve le chemin déjà déposé', async () => {
    await repo.create(report({ id: 'pending' }))
    await repo.create(report({ id: 'failed', sync_status: 'failed' }))
    await repo.create(report({ id: 'sent', sync_status: 'sent' }))

    expect((await repo.getToSync()).map((item) => item.id).sort()).toEqual(['failed', 'pending'])
    await repo.markImageUploaded('failed', 'device-1/failed.jpg')
    expect((await db.feedbackReports.get('failed'))?.image_path).toBe('device-1/failed.jpg')
  })

  it('met à jour le statut après une tentative d’envoi', async () => {
    await repo.create(report())

    await repo.markFailed('feedback-1', '2026-09-04T10:10:00.000Z')
    expect(await db.feedbackReports.get('feedback-1')).toMatchObject({
      sync_status: 'failed',
      last_attempt_at: '2026-09-04T10:10:00.000Z',
    })

    await repo.markSent('feedback-1', '2026-09-04T10:11:00.000Z')
    expect(await db.feedbackReports.get('feedback-1')).toMatchObject({
      sync_status: 'sent',
      last_attempt_at: '2026-09-04T10:11:00.000Z',
    })
  })
})
