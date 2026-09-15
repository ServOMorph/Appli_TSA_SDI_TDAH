import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { FeedbackMessage } from '@/domain/entities/feedbackMessage'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'
import { FeedbackMessageRepository } from './feedbackMessageRepository'

describe('FeedbackMessageRepository', () => {
  let db: AppDatabase
  let repo: FeedbackMessageRepository

  const message = (overrides: Partial<FeedbackMessage> = {}): FeedbackMessage => ({
    id: 'message-1',
    report_id: 'feedback-1',
    author: 'user',
    body: 'Toujours pas de retour visuel',
    created_at: '2026-09-14T10:00:00.000Z',
    sync_status: 'pending',
    last_attempt_at: null,
    read_at: null,
    ...overrides,
  })

  const report = (overrides: Partial<FeedbackReport> = {}): FeedbackReport => ({
    id: 'feedback-1',
    screen_code: 'E20',
    comment: 'Le bouton est masqué',
    image_blob: new Blob(['image']),
    image_path: null,
    image_bytes: 5,
    strokes: [],
    app_version: '5.133',
    created_at: '2026-09-14T09:00:00.000Z',
    sync_status: 'sent',
    last_attempt_at: null,
    resolution_status: 'open',
    validated_at: null,
    resolution_sync_status: 'sent',
    resolution_last_attempt_at: null,
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`feedback-message-${crypto.randomUUID()}`)
    repo = new FeedbackMessageRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('crée et liste les messages d’un retour par date de création', async () => {
    await repo.create(message({ id: 'later', created_at: '2026-09-14T11:00:00.000Z' }))
    await repo.create(message({ id: 'earlier', created_at: '2026-09-14T09:00:00.000Z' }))
    await repo.create(message({ id: 'other-report', report_id: 'feedback-2' }))

    expect((await repo.getByReport('feedback-1')).map((item) => item.id)).toEqual(['earlier', 'later'])
  })

  it('retourne les messages à synchroniser', async () => {
    await repo.create(message({ id: 'pending' }))
    await repo.create(message({ id: 'failed', sync_status: 'failed' }))
    await repo.create(message({ id: 'sent', sync_status: 'sent' }))

    expect((await repo.getToSync()).map((item) => item.id).sort()).toEqual(['failed', 'pending'])
  })

  it('met à jour le statut de synchronisation', async () => {
    await repo.create(message())

    await repo.markFailed('message-1', '2026-09-14T10:05:00.000Z')
    expect(await db.feedbackMessages.get('message-1')).toMatchObject({
      sync_status: 'failed',
      last_attempt_at: '2026-09-14T10:05:00.000Z',
    })

    await repo.markSent('message-1', '2026-09-14T10:06:00.000Z')
    expect(await db.feedbackMessages.get('message-1')).toMatchObject({
      sync_status: 'sent',
      last_attempt_at: '2026-09-14T10:06:00.000Z',
    })
  })

  it('enregistre les messages reçus du serveur de façon idempotente', async () => {
    const received = message({ id: 'agent-1', author: 'agent', body: 'Le correctif est en ligne', sync_status: 'sent' })
    await repo.saveReceived([received])
    await repo.saveReceived([received])

    expect(await db.feedbackMessages.get('agent-1')).toMatchObject({ body: 'Le correctif est en ligne' })
    expect(await db.feedbackMessages.count()).toBe(1)
  })

  it('ne remet pas à non lu un message déjà lu quand le serveur le renvoie', async () => {
    const received = message({ id: 'agent-1', author: 'agent', sync_status: 'sent' })
    await repo.saveReceived([received])
    await repo.markReportRead('feedback-1', '2026-09-14T12:00:00.000Z')

    await repo.saveReceived([received, message({ id: 'agent-2', author: 'agent', sync_status: 'sent' })])

    expect(await db.feedbackMessages.get('agent-1')).toMatchObject({ read_at: '2026-09-14T12:00:00.000Z' })
    expect(await db.feedbackMessages.get('agent-2')).toMatchObject({ read_at: null })
    expect(await db.feedbackMessages.count()).toBe(2)
  })

  it('liste les retours ayant un message non lu et les marque lus', async () => {
    await db.feedbackReports.bulkAdd([report({ id: 'feedback-1' }), report({ id: 'feedback-2' })])
    await repo.create(message({ id: 'unread', author: 'agent', report_id: 'feedback-1', read_at: null }))
    await repo.create(message({ id: 'read', author: 'user', report_id: 'feedback-2', read_at: '2026-09-14T10:00:00.000Z' }))

    expect(await repo.getUnreadReportIds()).toEqual(['feedback-1'])

    await repo.markReportRead('feedback-1', '2026-09-14T12:00:00.000Z')
    expect(await db.feedbackMessages.get('unread')).toMatchObject({ read_at: '2026-09-14T12:00:00.000Z' })
    expect(await repo.getUnreadReportIds()).toEqual([])
  })

  it('ignore les messages non lus des retours validés ou inconnus', async () => {
    await db.feedbackReports.bulkAdd([
      report({ id: 'open' }),
      report({ id: 'validated', resolution_status: 'validated', validated_at: '2026-09-14T11:00:00.000Z', resolution_sync_status: 'pending' }),
    ])
    await repo.create(message({ id: 'm-open', author: 'agent', report_id: 'open' }))
    await repo.create(message({ id: 'm-validated', author: 'agent', report_id: 'validated' }))
    await repo.create(message({ id: 'm-orphan', author: 'agent', report_id: 'missing' }))

    expect(await repo.getUnreadReportIds()).toEqual(['open'])
  })
})
