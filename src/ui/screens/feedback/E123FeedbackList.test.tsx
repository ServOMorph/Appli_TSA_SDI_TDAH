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
  hasUnseenWhatsNew: vi.fn().mockReturnValue(false),
  markWhatsNewSeen: vi.fn(),
}))

vi.mock('@/app/repositories', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/repositories')>()),
  feedbackReportRepo: { getOpen: mocks.getOpen, markPending: mocks.markPending },
  feedbackMessageRepo: { getUnreadReportIds: mocks.getUnreadReportIds },
}))
vi.mock('@/data/sync/feedbackClient', () => ({ syncFeedbackNow: vi.fn().mockResolvedValue(false) }))
vi.mock('@/domain/data/whatsNew', () => ({
  WHATS_NEW: ['Nouvelle fonctionnalité de test'],
  hasUnseenWhatsNew: mocks.hasUnseenWhatsNew,
  markWhatsNewSeen: mocks.markWhatsNewSeen,
}))

import { E123FeedbackList } from '@/ui/screens/feedback/E123FeedbackList'

describe('E123FeedbackList', () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.markPending.mockClear()
    mocks.getUnreadReportIds.mockClear()
    mocks.hasUnseenWhatsNew.mockReturnValue(false)
    mocks.markWhatsNewSeen.mockClear()
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

  it('place le bouton Nouveau retour au-dessus de la liste des retours (#9a8f67a9)', async () => {
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' } }))
    const card = (await screen.findByText('E10')).closest('[role="button"]') as HTMLElement
    const newFeedbackButton = screen.getByRole('button', { name: 'Nouveau retour' })
    expect(newFeedbackButton.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

  it('n’affiche pas de pastille sur le bouton Nouveautés quand la version courante a déjà été vue', async () => {
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' } }))
    expect(await screen.findByRole('button', { name: 'Nouveautés' })).toBeDefined()
  })

  it('affiche une pastille sur le bouton Nouveautés tant que la version courante n’a pas été vue, et l’ouverture de la modale la marque vue', async () => {
    mocks.hasUnseenWhatsNew.mockReturnValue(true)
    const { default: userEvent } = await import('@testing-library/user-event')
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' } }))
    const button = await screen.findByRole('button', { name: 'Nouveautés, non lu' })
    await userEvent.click(button)
    expect(screen.getByRole('dialog', { name: 'Nouveautés' })).toBeInTheDocument()
    expect(screen.getByText('Nouvelle fonctionnalité de test')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(mocks.markWhatsNewSeen).toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Nouveautés' })).toBeNull()
  })
})
