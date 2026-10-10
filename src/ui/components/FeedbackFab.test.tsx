import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeedbackFab } from '@/ui/components/FeedbackFab'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { makeAdminSettings, makeSettings } from '@/test/factories'

const adminSettings = makeAdminSettings('dev')

describe('FeedbackFab', () => {
  it('est disponible hors des écrans de retour et garde l’écran source', async () => {
    const ctx = makeAppContext({ screen: 'dashboard', route: { name: 'dashboard' }, settings: adminSettings })
    renderWithApp(<FeedbackFab />, ctx)
    const { default: userEvent } = await import('@testing-library/user-event')
    await userEvent.click(screen.getByRole('button', { name: 'Signaler un retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'feedback', sourceScreen: 'dashboard' })
  })

  it.each(['feedback', 'feedback-list', 'feedback-detail'] as const)('est masqué sur %s', (screenName) => {
    renderWithApp(<FeedbackFab />, makeAppContext({ screen: screenName, route: { name: screenName }, settings: adminSettings }))
    expect(screen.queryByRole('button', { name: 'Signaler un retour' })).toBeNull()
  })

  it('est masqué pour une identité admin sans mot de passe valide', () => {
    renderWithApp(
      <FeedbackFab />,
      makeAppContext({ screen: 'dashboard', route: { name: 'dashboard' }, settings: makeSettings({ tester_code: 'dev', admin_key: 'mauvaise-cle' }) }),
    )
    expect(screen.queryByRole('button', { name: 'Signaler un retour' })).toBeNull()
  })

  it.each([undefined, 'raphtest', 'satine'])('est masqué pour un testeur non admin (code %s)', (code) => {
    renderWithApp(
      <FeedbackFab />,
      makeAppContext({ screen: 'dashboard', route: { name: 'dashboard' }, settings: makeSettings({ tester_code: code }) }),
    )
    expect(screen.queryByRole('button', { name: 'Signaler un retour' })).toBeNull()
  })
})
