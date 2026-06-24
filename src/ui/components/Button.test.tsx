import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('affiche le texte enfant', () => {
    render(<Button>Commencer</Button>)
    expect(screen.getByRole('button', { name: 'Commencer' })).toBeDefined()
  })

  it('appelle onClick au clic', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Valider</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applique fullWidth', () => {
    render(<Button fullWidth>Pleine largeur</Button>)
    const btn = screen.getByRole('button', { name: 'Pleine largeur' })
    expect((btn as HTMLButtonElement).style.width).toBe('100%')
  })

  it('est désactivé quand disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Action</Button>)
    const btn = screen.getByRole('button', { name: 'Action' })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('accepte la variante secondary', () => {
    render(<Button variant="secondary">Ignorer</Button>)
    expect(screen.getByRole('button', { name: 'Ignorer' })).toBeDefined()
  })
})
