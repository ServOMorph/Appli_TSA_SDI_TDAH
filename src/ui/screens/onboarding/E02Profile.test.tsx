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
    expect(screen.queryByText('14–17 ans')).toBeNull()
    expect(screen.queryByText('18–25 ans')).toBeNull()
    expect(screen.queryByText('26–40 ans')).toBeNull()
  })

  it('n\'affiche pas de bouton Ignorer', () => {
    renderWithApp(<E02Profile />)
    expect(screen.queryByRole('button', { name: 'Ignorer' })).toBeNull()
  })

  it('crée un utilisateur et navigue vers energy au clic sur un profil', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E02Profile />, ctx)
    await userEvent.click(screen.getByText('Étudiant'))
    expect(ctx.createUser).toHaveBeenCalledWith('student')
    expect(ctx.goTo).toHaveBeenCalledWith('energy')
  })
})
