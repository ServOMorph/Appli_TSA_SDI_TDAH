import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E112Accessibility } from './E112Accessibility'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'
import type { Settings } from '@/domain/entities/settings'
import type { Tool } from '@/domain/entities/tool'
import type { TaskCategory } from '@/domain/entities/taskCategory'

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

  it('le <main> tient dans la fenêtre et la rangée de taille de texte peut passer à la ligne (#32)', () => {
    renderE112()
    const main = document.querySelector('main') as HTMLElement
    expect(main.style.width).toBe('100%')
    expect(main.style.maxWidth).toBe('480px')
    const row = screen.getByText('Petite').closest('div') as HTMLElement
    expect(row.style.flexWrap).toBe('wrap')
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

  it('propose une entrée « Mon compte » même sans aucun outil (#31)', () => {
    renderE112({ tools: [] })
    expect(screen.getByLabelText('Couleur de fond pour Mon compte')).toBeInTheDocument()
    expect(screen.getByLabelText('Couleur de fond pour Mon compte')).toHaveValue('#4a7c99')
    expect(screen.getByText('Aucun autre outil à personnaliser.')).toBeInTheDocument()
  })

  it('changer la couleur de « Mon compte » appelle updateSettings (#31)', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.change(screen.getByLabelText('Couleur de fond pour Mon compte'), { target: { value: '#22aa55' } })
    expect(updateSettings).toHaveBeenCalledWith({ mon_compte_color: '#22aa55' })
  })

  it('retirer la couleur de « Mon compte » repasse à la valeur par défaut (#31)', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ settings: { ...defaultSettings, mon_compte_color: '#22aa55' }, updateSettings })
    fireEvent.click(screen.getByRole('button', { name: 'Retirer la couleur de Mon compte' }))
    expect(updateSettings).toHaveBeenCalledWith({ mon_compte_color: undefined })
  })

  it('sans catégorie configurée, affiche un message vide (#35)', () => {
    renderE112()
    expect(screen.getByText('Aucune catégorie configurée.')).toBeInTheDocument()
  })

  it('crée une catégorie via le formulaire d’ajout (#35)', () => {
    const createTaskCategory = vi.fn().mockResolvedValue('cat-1')
    renderE112({ createTaskCategory })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une catégorie' }))
    fireEvent.change(screen.getByLabelText('Nom de la nouvelle catégorie'), { target: { value: 'Travail' } })
    fireEvent.change(screen.getByLabelText('Couleur de la nouvelle catégorie'), { target: { value: '#ff8800' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(createTaskCategory).toHaveBeenCalledWith('Travail', '#ff8800')
  })

  it('affiche les catégories existantes avec leur couleur', () => {
    const category: TaskCategory = { id: 'cat-1', name: 'Travail', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' }
    renderE112({ taskCategories: [category] })
    expect(screen.getByText('Travail')).toBeInTheDocument()
    expect(screen.getByLabelText('Couleur de la catégorie Travail')).toHaveValue('#4a7c99')
  })

  it('change la couleur d’une catégorie existante', () => {
    const category: TaskCategory = { id: 'cat-1', name: 'Travail', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' }
    const updateTaskCategoryColor = vi.fn().mockResolvedValue(undefined)
    renderE112({ taskCategories: [category], updateTaskCategoryColor })
    fireEvent.change(screen.getByLabelText('Couleur de la catégorie Travail'), { target: { value: '#ff8800' } })
    expect(updateTaskCategoryColor).toHaveBeenCalledWith('cat-1', '#ff8800')
  })

  it('supprime une catégorie existante', () => {
    const category: TaskCategory = { id: 'cat-1', name: 'Travail', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' }
    const deleteTaskCategory = vi.fn().mockResolvedValue(undefined)
    renderE112({ taskCategories: [category], deleteTaskCategory })
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la catégorie Travail' }))
    expect(deleteTaskCategory).toHaveBeenCalledWith('cat-1')
  })

  it('renomme une catégorie via la modale', () => {
    const category: TaskCategory = { id: 'cat-1', name: 'Travail', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' }
    const renameTaskCategory = vi.fn().mockResolvedValue(undefined)
    renderE112({ taskCategories: [category], renameTaskCategory })
    fireEvent.click(screen.getByRole('button', { name: 'Travail' }))
    const input = screen.getByLabelText('Nouveau nom de la catégorie')
    fireEvent.change(input, { target: { value: 'Boulot' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(renameTaskCategory).toHaveBeenCalledWith('cat-1', 'Boulot')
  })
})
