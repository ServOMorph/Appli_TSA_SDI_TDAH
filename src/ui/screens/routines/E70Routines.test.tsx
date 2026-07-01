import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E70Routines } from './E70Routines'
import type { Routine } from '@/domain/entities/routine'

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: 'r1',
    name: 'Routine matin',
    type: 'morning',
    duration_minutes: 90,
    scheduled_date: null,
    scheduled_start: null,
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('E70Routines', () => {
  describe('état vide', () => {
    it('affiche le message vide quand aucune routine', () => {
      renderWithApp(<E70Routines />)
      expect(screen.getByText("Aucune routine pour l'instant.")).toBeDefined()
    })

    it('affiche le bouton "Nouvelle routine"', () => {
      renderWithApp(<E70Routines />)
      expect(screen.getByRole('button', { name: 'Nouvelle routine' })).toBeDefined()
    })

    it('affiche le titre "Mes routines"', () => {
      renderWithApp(<E70Routines />)
      expect(screen.getByText('Mes routines')).toBeDefined()
    })
  })

  describe('liste de routines', () => {
    it('affiche les noms des routines', () => {
      const ctx = makeAppContext({
        routines: [
          makeRoutine({ id: 'r1', name: 'Routine matin' }),
          makeRoutine({ id: 'r2', name: 'Routine soir', type: 'evening' }),
        ],
      })
      renderWithApp(<E70Routines />, ctx)
      expect(screen.getByText('Routine matin')).toBeDefined()
      expect(screen.getByText('Routine soir')).toBeDefined()
    })

    it('clic sur une routine appelle selectRoutine puis goTo routine-detail', async () => {
      const ctx = makeAppContext({ routines: [makeRoutine({ id: 'r1', name: 'Routine matin' })] })
      renderWithApp(<E70Routines />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Routine matin' }))
      expect(ctx.selectRoutine).toHaveBeenCalledWith('r1')
      expect(ctx.goTo).toHaveBeenCalledWith('routine-detail')
    })
  })

  describe('bouton retour', () => {
    it('clic sur ← navigue vers dashboard', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E70Routines />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })
  })

  describe('formulaire nouvelle routine', () => {
    it('clic sur "Nouvelle routine" affiche le formulaire', async () => {
      renderWithApp(<E70Routines />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
      expect(screen.getByLabelText('Nom de la routine')).toBeDefined()
      expect(screen.getByRole('button', { name: 'Créer' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeDefined()
    })

    it('le bouton Créer est désactivé si le nom est vide', async () => {
      renderWithApp(<E70Routines />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
      const btn = screen.getByRole('button', { name: 'Créer' }) as HTMLButtonElement
      expect(btn.disabled).toBe(true)
    })

    it('clic Créer appelle createRoutine avec nom, type et durée', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E70Routines />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
      await userEvent.type(screen.getByLabelText('Nom de la routine'), 'Routine matin')
      await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
      expect(ctx.createRoutine).toHaveBeenCalledWith('Routine matin', 'morning', 90)
    })

    it('sélection "Soir" change le type transmis', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E70Routines />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
      await userEvent.type(screen.getByLabelText('Nom de la routine'), 'Routine soir')
      await userEvent.click(screen.getByLabelText('Soir'))
      await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
      expect(ctx.createRoutine).toHaveBeenCalledWith('Routine soir', 'evening', 90)
    })

    it('clic Annuler ferme le formulaire', async () => {
      renderWithApp(<E70Routines />)
      await userEvent.click(screen.getByRole('button', { name: 'Nouvelle routine' }))
      await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
      expect(screen.queryByLabelText('Nom de la routine')).toBeNull()
      expect(screen.getByRole('button', { name: 'Nouvelle routine' })).toBeDefined()
    })
  })
})
