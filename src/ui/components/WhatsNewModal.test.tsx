import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WhatsNewModal } from './WhatsNewModal'

describe('WhatsNewModal', () => {
  it('affiche la liste des nouveautés', () => {
    render(<WhatsNewModal updates={['Fonctionnalité A', 'Fonctionnalité B']} onClose={vi.fn()} />)
    expect(screen.getByText('Fonctionnalité A')).toBeInTheDocument()
    expect(screen.getByText('Fonctionnalité B')).toBeInTheDocument()
  })

  it('affiche un message quand il n’y a aucune nouveauté', () => {
    render(<WhatsNewModal updates={[]} onClose={vi.fn()} />)
    expect(screen.getByText('Aucune nouveauté pour le moment.')).toBeInTheDocument()
  })

  it('appelle onClose au clic sur le bouton Fermer', async () => {
    const onClose = vi.fn()
    render(<WhatsNewModal updates={[]} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalled()
  })
})
