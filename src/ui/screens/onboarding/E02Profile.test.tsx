import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E02Profile } from './E02Profile'

describe('E02Profile', () => {
  it('affiche les 3 options de profil', () => {
    renderWithApp(<E02Profile />)
    expect(screen.getByText('Adolescent')).toBeDefined()
    expect(screen.getByText('Étudiant')).toBeDefined()
    expect(screen.getByText('Adulte')).toBeDefined()
  })

  it('affiche le bouton Ignorer', () => {
    renderWithApp(<E02Profile />)
    expect(screen.getByRole('button', { name: 'Ignorer' })).toBeDefined()
  })

  it('crée un utilisateur et navigue vers energy au clic sur un profil', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E02Profile />, ctx)
    await userEvent.click(screen.getByText('Étudiant'))
    expect(ctx.createUser).toHaveBeenCalledWith('student')
    expect(ctx.goTo).toHaveBeenCalledWith('energy')
  })

  it('navigue vers energy via Ignorer avec profil adult par défaut', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E02Profile />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }))
    expect(ctx.createUser).toHaveBeenCalledWith('adult')
    expect(ctx.goTo).toHaveBeenCalledWith('energy')
  })
})
