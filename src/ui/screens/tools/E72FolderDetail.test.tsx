import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E72FolderDetail } from './E72FolderDetail'
import type { List } from '@/domain/entities/list'
import type { Folder } from '@/domain/entities/folder'
import type { Tool } from '@/domain/entities/tool'

function makeList(overrides: Partial<List> = {}): List {
  return {
    id: 'list-1',
    name: 'Musiques',
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

function makeFolder(overrides: Partial<Folder> = {}): Folder {
  return {
    id: 'folder-1',
    name: 'Maison',
    position: 0,
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

function makeTool(overrides: Partial<Tool> = {}): Tool {
  return {
    id: 'tool-1',
    type: 'liste',
    folder_id: 'folder-1',
    list_id: 'list-1',
    position: 0,
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

describe('E72FolderDetail', () => {
  it('affiche le nom du dossier courant', () => {
    const ctx = makeAppContext({
      route: { name: 'folder-detail', folderId: 'folder-1' },
      folders: [makeFolder({ name: 'Maison' })],
    })
    renderWithApp(<E72FolderDetail />, ctx)
    expect(screen.getByRole('heading', { name: 'Maison' })).toBeDefined()
  })

  it('affiche le message vide sans outil dans le dossier', () => {
    const ctx = makeAppContext({
      route: { name: 'folder-detail', folderId: 'folder-1' },
      folders: [makeFolder()],
    })
    renderWithApp(<E72FolderDetail />, ctx)
    expect(screen.getByText('Ce dossier est vide.')).toBeDefined()
  })

  it('affiche uniquement les outils du dossier courant et navigue au clic', async () => {
    const ctx = makeAppContext({
      route: { name: 'folder-detail', folderId: 'folder-1' },
      folders: [makeFolder()],
      lists: [makeList({ id: 'l1', name: 'Courses' })],
      tools: [
        makeTool({ id: 't1', folder_id: 'folder-1', list_id: 'l1' }),
        makeTool({ id: 't2', folder_id: 'other-folder', list_id: 'l1' }),
      ],
    })
    renderWithApp(<E72FolderDetail />, ctx)
    expect(screen.getByRole('button', { name: 'Courses' })).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Courses' }))
    expect(ctx.selectList).toHaveBeenCalledWith('l1')
    expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
  })

  it('le retour utilise back("tools")', async () => {
    const ctx = makeAppContext({
      route: { name: 'folder-detail', folderId: 'folder-1' },
      folders: [makeFolder()],
    })
    renderWithApp(<E72FolderDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.back).toHaveBeenCalledWith('tools')
  })

  it('le "+" ouvre le sélecteur sans option dossier', async () => {
    const ctx = makeAppContext({
      route: { name: 'folder-detail', folderId: 'folder-1' },
      folders: [makeFolder()],
    })
    renderWithApp(<E72FolderDetail />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un outil' }))
    expect(screen.getByRole('button', { name: 'Nouvelle liste' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Nouveau dossier' })).toBeNull()
  })
})
