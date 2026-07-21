import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BottomNav } from './BottomNav'

function renderNav(overrides: Partial<React.ComponentProps<typeof BottomNav>> = {}) {
  const props: React.ComponentProps<typeof BottomNav> = {
    activeTab: null,
    overloadMode: false,
    inboxHasTasks: false,
    onAddTask: vi.fn(),
    onGoDashboard: vi.fn(),
    onGoTodo: vi.fn(),
    onGoPlanning: vi.fn(),
    onGoLists: vi.fn(),
    ...overrides,
  }
  render(<BottomNav {...props} />)
  return props
}

describe('BottomNav', () => {
  it('affiche le bouton Ajouter une tâche', () => {
    renderNav()
    expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeDefined()
  })

  it('appelle onAddTask au clic sur Ajouter une tâche', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
    expect(props.onAddTask).toHaveBeenCalled()
  })

  it('appelle onGoDashboard au clic sur Accueil', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(props.onGoDashboard).toHaveBeenCalled()
  })

  it('appelle onGoTodo au clic sur Outils', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Outils' }))
    expect(props.onGoTodo).toHaveBeenCalled()
  })

  it('appelle onGoPlanning au clic sur Planning', async () => {
    const props = renderNav()
    const group = screen.getByRole('group', { name: 'Navigation' })
    await userEvent.click(within(group).getByRole('button', { name: 'Planning' }))
    expect(props.onGoPlanning).toHaveBeenCalled()
  })

  it('appelle onGoLists au clic sur Listes', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Listes' }))
    expect(props.onGoLists).toHaveBeenCalled()
  })

  it('met en valeur l\'onglet actif', () => {
    renderNav({ activeTab: 'planning' })
    const planningButton = screen.getByRole('button', { name: 'Planning' })
    expect(planningButton.getAttribute('aria-current')).toBe('page')
    const toolsButton = screen.getByRole('button', { name: 'Outils' })
    expect(toolsButton.getAttribute('aria-current')).toBeNull()
  })

  it('affiche une pastille sur Outils si des tâches sont en attente', () => {
    renderNav({ inboxHasTasks: true })
    const toolsButton = screen.getByRole('button', { name: 'Outils' })
    expect(toolsButton.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it("n'affiche pas de pastille sur Outils si aucune tâche en attente", () => {
    renderNav({ inboxHasTasks: false })
    const toolsButton = screen.getByRole('button', { name: 'Outils' })
    expect(toolsButton.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('masque le bouton Ajouter une tâche et la navigation en mode surcharge', () => {
    renderNav({ overloadMode: true })
    expect(screen.queryByRole('button', { name: 'Ajouter une tâche' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Outils' })).toBeNull()
  })
})
