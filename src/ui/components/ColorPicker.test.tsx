import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
  it('appelle onChange avec la couleur choisie', () => {
    const onChange = vi.fn()
    render(<ColorPicker value={null} onChange={onChange} />)
    const input = screen.getByLabelText('Choisir une couleur') as HTMLInputElement
    fireEvent.change(input, { target: { value: '#ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('affiche un bouton Retirer seulement quand une couleur est choisie', () => {
    const { rerender } = render(<ColorPicker value={null} onChange={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Retirer' })).toBeNull()
    rerender(<ColorPicker value="#ff0000" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Retirer' })).toBeDefined()
  })

  it('appelle onChange(null) au clic sur Retirer', async () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#ff0000" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Retirer' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
