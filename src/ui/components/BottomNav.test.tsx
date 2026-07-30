import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BottomNav } from './BottomNav'

function renderNav(overrides: Partial<React.ComponentProps<typeof BottomNav>> = {}) {
  const props: React.ComponentProps<typeof BottomNav> = {
    activeTab: null,
    overloadMode: false,
    inboxHasTasks: false,
    onAddTask: vi.fn(),
    onGoInbox: vi.fn(),
    onGoDashboard: vi.fn(),
    onGoSettings: vi.fn(),
    ...overrides,
  }
  render(<BottomNav {...props} />)
  return props
}

describe('BottomNav', () => {
  it('expose exactement quatre éléments : réception, accueil, paramètres, ajout (N1)', () => {
    renderNav()
    const group = screen.getByRole('group', { name: 'Navigation' })
    expect(group.querySelectorAll('button')).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Boîte de réception' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Accueil' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Paramètres' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Ajouter une tâche' })).toBeDefined()
  })

  it("n'expose plus les onglets Outils, Planning et Listes (N1)", () => {
    renderNav()
    expect(screen.queryByRole('button', { name: 'Outils' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Planning' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Listes' })).toBeNull()
  })

  it('appelle onAddTask au clic sur le bouton +', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }))
    expect(props.onAddTask).toHaveBeenCalled()
  })

  it('appelle onGoInbox au clic sur Boîte de réception', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Boîte de réception' }))
    expect(props.onGoInbox).toHaveBeenCalled()
  })

  it('appelle onGoDashboard au clic sur Accueil', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(props.onGoDashboard).toHaveBeenCalled()
  })

  it('appelle onGoSettings au clic sur Paramètres', async () => {
    const props = renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Paramètres' }))
    expect(props.onGoSettings).toHaveBeenCalled()
  })

  it("met en valeur l'onglet actif", () => {
    renderNav({ activeTab: 'dashboard' })
    expect(screen.getByRole('button', { name: 'Accueil' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Boîte de réception' }).getAttribute('aria-current')).toBeNull()
  })

  it('affiche une pastille sur la boîte de réception si des tâches sont en attente', () => {
    renderNav({ inboxHasTasks: true })
    const inboxButton = screen.getByRole('button', { name: 'Boîte de réception' })
    expect(inboxButton.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it("n'affiche pas de pastille si aucune tâche en attente", () => {
    renderNav({ inboxHasTasks: false })
    const inboxButton = screen.getByRole('button', { name: 'Boîte de réception' })
    expect(inboxButton.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('masque toute la navigation en mode surcharge', () => {
    renderNav({ overloadMode: true })
    expect(screen.queryByRole('button', { name: 'Ajouter une tâche' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Accueil' })).toBeNull()
  })
})
