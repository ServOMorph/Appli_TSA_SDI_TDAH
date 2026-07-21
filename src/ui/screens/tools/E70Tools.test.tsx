import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E70Tools } from './E70Tools'
import type { List } from '@/domain/entities/list'

function makeList(overrides: Partial<List> = {}): List {
  return {
    id: 'list-1',
    name: 'Musiques',
    created_at: '2026-06-30T10:00:00.000Z',
    updated_at: '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

describe('E70Tools', () => {
  it('affiche le titre et les entrées Todo et Budget', () => {
    renderWithApp(<E70Tools />)
    expect(screen.getByRole('heading', { name: 'Outils' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Todo' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Budget' })).toBeDefined()
  })

  it('affiche la section Listes épinglées vide', () => {
    renderWithApp(<E70Tools />)
    expect(screen.getByRole('heading', { name: 'Listes épinglées' })).toBeDefined()
    expect(screen.getByText("Aucune liste épinglée pour l'instant.")).toBeDefined()
  })

  it('le clic sur Todo navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('le clic sur Budget navigue vers le budget', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Budget' }))
    expect(ctx.goTo).toHaveBeenCalledWith('budget')
  })

  it('le retour navigue vers dashboard', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('affiche les listes épinglées et masque le message vide', () => {
    const ctx = makeAppContext({
      lists: [
        makeList({ id: 'l1', name: 'Courses', pinned_to_tools: true }),
        makeList({ id: 'l2', name: 'Non épinglée', pinned_to_tools: false }),
      ],
    })
    renderWithApp(<E70Tools />, ctx)
    expect(screen.getByRole('button', { name: 'Courses' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Non épinglée' })).toBeNull()
    expect(screen.queryByText("Aucune liste épinglée pour l'instant.")).toBeNull()
  })

  it('le clic sur une liste épinglée sélectionne la liste et navigue vers list-detail avec origin tools', async () => {
    const ctx = makeAppContext({
      lists: [makeList({ id: 'l1', name: 'Courses', pinned_to_tools: true })],
    })
    renderWithApp(<E70Tools />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Courses' }))
    expect(ctx.selectList).toHaveBeenCalledWith('l1')
    expect(ctx.setListDetailOrigin).toHaveBeenCalledWith('tools')
    expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
  })
})
