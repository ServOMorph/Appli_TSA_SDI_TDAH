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

  it('crée un dossier depuis le choix initial à la racine', async () => {
    const onFolderCreated = vi.fn()
    const createFolder = vi.fn().mockResolvedValue('folder-9')
    const user = userEvent.setup()
    renderWithApp(
      <ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={vi.fn()} onFolderCreated={onFolderCreated} />,
      makeAppContext({ createFolder }),
    )
    await user.click(screen.getByRole('button', { name: 'Nouveau dossier' }))
    await user.type(screen.getByLabelText('Nom du dossier'), '  Maison ')
    await user.click(screen.getByRole('button', { name: 'Créer' }))
    expect(createFolder).toHaveBeenCalledWith('Maison')
    expect(onFolderCreated).toHaveBeenCalledWith('folder-9')
  })

  it('ne propose pas de dossier à l\'intérieur d\'un dossier', () => {
    renderWithApp(<ToolCreateModal folderId="folder-1" onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={vi.fn()} onFolderCreated={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Nouveau dossier' })).toBeNull()
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

    expect(createToolRoutine).toHaveBeenCalledWith('Routine du matin', null, null)
    expect(onRoutineCreated).toHaveBeenCalledWith('routine-1')
  })

  it('crée la routine avec sa durée totale', async () => {
    const createToolRoutine = vi.fn().mockResolvedValue('routine-1')
    const ctx = makeAppContext({ createToolRoutine })
    const user = userEvent.setup()
    renderWithApp(
      <ToolCreateModal folderId={null} onClose={vi.fn()} onListCreated={vi.fn()} onRoutineCreated={vi.fn()} />,
      ctx,
    )

    await user.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
    await user.type(screen.getByLabelText('Nom de la routine'), 'Routine du matin')
    await user.click(screen.getByRole('button', { name: 'Minutes' }))
    await user.click(screen.getByRole('button', { name: '4' }))
    await user.click(screen.getByRole('button', { name: '5' }))
    await user.click(screen.getByRole('button', { name: 'Créer' }))

    expect(createToolRoutine).toHaveBeenCalledWith('Routine du matin', null, 45)
  })
})
