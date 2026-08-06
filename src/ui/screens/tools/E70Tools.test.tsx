import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E70Tools } from './E70Tools'
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
    name: 'Dossier',
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
    folder_id: null,
    list_id: 'list-1',
    position: 0,
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

describe('E70Tools', () => {
  it('affiche le titre et le message vide sans outil', () => {
    renderWithApp(<E70Tools />)
    expect(screen.getByRole('heading', { name: 'Outils' })).toBeDefined()
    expect(screen.getByText("Aucun outil pour l'instant.")).toBeDefined()
  })

  it('affiche un outil Budget et navigue vers budget au clic', async () => {
    const ctx = makeAppContext({ tools: [makeTool({ id: 't-budget', type: 'tableau_comptage', list_id: null })] })
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget')
  })

  it('affiche un outil liste avec le nom de la liste et navigue vers list-detail', async () => {
    const ctx = makeAppContext({
      lists: [makeList({ id: 'l1', name: 'Courses' })],
      tools: [makeTool({ id: 't1', list_id: 'l1' })],
    })
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Courses' }))
    expect(ctx.selectList).toHaveBeenCalledWith('l1')
    expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
  })

  it('affiche un dossier et navigue vers folder-detail au clic', async () => {
    const ctx = makeAppContext({ folders: [makeFolder({ id: 'f1', name: 'Maison' })] })
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: /Maison/ }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'folder-detail', folderId: 'f1' })
  })

  it('le retour navigue vers dashboard', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('le "+" ouvre le sélecteur de création', async () => {
    renderWithApp(<E70Tools />)
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un outil ou un dossier' }))
    expect(screen.getByRole('dialog', { name: 'Ajouter un outil' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Nouvelle liste' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Nouveau dossier' })).toBeDefined()
  })
})
