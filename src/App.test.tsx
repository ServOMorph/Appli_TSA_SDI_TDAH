import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { makeSettings } from '@/test/factories'
import { AppScreens, activeTabFor, NO_NAV_SCREENS } from './App'

describe('activeTabFor', () => {
  it('associe chaque écran à son onglet (N1)', () => {
    expect(activeTabFor('dashboard')).toBe('dashboard')
    expect(activeTabFor('planning')).toBe('dashboard')
    expect(activeTabFor('inbox')).toBe('inbox')
    expect(activeTabFor('settings')).toBe('settings')
    expect(activeTabFor('tools')).toBeNull()
    expect(activeTabFor('list-detail')).toBeNull()
  })
})

describe('AppScreens — navigation persistante (N1)', () => {
  it('affiche la nav sur le dashboard avec l\'onglet Accueil actif', () => {
    const ctx = makeAppContext({ screen: 'dashboard', route: { name: 'dashboard' } })
    renderWithApp(<AppScreens />, ctx)
    expect(screen.getByRole('button', { name: 'Accueil' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByLabelText('Écran E10 : Accueil')).toBeDefined()
  })

  it('affiche la nav sur un écran secondaire (settings) sans point d\'entrée perdu', () => {
    const ctx = makeAppContext({ screen: 'settings', route: { name: 'settings' } })
    renderWithApp(<AppScreens />, ctx)
    expect(screen.getByRole('button', { name: 'Accueil' })).toBeDefined()
    expect(screen.getByLabelText('Écran E110 : Paramètres')).toBeDefined()
  })

  it('masque la nav pendant l\'onboarding', () => {
    for (const s of NO_NAV_SCREENS) {
      const ctx = makeAppContext({ screen: s })
      const { unmount } = renderWithApp(<AppScreens />, ctx)
      expect(screen.queryByRole('navigation', { name: 'Navigation principale' })).toBeNull()
      unmount()
    }
  })

  it('navigue vers dashboard au clic sur Accueil depuis un autre écran', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const ctx = makeAppContext({ screen: 'tools' })
    renderWithApp(<AppScreens />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('rend le dashboard sur la route dashboard et la vue semaine sur la route planning (#22)', async () => {
    const fromDashboard = renderWithApp(<AppScreens />, makeAppContext({ screen: 'dashboard' }))
    expect(screen.getByRole('heading', { name: 'AuDHD' })).toBeDefined()
    expect(screen.getByRole('region', { name: 'Planning du jour' })).toBeDefined()
    expect(screen.queryByRole('region', { name: 'Planning de la semaine' })).toBeNull()
    fromDashboard.unmount()

    renderWithApp(
      <AppScreens />,
      makeAppContext({ screen: 'planning', route: { name: 'planning' } }),
    )
    expect(await screen.findByRole('region', { name: 'Planning de la semaine' })).toBeDefined()
    expect(screen.queryByRole('heading', { name: 'AuDHD' })).toBeNull()
  })

  it("le bouton \"+\" ouvre la création de tâche, la pile portant l'écran courant comme origine", async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const ctx = makeAppContext({ screen: 'planning' })
    renderWithApp(<AppScreens />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
    expect(ctx.goTo).toHaveBeenCalledWith('task-create-v2')
  })
})

describe('AppScreens — accès aux retours selon le rôle testeur', () => {
  it.each(['feedback', 'feedback-list', 'feedback-detail'] as const)('renvoie un testeur non admin de %s vers l’Accueil', (screenName) => {
    const ctx = makeAppContext({ screen: screenName, route: { name: screenName }, settings: makeSettings({ tester_code: 'satine' }) })
    renderWithApp(<AppScreens />, ctx)
    expect(ctx.replace).toHaveBeenCalledWith('dashboard')
  })

  it('laisse un admin sur l’écran de retour', () => {
    const ctx = makeAppContext({ screen: 'feedback-list', route: { name: 'feedback-list' }, settings: makeSettings({ tester_code: 'marie' }) })
    renderWithApp(<AppScreens />, ctx)
    expect(ctx.replace).not.toHaveBeenCalled()
  })
})
