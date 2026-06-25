import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { E117Export } from './E117Export'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'

function renderE117(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E117Export />
    </AppContext.Provider>,
  )
}

describe('E117Export', () => {
  it('affiche le titre Export des données', () => {
    renderE117()
    expect(screen.getByText('Export des données')).toBeInTheDocument()
  })

  it('affiche le bouton Exporter en JSON', () => {
    renderE117()
    expect(screen.getByLabelText('Exporter mes données JSON')).toBeInTheDocument()
  })

  it('affiche la modal de confirmation au clic exporter', () => {
    renderE117()
    fireEvent.click(screen.getByLabelText('Exporter mes données JSON'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Exporter vos données ?')).toBeInTheDocument()
  })

  it('ferme la modal au clic Annuler', () => {
    renderE117()
    fireEvent.click(screen.getByLabelText('Exporter mes données JSON'))
    fireEvent.click(screen.getByText('Annuler'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('appelle exportData et affiche succès au clic Télécharger', async () => {
    const exportData = vi.fn().mockResolvedValue(undefined)
    renderE117({ exportData })
    fireEvent.click(screen.getByLabelText('Exporter mes données JSON'))
    await act(async () => {
      fireEvent.click(screen.getByText('Télécharger'))
    })
    await vi.waitFor(() => {
      expect(exportData).toHaveBeenCalled()
      expect(screen.getByRole('status')).toHaveTextContent('Export téléchargé avec succès.')
    })
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE117({ goTo })
    fireEvent.click(screen.getByText('Retour'))
    expect(goTo).toHaveBeenCalledWith('settings')
  })
})
