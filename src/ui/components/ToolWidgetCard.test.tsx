import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { ToolCard } from './ToolWidgetCard'
import type { Tool } from '@/domain/entities/tool'

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: 'tool-1',
    type: 'liste',
    folder_id: null,
    list_id: 'list-1',
    position: 0,
    created_at: '2026-08-18T00:00:00.000Z',
    updated_at: '2026-08-18T00:00:00.000Z',
    ...overrides,
  }
}

describe('ToolCard', () => {
  it('n’affiche aucun contrôle de couleur sur la carte', () => {
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool()} onOpen={() => {}} />, ctx)
    expect(screen.queryByLabelText('Couleur de fond pour Courses')).toBeNull()
    expect(screen.queryByRole('button', { name: /Retirer la couleur/ })).toBeNull()
  })

  it('couleur d’outil : contour coloré, pas de fond (#36)', () => {
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool({ color: '#ff8800' })} onOpen={() => {}} />, ctx)
    const card = screen.getByRole('button', { name: 'Courses' }).parentElement as HTMLElement
    expect(card.style.border).toBe('2px solid rgb(255, 136, 0)')
    expect(card.style.backgroundColor).toBe('var(--color-surface)')
  })
})
