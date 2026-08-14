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
  it('affiche le titre Export et import des données', () => {
    renderE117()
    expect(screen.getByText('Export et import des données')).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('settings')
  })

  function selectFile(content: string) {
    const file = new File([content], 'export.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
  }

  it('affiche la modal de confirmation après sélection d\'un fichier JSON valide', async () => {
    renderE117()
    selectFile('{"user":{"id":"u1","profile_type":"student"}}')
    await vi.waitFor(() => {
      expect(screen.getByText('Remplacer toutes les données ?')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si le fichier sélectionné n\'est pas un JSON valide', async () => {
    renderE117()
    selectFile('pas du json')
    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Fichier illisible : JSON invalide.')
    })
  })

  it('appelle importData au clic Remplacer et ferme la modal en cas de succès', async () => {
    const importData = vi.fn().mockResolvedValue({ ok: true })
    renderE117({ importData })
    selectFile('{"user":{"id":"u1","profile_type":"student"}}')
    await vi.waitFor(() => screen.getByText('Remplacer toutes les données ?'))
    await act(async () => {
      fireEvent.click(screen.getByText('Remplacer'))
    })
    await vi.waitFor(() => {
      expect(importData).toHaveBeenCalledWith({ user: { id: 'u1', profile_type: 'student' } })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('affiche l\'erreur retournée par importData en cas d\'échec', async () => {
    const importData = vi.fn().mockResolvedValue({ ok: false, error: 'Fichier invalide.' })
    renderE117({ importData })
    selectFile('{"user":{"id":"u1","profile_type":"student"}}')
    await vi.waitFor(() => screen.getByText('Remplacer toutes les données ?'))
    await act(async () => {
      fireEvent.click(screen.getByText('Remplacer'))
    })
    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Fichier invalide.')
    })
  })
})
