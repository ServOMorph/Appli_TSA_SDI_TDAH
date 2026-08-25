import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E112Accessibility } from './E112Accessibility'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'
import type { Settings } from '@/domain/entities/settings'
import type { Tool } from '@/domain/entities/tool'

const defaultSettings: Settings = {
  id: 's1',
  user_id: 'u1',
  dark_mode: false,
  font_size: 'medium',
  reduced_motion: false,
}

const defaultTool: Tool = {
  id: 'tool-1', type: 'liste', folder_id: null, list_id: 'list-1', position: 0,
  created_at: '2026-08-25T00:00:00.000Z', updated_at: '2026-08-25T00:00:00.000Z',
}

function renderE112(overrides = {}) {
  const ctx = makeAppContext({ settings: defaultSettings, ...overrides })
  return render(
    <AppContext.Provider value={ctx}>
      <E112Accessibility />
    </AppContext.Provider>,
  )
}

describe('E112Accessibility', () => {
  it('affiche le titre Accessibilité', () => {
    renderE112()
    expect(screen.getByText('Accessibilité')).toBeInTheDocument()
  })

  it('affiche les 3 options de taille de texte', () => {
    renderE112()
    expect(screen.getByText('Petite')).toBeInTheDocument()
    expect(screen.getByText('Normale')).toBeInTheDocument()
    expect(screen.getByText('Grande')).toBeInTheDocument()
  })

  it('appelle updateSettings avec font_size small au clic Petite', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.click(screen.getByText('Petite'))
    expect(updateSettings).toHaveBeenCalledWith({ font_size: 'small' })
  })

  it('appelle updateSettings avec reduced_motion true au cochage', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.click(screen.getByLabelText('Réduire les animations'))
    expect(updateSettings).toHaveBeenCalledWith({ reduced_motion: true })
  })

  it('appelle updateSettings avec dark_mode true au cochage', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.click(screen.getByLabelText('Mode sombre'))
    expect(updateSettings).toHaveBeenCalledWith({ dark_mode: true })
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE112({ goTo })
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('settings')
  })

  it('appelle updateSettings avec ambiance_color au changement de couleur (P3)', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.change(screen.getByLabelText("Couleur d'ambiance"), { target: { value: '#ff8800' } })
    expect(updateSettings).toHaveBeenCalledWith({ ambiance_color: '#ff8800' })
  })

  it('affiche la couleur par défaut si ambiance_color non défini', () => {
    renderE112()
    expect(screen.getByLabelText("Couleur d'ambiance")).toHaveValue('#4a7c99')
  })

  it('permet de choisir et retirer la couleur d’un outil depuis les paramètres', () => {
    const updateToolColor = vi.fn().mockResolvedValue(undefined)
    renderE112({ tools: [defaultTool], lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }], updateToolColor })
    fireEvent.change(screen.getByLabelText('Couleur de fond pour Courses'), { target: { value: '#ff8800' } })
    expect(updateToolColor).toHaveBeenCalledWith('tool-1', '#ff8800')
  })

  it('retire la couleur d’un outil depuis les paramètres', () => {
    const updateToolColor = vi.fn().mockResolvedValue(undefined)
    renderE112({ tools: [{ ...defaultTool, color: '#ff8800' }], lists: [{ id: 'list-1', name: 'Courses', created_at: '', updated_at: '' }], updateToolColor })
    fireEvent.click(screen.getByRole('button', { name: 'Retirer la couleur de Courses' }))
    expect(updateToolColor).toHaveBeenCalledWith('tool-1', null)
  })
})
