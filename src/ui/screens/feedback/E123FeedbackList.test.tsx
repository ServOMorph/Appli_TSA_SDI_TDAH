import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'

const mocks = vi.hoisted(() => ({
  getAll: vi.fn().mockResolvedValue([
    { id: 'failed-1', screen_code: 'E10', comment: 'Blocage', sync_status: 'failed' },
  ]),
  markPending: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/app/repositories', () => ({ feedbackReportRepo: mocks }))
vi.mock('@/data/sync/feedbackClient', () => ({ syncFeedbackNow: vi.fn().mockResolvedValue(false) }))

import { E123FeedbackList } from '@/ui/screens/feedback/E123FeedbackList'

describe('E123FeedbackList', () => {
  it('affiche un échec et permet de le relancer', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    renderWithApp(<E123FeedbackList />, makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' } }))
    expect(await screen.findByText('Échec d’envoi')).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Relancer' }))
    expect(mocks.markPending).toHaveBeenCalledWith('failed-1')
  })
})
