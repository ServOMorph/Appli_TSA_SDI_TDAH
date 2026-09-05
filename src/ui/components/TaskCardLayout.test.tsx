import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskCardLayout, TaskFieldCard } from './TaskCardLayout'

describe('TaskCardLayout', () => {
  it('affiche l’icône et le titre dans le bandeau, les champs dans une grille', () => {
    render(
      <TaskCardLayout icon="sport" color="#4a7c99" titleSlot={<h1>Courir</h1>}>
        <span>Champ</span>
      </TaskCardLayout>,
    )
    expect(screen.getByRole('heading', { name: 'Courir' })).toBeDefined()
    expect(screen.getByRole('group', { name: 'Champs de la tâche' })).toBeDefined()
    expect(screen.getByText('Champ')).toBeDefined()
  })

  it('sans couleur, le bandeau reste neutre', () => {
    const { container } = render(
      <TaskCardLayout icon={null} color={null} titleSlot={<h1>Sans couleur</h1>}>
        <span>Champ</span>
      </TaskCardLayout>,
    )
    const banner = container.firstElementChild as HTMLElement
    expect(banner.style.backgroundColor).toBe('var(--color-surface)')
  })
})

describe('TaskFieldCard', () => {
  it('replié : affiche le libellé et la valeur, masque le contenu', () => {
    render(
      <TaskFieldCard label="Icône" value="sport" color={null} expanded={false} onToggle={() => {}}>
        <span>Éditeur</span>
      </TaskFieldCard>,
    )
    expect(screen.getByText('Icône')).toBeDefined()
    expect(screen.getByText('sport')).toBeDefined()
    expect(screen.queryByText('Éditeur')).toBeNull()
  })

  it('déplié : masque la valeur, affiche le contenu', () => {
    render(
      <TaskFieldCard label="Icône" value="sport" color={null} expanded onToggle={() => {}}>
        <span>Éditeur</span>
      </TaskFieldCard>,
    )
    expect(screen.queryByText('sport')).toBeNull()
    expect(screen.getByText('Éditeur')).toBeDefined()
  })

  it('le clic sur la case appelle onToggle', async () => {
    const onToggle = vi.fn()
    render(<TaskFieldCard label="Couleur" value="Aucune couleur" color={null} expanded={false} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Couleur' }))
    expect(onToggle).toHaveBeenCalled()
  })
})
