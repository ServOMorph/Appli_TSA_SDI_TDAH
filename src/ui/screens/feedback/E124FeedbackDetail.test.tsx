import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'

const REPORT = {
  id: 'report-1',
  screen_code: 'E10',
  comment: 'Le bouton est masqué',
  image_blob: new Blob(['image']),
  image_path: null,
  image_bytes: 5,
  strokes: [],
  app_version: '5.84',
  created_at: '2026-09-04T10:00:00.000Z',
  sync_status: 'sent' as const,
  last_attempt_at: null,
  resolution_status: 'open' as const,
  validated_at: null,
  resolution_sync_status: 'sent' as const,
  resolution_last_attempt_at: null,
}

const AGENT_MESSAGE = {
  id: 'message-1',
  report_id: 'report-1',
  author: 'agent' as const,
  body: 'Le correctif est en ligne, pouvez-vous vérifier ?',
  created_at: '2026-09-05T09:00:00.000Z',
  sync_status: 'sent' as const,
  last_attempt_at: null,
  read_at: null,
}

const mocks = vi.hoisted(() => ({
  getById: vi.fn().mockResolvedValue(undefined),
  validate: vi.fn().mockResolvedValue(undefined),
  getByReport: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(undefined),
  markReportRead: vi.fn().mockResolvedValue(undefined),
  syncFeedbackNow: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/app/repositories', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/repositories')>()),
  feedbackReportRepo: { getById: mocks.getById, validate: mocks.validate },
  feedbackMessageRepo: { getByReport: mocks.getByReport, create: mocks.create, markReportRead: mocks.markReportRead },
  newId: () => 'message-2',
}))
vi.mock('@/data/sync/feedbackClient', () => ({ syncFeedbackNow: mocks.syncFeedbackNow }))

import { E124FeedbackDetail } from '@/ui/screens/feedback/E124FeedbackDetail'

describe('E124FeedbackDetail', () => {
  beforeEach(() => {
    mocks.getById.mockReset().mockResolvedValue(REPORT)
    mocks.validate.mockClear()
    mocks.getByReport.mockReset().mockResolvedValue([AGENT_MESSAGE])
    mocks.create.mockClear()
    mocks.markReportRead.mockClear()
    mocks.syncFeedbackNow.mockClear()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:detail') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  })

  afterEach(() => localStorage.clear())

  it('affiche le fil avec le commentaire initial et la réponse de l’agent', async () => {
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' } }))
    expect(await screen.findByText('Le bouton est masqué')).toBeInTheDocument()
    expect(screen.getByText(AGENT_MESSAGE.body)).toBeInTheDocument()
  })

  it('marque le message de l’agent comme lu à l’ouverture', async () => {
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' } }))
    await screen.findByText('Le bouton est masqué')
    expect(mocks.markReportRead).toHaveBeenCalledWith('report-1', expect.any(String))
  })

  it('affiche un message si le retour n’existe plus', async () => {
    mocks.getById.mockResolvedValue(undefined)
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'inconnu' } }))
    expect(await screen.findByText('Ce retour n’existe plus.')).toBeInTheDocument()
  })

  it('ajoute un commentaire au fil', async () => {
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' } }))
    await screen.findByText('Le bouton est masqué')
    mocks.syncFeedbackNow.mockClear()
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.type(screen.getByLabelText('Ajouter un commentaire'), 'Toujours pas de retour visuel')
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ report_id: 'report-1', author: 'user', body: 'Toujours pas de retour visuel', sync_status: 'pending' }),
    )
    expect(mocks.syncFeedbackNow).toHaveBeenCalled()
  })

  it('valide le retour après confirmation et revient à la liste', async () => {
    const back = vi.fn()
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' }, back }))
    await screen.findByText('Le bouton est masqué')
    mocks.syncFeedbackNow.mockClear()
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByRole('dialog', { name: 'Valider ce retour' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
    expect(mocks.validate).toHaveBeenCalledWith('report-1', expect.any(String))
    expect(mocks.syncFeedbackNow).toHaveBeenCalled()
    expect(back).toHaveBeenCalledWith('feedback-list')
  })

  it('affiche une erreur si le commentaire ne peut pas être enregistré', async () => {
    mocks.create.mockRejectedValueOnce(new Error('quota exceeded'))
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' } }))
    await screen.findByText('Le bouton est masqué')
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.type(screen.getByLabelText('Ajouter un commentaire'), 'Toujours pas de retour visuel')
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Le commentaire n’a pas pu être enregistré sur cet appareil.')
  })

  it('masque le bouton Valider et explique pourquoi quand le retour n’est pas encore envoyé', async () => {
    mocks.getById.mockResolvedValue({ ...REPORT, sync_status: 'failed' as const })
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' } }))
    await screen.findByText('Le bouton est masqué')
    expect(screen.queryByRole('button', { name: 'Valider' })).toBeNull()
    expect(screen.getByText('La validation sera possible une fois ce retour envoyé.')).toBeInTheDocument()
  })

  it('affiche une erreur si la validation ne peut pas être enregistrée', async () => {
    mocks.validate.mockRejectedValueOnce(new Error('quota exceeded'))
    renderWithApp(<E124FeedbackDetail />, makeAppContext({ screen: 'feedback-detail', route: { name: 'feedback-detail', reportId: 'report-1' } }))
    await screen.findByText('Le bouton est masqué')
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('La validation n’a pas pu être enregistrée sur cet appareil.')
  })
})
