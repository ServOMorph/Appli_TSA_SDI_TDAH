import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ColorPicker } from './ColorPicker'
import type { TaskCategory } from '@/domain/entities/taskCategory'

const CATEGORIES: TaskCategory[] = [
  { id: 'cat-1', name: 'Travail', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' },
  { id: 'cat-2', name: 'Maison', color: '#22aa55', position: 1, created_at: '2026-09-05T00:00:00Z' },
]

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

  it('propose les catégories au lieu du sélecteur natif quand des catégories existent (#35)', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} categories={CATEGORIES} />)
    expect(screen.queryByLabelText('Choisir une couleur')).toBeNull()
    expect(screen.getByRole('button', { name: 'Travail' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Maison' })).toBeDefined()
  })

  it('appelle onChange avec la couleur de la catégorie choisie', async () => {
    const onChange = vi.fn()
    render(<ColorPicker value={null} onChange={onChange} categories={CATEGORIES} />)
    await userEvent.click(screen.getByRole('button', { name: 'Maison' }))
    expect(onChange).toHaveBeenCalledWith('#22aa55')
  })

  it('sans catégorie configurée, garde le sélecteur natif inchangé', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} categories={[]} />)
    expect(screen.getByLabelText('Choisir une couleur')).toBeDefined()
  })
})
