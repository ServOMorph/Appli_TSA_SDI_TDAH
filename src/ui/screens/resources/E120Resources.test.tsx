import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E120Resources } from './E120Resources'

describe('E120Resources', () => {
  it('affiche le titre et les trois choix', () => {
    renderWithApp(<E120Resources />)
    expect(screen.getByRole('heading', { name: 'Ressources' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Fondements de conception' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Mode d’emploi de l’application' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Liens utiles' })).toBeDefined()
  })

  it('affiche les fondements de conception par défaut', () => {
    renderWithApp(<E120Resources />)
    expect(screen.getByText('Réduire la charge mentale')).toBeDefined()
    expect(screen.getByText('Rendre le prochain pas explicite')).toBeDefined()
    expect(screen.getByText('Respecter la tension TSA / TDAH')).toBeDefined()
    expect(screen.getByText('Prévoir la surcharge')).toBeDefined()
  })

  it('affiche les liens utiles en cours de développement', async () => {
    renderWithApp(<E120Resources />)
    await userEvent.click(screen.getByRole('button', { name: 'Liens utiles' }))
    expect(screen.getByText('En cours de développement.')).toBeDefined()
  })

  it('affiche le mode d’emploi de l’application', async () => {
    renderWithApp(<E120Resources />)
    await userEvent.click(screen.getByRole('button', { name: 'Mode d’emploi de l’application' }))
    expect(screen.getByText('Commencer par “Que faire maintenant ?”')).toBeDefined()
    expect(screen.getByText('Capturer sans organiser tout de suite')).toBeDefined()
    expect(screen.getByText('Activer le mode surcharge')).toBeDefined()
  })

  it('navigue vers dashboard via Retour', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E120Resources />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })
})
