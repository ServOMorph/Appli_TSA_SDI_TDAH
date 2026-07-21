import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E70Tools } from './E70Tools'

describe('E70Tools', () => {
  it('affiche le titre et les entrées Todo et Budget', () => {
    renderWithApp(<E70Tools />)
    expect(screen.getByRole('heading', { name: 'Outils' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Todo' })).toBeDefined()
    expect(screen.getByText('Budget (bientôt disponible)')).toBeDefined()
  })

  it('affiche la section Listes épinglées vide', () => {
    renderWithApp(<E70Tools />)
    expect(screen.getByRole('heading', { name: 'Listes épinglées' })).toBeDefined()
    expect(screen.getByText("Aucune liste épinglée pour l'instant.")).toBeDefined()
  })

  it('le clic sur Todo navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('le retour navigue vers dashboard', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })
})
