import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { FolderActionsMenu, ToolActionsMenu } from './ToolActionsMenu'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: 'tool-1',
    type: 'liste',
    folder_id: null,
    list_id: 'list-1',
    routine_id: null,
    position: 0,
    color: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

function makeFolder(overrides: Partial<Folder> = {}): Folder {
  return { id: 'folder-1', name: 'Maison', position: 0, created_at: '', updated_at: '', ...overrides }
}

describe('ToolActionsMenu', () => {
  it('déplace un outil de l\'Accueil vers un dossier', async () => {
    const moveTool = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithApp(<ToolActionsMenu tool={makeTool()} label="Courses" />, makeAppContext({ folders: [makeFolder()], moveTool }))
    await user.click(screen.getByRole('button', { name: 'Options de Courses' }))
    await user.click(screen.getByRole('button', { name: 'Déplacer' }))
    expect(screen.queryByRole('button', { name: 'Accueil' })).toBeNull()
    await user.click(screen.getByRole('button', { name: '📁 Maison' }))
    expect(moveTool).toHaveBeenCalledWith('tool-1', 'folder-1')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('propose de ressortir un outil rangé vers l\'Accueil', async () => {
    const moveTool = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithApp(
      <ToolActionsMenu tool={makeTool({ folder_id: 'folder-1' })} label="Courses" />,
      makeAppContext({ folders: [makeFolder()], moveTool }),
    )
    await user.click(screen.getByRole('button', { name: 'Options de Courses' }))
    await user.click(screen.getByRole('button', { name: 'Déplacer' }))
    expect(screen.queryByRole('button', { name: '📁 Maison' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(moveTool).toHaveBeenCalledWith('tool-1', null)
  })

  it('masque Déplacer quand aucun dossier n\'existe', async () => {
    const user = userEvent.setup()
    renderWithApp(<ToolActionsMenu tool={makeTool()} label="Courses" />, makeAppContext({ folders: [] }))
    await user.click(screen.getByRole('button', { name: 'Options de Courses' }))
    expect(screen.queryByRole('button', { name: 'Déplacer' })).toBeNull()
  })

  it('supprime après confirmation', async () => {
    const deleteTool = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithApp(<ToolActionsMenu tool={makeTool()} label="Courses" />, makeAppContext({ deleteTool }))
    await user.click(screen.getByRole('button', { name: 'Options de Courses' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(screen.getByText('Supprimer « Courses » ? Son contenu sera effacé.')).toBeDefined()
    expect(deleteTool).not.toHaveBeenCalled()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }))
    expect(deleteTool).toHaveBeenCalledWith('tool-1')
  })

  it('n\'efface rien si la suppression est annulée', async () => {
    const deleteTool = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderWithApp(<ToolActionsMenu tool={makeTool()} label="Courses" />, makeAppContext({ deleteTool }))
    await user.click(screen.getByRole('button', { name: 'Options de Courses' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    await user.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(deleteTool).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('le Budget ne peut pas être supprimé', async () => {
    const user = userEvent.setup()
    renderWithApp(
      <ToolActionsMenu tool={makeTool({ type: 'tableau_comptage', list_id: null })} label="Budget" />,
      makeAppContext({ folders: [makeFolder()] }),
    )
    await user.click(screen.getByRole('button', { name: 'Options de Budget' }))
    expect(screen.getByRole('button', { name: 'Déplacer' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Supprimer' })).toBeNull()
  })
})

describe('FolderActionsMenu', () => {
  it('annonce le nombre d\'outils effacés et supprime après confirmation', async () => {
    const deleteFolder = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const tools = [makeTool({ folder_id: 'folder-1' }), makeTool({ id: 'tool-2', folder_id: 'folder-1' })]
    renderWithApp(<FolderActionsMenu folder={makeFolder()} />, makeAppContext({ tools, deleteFolder }))
    await user.click(screen.getByRole('button', { name: 'Options de Maison' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(screen.getByText('Supprimer le dossier « Maison » et les 2 outils qu\'il contient ?')).toBeDefined()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }))
    expect(deleteFolder).toHaveBeenCalledWith('folder-1')
  })

  it('annonce aussi les sous-dossiers et les outils qu\'ils contiennent', async () => {
    const user = userEvent.setup()
    const folders = [makeFolder(), makeFolder({ id: 'folder-2', name: 'Cuisine', parent_id: 'folder-1' })]
    const tools = [makeTool({ folder_id: 'folder-2' })]
    renderWithApp(<FolderActionsMenu folder={folders[0]} />, makeAppContext({ folders, tools }))
    await user.click(screen.getByRole('button', { name: 'Options de Maison' }))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(screen.getByText('Supprimer le dossier « Maison » et le sous-dossier et l\'outil qu\'il contient ?')).toBeDefined()
  })

  it('déplace un dossier dans un autre sans proposer lui-même ni ses descendants', async () => {
    const moveFolder = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const folders = [
      makeFolder(),
      makeFolder({ id: 'folder-2', name: 'Cuisine', parent_id: 'folder-1' }),
      makeFolder({ id: 'folder-3', name: 'Garage' }),
    ]
    renderWithApp(<FolderActionsMenu folder={folders[0]} />, makeAppContext({ folders, moveFolder }))
    await user.click(screen.getByRole('button', { name: 'Options de Maison' }))
    await user.click(screen.getByRole('button', { name: 'Déplacer' }))
    expect(screen.queryByRole('button', { name: '📁 Maison' })).toBeNull()
    expect(screen.queryByRole('button', { name: '📁 Cuisine' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Accueil' })).toBeNull()
    await user.click(screen.getByRole('button', { name: '📁 Garage' }))
    expect(moveFolder).toHaveBeenCalledWith('folder-1', 'folder-3')
  })

  it('propose de ressortir un sous-dossier vers l\'Accueil', async () => {
    const moveFolder = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const folders = [makeFolder(), makeFolder({ id: 'folder-2', name: 'Cuisine', parent_id: 'folder-1' })]
    renderWithApp(<FolderActionsMenu folder={folders[1]} />, makeAppContext({ folders, moveFolder }))
    await user.click(screen.getByRole('button', { name: 'Options de Cuisine' }))
    await user.click(screen.getByRole('button', { name: 'Déplacer' }))
    await user.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(moveFolder).toHaveBeenCalledWith('folder-2', null)
  })

  it('masque Déplacer quand aucune destination n\'existe', async () => {
    const user = userEvent.setup()
    renderWithApp(<FolderActionsMenu folder={makeFolder()} />, makeAppContext({ folders: [makeFolder()] }))
    await user.click(screen.getByRole('button', { name: 'Options de Maison' }))
    expect(screen.queryByRole('button', { name: 'Déplacer' })).toBeNull()
  })
})
