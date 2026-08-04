import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { IconPicker } from './IconPicker'

describe('IconPicker', () => {
  it('affiche les 15 icônes de la bibliothèque restreinte', () => {
    render(<IconPicker value={null} onChange={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(15)
  })

  it('marque l\'icône sélectionnée', () => {
    render(<IconPicker value="home" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Maison' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Travail' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('appelle onChange avec l\'id de l\'icône cliquée', async () => {
    const onChange = vi.fn()
    render(<IconPicker value={null} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sport' }))
    expect(onChange).toHaveBeenCalledWith('sport')
  })

  it('appelle onChange(null) en recliquant sur l\'icône déjà sélectionnée', async () => {
    const onChange = vi.fn()
    render(<IconPicker value="sport" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sport' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
