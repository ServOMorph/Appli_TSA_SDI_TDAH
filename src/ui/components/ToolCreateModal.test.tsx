import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { ToolCreateModal } from './ToolCreateModal'

describe('ToolCreateModal', () => {
  it('affiche le choix initial', () => {
    renderWithApp(<ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Nouvelle liste' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Nouvelle routine' })).toBeDefined()
  })

  it('le bouton Créer reste désactivé tant qu\'aucune catégorie n\'est ajoutée', async () => {
    const user = userEvent.setup()
    renderWithApp(<ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
    await user.type(screen.getByLabelText('Nom de la liste'), 'Courses')
    expect(screen.getByRole('button', { name: 'Créer' })).toHaveProperty('disabled', true)
  })

  it('ajoute une catégorie à la liste et permet de la retirer', async () => {
    const user = userEvent.setup()
    renderWithApp(<ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
    await user.type(screen.getByLabelText('Nouvelle catégorie'), 'Été')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(screen.getByText('Été')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Retirer Été' }))
    expect(screen.queryByText('Été')).toBeNull()
  })

  it('crée la liste puis chaque catégorie saisie', async () => {
    const onListCreated = vi.fn()
    const createToolList = vi.fn().mockResolvedValue('list-1')
    const createListCategory = vi.fn().mockResolvedValue('category-1')
    const ctx = makeAppContext({ createToolList, createListCategory })
    const user = userEvent.setup()
    renderWithApp(
      <ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={onListCreated} onRoutineCreated={vi.fn()} />,
      ctx,
    )

    await user.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
    await user.type(screen.getByLabelText('Nom de la liste'), 'Courses')
    await user.type(screen.getByLabelText('Nouvelle catégorie'), 'Été')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))
    await user.type(screen.getByLabelText('Nouvelle catégorie'), 'Hiver')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))

    await user.click(screen.getByRole('button', { name: 'Créer' }))

    expect(createToolList).toHaveBeenCalledWith('Courses', null)
    expect(createListCategory).toHaveBeenNthCalledWith(1, 'list-1', 'Été')
    expect(createListCategory).toHaveBeenNthCalledWith(2, 'list-1', 'Hiver')
    expect(onListCreated).toHaveBeenCalledWith('list-1')
  })

  it('crée la routine avec son nom', async () => {
    const onRoutineCreated = vi.fn()
    const createToolRoutine = vi.fn().mockResolvedValue('routine-1')
    const ctx = makeAppContext({ createToolRoutine })
    const user = userEvent.setup()
    renderWithApp(
      <ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={onRoutineCreated} />,
      ctx,
    )

    await user.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
    await user.type(screen.getByLabelText('Nom de la routine'), 'Routine du matin')
    await user.click(screen.getByRole('button', { name: 'Créer' }))

    expect(createToolRoutine).toHaveBeenCalledWith('Routine du matin', null)
    expect(onRoutineCreated).toHaveBeenCalledWith('routine-1')
  })
})
