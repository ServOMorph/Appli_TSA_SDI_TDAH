import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeedbackFab } from '@/ui/components/FeedbackFab'
import { makeAppContext, renderWithApp } from '@/test/testUtils'

describe('FeedbackFab', () => {
  it('est disponible hors des écrans de retour et garde l’écran source', async () => {
    const ctx = makeAppContext({ screen: 'dashboard', route: { name: 'dashboard' } })
    renderWithApp(<FeedbackFab />, ctx)
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.click(screen.getByRole('button', { name: 'Signaler un retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'feedback', sourceScreen: 'dashboard' })
  })

  it.each(['feedback', 'feedback-list'] as const)('est masqué sur %s', (screenName) => {
    renderWithApp(<FeedbackFab />, makeAppContext({ screen: screenName, route: { name: screenName } }))
    expect(screen.queryByRole('button', { name: 'Signaler un retour' })).toBeNull()
  })
})
