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
    resolution_status: 'open',
    validated_at: null,
    resolution_sync_status: 'sent',
    resolution_last_attempt_at: null,
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

  it('retourne uniquement les retours ouverts', async () => {
    await repo.create(report({ id: 'open' }))
    await repo.create(report({ id: 'validated', resolution_status: 'validated', validated_at: '2026-09-04T12:00:00.000Z' }))

    expect((await repo.getOpen()).map((item) => item.id)).toEqual(['open'])
  })

  it('valide un retour, le retire de la liste des retours ouverts et prépare sa clôture serveur', async () => {
    await repo.create(report())

    await repo.validate('feedback-1', '2026-09-04T12:00:00.000Z')

    expect(await db.feedbackReports.get('feedback-1')).toMatchObject({
      resolution_status: 'validated',
      validated_at: '2026-09-04T12:00:00.000Z',
      resolution_sync_status: 'pending',
    })
    expect(await repo.getOpen()).toEqual([])
  })

  it('retourne uniquement les clôtures à synchroniser, pour un retour déjà envoyé', async () => {
    await repo.create(report({ id: 'not-validated' }))
    await repo.create(report({ id: 'not-sent', sync_status: 'pending', resolution_status: 'validated', resolution_sync_status: 'pending' }))
    await repo.create(report({ id: 'to-close', sync_status: 'sent', resolution_status: 'validated', resolution_sync_status: 'pending' }))
    await repo.create(report({ id: 'already-closed', sync_status: 'sent', resolution_status: 'validated', resolution_sync_status: 'sent' }))
    await repo.create(report({ id: 'failed-once', sync_status: 'sent', resolution_status: 'validated', resolution_sync_status: 'failed' }))

    expect((await repo.getToCloseSync()).map((item) => item.id).sort()).toEqual(['failed-once', 'to-close'])
  })

  it('met à jour le statut de synchronisation de la clôture', async () => {
    await repo.create(report({ resolution_status: 'validated', resolution_sync_status: 'pending' }))

    await repo.markResolutionFailed('feedback-1', '2026-09-04T13:00:00.000Z')
    expect(await db.feedbackReports.get('feedback-1')).toMatchObject({
      resolution_sync_status: 'failed',
      resolution_last_attempt_at: '2026-09-04T13:00:00.000Z',
    })

    await repo.markResolutionSent('feedback-1', '2026-09-04T13:05:00.000Z')
    expect(await db.feedbackReports.get('feedback-1')).toMatchObject({
      resolution_sync_status: 'sent',
      resolution_last_attempt_at: '2026-09-04T13:05:00.000Z',
    })
  })
})
