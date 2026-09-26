import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E01Welcome } from './E01Welcome'

describe('E01Welcome', () => {
  it('affiche le titre de bienvenue', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByRole('heading', { name: 'Bienvenue' })).toBeDefined()
  })

  it('affiche le bouton Entrer', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByRole('button', { name: 'Entrer' })).toBeDefined()
  })

  it('navigue vers le consentement au clic sur Entrer', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E01Welcome />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Entrer' }))
    expect(ctx.goTo).toHaveBeenCalledWith('consent')
  })

  it('affiche le bouton Retrouver mes données', () => {
    renderWithApp(<E01Welcome />)
    expect(screen.getByLabelText('Retrouver mes données')).toBeInTheDocument()
  })

  function selectFile(content: string) {
    const file = new File([content], 'export.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
  }

  it('appelle importData après sélection d\'un fichier JSON valide', async () => {
    const importData = vi.fn().mockResolvedValue({ ok: true })
    renderWithApp(<E01Welcome />, makeAppContext({ importData }))
    selectFile('{"user":{"id":"u1","profile_type":"student"}}')
    await vi.waitFor(() => {
      expect(importData).toHaveBeenCalledWith({ user: { id: 'u1', profile_type: 'student' } })
    })
  })

  it('affiche une erreur si le fichier sélectionné n\'est pas un JSON valide', async () => {
    renderWithApp(<E01Welcome />)
    selectFile('pas du json')
    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Fichier illisible : JSON invalide.')
    })
  })

  it('affiche l\'erreur retournée par importData en cas d\'échec', async () => {
    const importData = vi.fn().mockResolvedValue({ ok: false, error: 'Fichier invalide.' })
    renderWithApp(<E01Welcome />, makeAppContext({ importData }))
    selectFile('{"user":{"id":"u1","profile_type":"student"}}')
    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Fichier invalide.')
    })
  })
})
