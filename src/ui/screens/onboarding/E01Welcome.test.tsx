import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E01Welcome } from './E01Welcome'

afterEach(() => {
  localStorage.clear()
})

describe('E01Welcome', () => {
  it('affiche le titre de bienvenue', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByRole('heading', { name: 'Bienvenue' })).toBeDefined()
  })

  it('affiche le bouton Entrer', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByRole('button', { name: 'Entrer' })).toBeDefined()
  })

  it('navigue vers profile au clic sur Entrer', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E01Welcome />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Entrer' }))
    expect(ctx.goTo).toHaveBeenCalledWith('profile')
  })

  it('n’affiche pas la modale Nouveautés déjà vue pour la version courante', () => {
    const version = import.meta.env.VITE_APP_VERSION ?? 'dev'
    localStorage.setItem('whats_new_seen_version', version)
    renderWithApp(<E01Welcome />)
    expect(screen.queryByRole('dialog', { name: 'Nouveautés' })).toBeNull()
  })
})
