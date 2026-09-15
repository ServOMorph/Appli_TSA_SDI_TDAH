import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { grantSyncConsent } from '@/data/sync/syncConsent'

const mocks = vi.hoisted(() => ({
  getOpen: vi.fn().mockResolvedValue([
    { id: 'failed-1', screen_code: 'E10', comment: 'Blocage', sync_status: 'failed' },
  ]),
  markPending: vi.fn().mockResolvedValue(undefined),
  getUnreadReportIds: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/app/repositories', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/repositories')>()),
  feedbackReportRepo: { getOpen: mocks.getOpen, markPending: mocks.markPending },
  feedbackMessageRepo: { getUnreadReportIds: mocks.getUnreadReportIds },
}))
vi.mock('@/data/sync/feedbackClient', () => ({ syncFeedbackNow: vi.fn().mockResolvedValue(false) }))

import { E123FeedbackList } from '@/ui/screens/feedback/E123FeedbackList'

describe('E123FeedbackList', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.markPending.mockClear()
    mocks.getUnreadReportIds.mockClear()
  })
  afterEach(() => localStorage.clear())

  it('affiche un échec et permet de le relancer quand le partage est actif', async () => {
    grantSyncConsent()
    const { default: userEvent } = await import('@testing-library/user-event')
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' } }))
    expect(await screen.findByText('Échec d’envoi')).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Relancer' }))
    expect(mocks.markPending).toHaveBeenCalledWith('failed-1')
  })

  it('remplace l’échec par une invite à activer le partage quand il est désactivé', async () => {
    const goTo = vi.fn()
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' }, goTo }))
    expect(await screen.findByText('En attente d’activation du partage')).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Relancer' })).toBeNull()
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Confidentialité' }))
    expect(goTo).toHaveBeenCalledWith('settings-privacy')
  })

  it('navigue vers le détail au clic sur un retour', async () => {
    const goTo = vi.fn()
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' }, goTo }))
    const card = (await screen.findByText('E10')).closest('[role="button"]') as HTMLElement
    fireEvent.click(card)
    expect(goTo).toHaveBeenCalledWith({ name: 'feedback-detail', reportId: 'failed-1' })
  })

  it('affiche une pastille sur le retour ayant une réponse non lue', async () => {
    mocks.getUnreadReportIds.mockResolvedValue(['failed-1'])
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' } }))
    expect(await screen.findByLabelText('Nouvelle réponse')).toBeInTheDocument()
  })
})
