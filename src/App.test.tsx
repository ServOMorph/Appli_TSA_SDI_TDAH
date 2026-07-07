import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { AppScreens, activeTabFor, NO_NAV_SCREENS } from './App'

describe('activeTabFor', () => {
  it('associe chaque écran à son onglet (N1)', () => {
    expect(activeTabFor('dashboard')).toBe('dashboard')
    expect(activeTabFor('inbox')).toBe('inbox')
    expect(activeTabFor('planning')).toBe('planning')
    expect(activeTabFor('lists')).toBe('lists')
    expect(activeTabFor('list-detail')).toBe('lists')
    expect(activeTabFor('settings')).toBeNull()
  })
})

describe('AppScreens — navigation persistante (N1)', () => {
  it('affiche la nav sur le dashboard avec l\'onglet Accueil actif', () => {
    const ctx = makeAppContext({ screen: 'dashboard' })
    renderWithApp(<AppScreens />, ctx)
    expect(screen.getByRole('button', { name: 'Accueil' }).getAttribute('aria-current')).toBe('page')
  })

  it('affiche la nav sur un écran secondaire (settings) sans point d\'entrée perdu', () => {
    const ctx = makeAppContext({ screen: 'settings' })
    renderWithApp(<AppScreens />, ctx)
    expect(screen.getByRole('button', { name: 'Accueil' })).toBeDefined()
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
    const ctx = makeAppContext({ screen: 'lists' })
    renderWithApp(<AppScreens />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })
})
