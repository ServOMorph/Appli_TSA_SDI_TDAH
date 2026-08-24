import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('ne propose pas de retirer la couleur quand aucune n\'est choisie', () => {
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool()} onOpen={() => {}} />, ctx)
    expect(screen.queryByRole('button', { name: /Retirer la couleur/ })).toBeNull()
  })

  it('change la couleur au choix dans le sélecteur', async () => {
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool()} onOpen={() => {}} />, ctx)
    const colorInput = screen.getByLabelText('Couleur de fond pour Courses')
    fireEvent.change(colorInput, { target: { value: '#ff8800' } })
    expect(ctx.updateToolColor).toHaveBeenCalledWith('tool-1', '#ff8800')
  })

  it('affiche un libellé visible pour le sélecteur de couleur', () => {
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool()} onOpen={() => {}} />, ctx)
    expect(screen.getByText('Couleur')).toBeInTheDocument()
  })

  it('retire la couleur choisie', async () => {
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool({ color: '#ff8800' })} onOpen={() => {}} />, ctx)
    await userEvent.click(screen.getByRole('button', { name: /Retirer la couleur/ }))
    expect(ctx.updateToolColor).toHaveBeenCalledWith('tool-1', null)
  })

  it('n\'active pas onOpen au clic sur le sélecteur de couleur', async () => {
    let opened = false
    const ctx = makeAppContext({ lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }] })
    renderWithApp(<ToolCard tool={makeTool()} onOpen={() => { opened = true }} />, ctx)
    await userEvent.click(screen.getByLabelText('Couleur de fond pour Courses'))
    expect(opened).toBe(false)
  })
})
