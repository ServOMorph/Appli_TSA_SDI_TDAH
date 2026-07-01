import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E60Lists } from './E60Lists'
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

describe('E60Lists', () => {
  describe('état vide', () => {
    it('affiche le message vide quand aucune liste', () => {
      renderWithApp(<E60Lists />)
      expect(screen.getByText("Aucune liste pour l'instant.")).toBeDefined()
    })

    it('affiche le bouton "Nouvelle liste"', () => {
      renderWithApp(<E60Lists />)
      expect(screen.getByRole('button', { name: 'Nouvelle liste' })).toBeDefined()
    })

    it('affiche le titre "Mes listes"', () => {
      renderWithApp(<E60Lists />)
      expect(screen.getByText('Mes listes')).toBeDefined()
    })
  })

  describe('liste de listes', () => {
    it('affiche les noms des listes', () => {
      const ctx = makeAppContext({
        lists: [
          makeList({ id: 'l1', name: 'Musiques' }),
          makeList({ id: 'l2', name: 'Livres' }),
        ],
      })
      renderWithApp(<E60Lists />, ctx)
      expect(screen.getByText('Musiques')).toBeDefined()
      expect(screen.getByText('Livres')).toBeDefined()
    })

    it('ne montre pas le message vide si des listes existent', () => {
      const ctx = makeAppContext({ lists: [makeList()] })
      renderWithApp(<E60Lists />, ctx)
      expect(screen.queryByText("Aucune liste pour l'instant.")).toBeNull()
    })

    it('clic sur une liste appelle selectList puis goTo list-detail', async () => {
      const ctx = makeAppContext({ lists: [makeList({ id: 'l1', name: 'Musiques' })] })
      renderWithApp(<E60Lists />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Musiques' }))
      expect(ctx.selectList).toHaveBeenCalledWith('l1')
      expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
    })
  })

  describe('bouton retour', () => {
    it('clic sur ← navigue vers dashboard', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E60Lists />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })
  })

  describe('formulaire nouvelle liste', () => {
    it('clic sur "Nouvelle liste" affiche le formulaire', async () => {
      renderWithApp(<E60Lists />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
      expect(screen.getByLabelText('Nom de la liste')).toBeDefined()
      expect(screen.getByRole('button', { name: 'Créer' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeDefined()
    })

    it('le bouton Créer est désactivé si le nom est vide', async () => {
      renderWithApp(<E60Lists />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
      const btn = screen.getByRole('button', { name: 'Créer' }) as HTMLButtonElement
      expect(btn.disabled).toBe(true)
    })

    it('clic Créer appelle createList avec le nom saisi', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E60Lists />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
      await userEvent.type(screen.getByLabelText('Nom de la liste'), 'Habits')
      await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
      expect(ctx.createList).toHaveBeenCalledWith('Habits')
    })

    it('clic Annuler ferme le formulaire', async () => {
      renderWithApp(<E60Lists />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByLabelText('Nom de la liste')).toBeNull()
      expect(screen.getByRole('button', { name: 'Nouvelle liste' })).toBeDefined()
    })

    it('le formulaire ne montre plus le message vide', async () => {
      renderWithApp(<E60Lists />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle liste' }))
      expect(screen.queryByText("Aucune liste pour l'instant.")).toBeNull()
    })
  })
})
