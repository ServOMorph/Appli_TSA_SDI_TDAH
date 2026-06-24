import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E01Welcome } from './E01Welcome'

describe('E01Welcome', () => {
  it('affiche le titre de bienvenue', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByRole('heading', { name: 'Bienvenue' })).toBeDefined()
  })

  it('affiche le bouton Commencer', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByRole('button', { name: 'Commencer' })).toBeDefined()
  })

  it('navigue vers profile au clic sur Commencer', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E01Welcome />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(ctx.goTo).toHaveBeenCalledWith('profile')
  })
})
