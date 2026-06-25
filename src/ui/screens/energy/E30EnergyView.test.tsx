import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E30EnergyView } from './E30EnergyView'

describe('E30EnergyView', () => {
  describe('état null (aucun check-in)', () => {
    it('affiche "Aucun check-in aujourd\'hui"', () => {
      renderWithApp(<E30EnergyView />)
      expect(screen.getByText("Aucun check-in aujourd'hui")).toBeDefined()
    })

    it('affiche le bouton "Faire mon check-in"', () => {
      renderWithApp(<E30EnergyView />)
      expect(screen.getByRole('button', { name: 'Faire mon check-in' })).toBeDefined()
    })
  })

  describe('état filled', () => {
    it('affiche le nombre de souffle', () => {
      const ctx = makeAppContext({ todayEnergy: 7, todayEnergyStatus: 'filled' })
      renderWithApp(<E30EnergyView />, ctx)
      expect(screen.getByLabelText(/7 souffle/i)).toBeDefined()
    })

    it('affiche le bouton "Modifier"', () => {
      const ctx = makeAppContext({ todayEnergy: 7, todayEnergyStatus: 'filled' })
      renderWithApp(<E30EnergyView />, ctx)
      expect(screen.getByRole('button', { name: 'Modifier' })).toBeDefined()
    })
  })

  describe('état skipped', () => {
    it('affiche "Énergie ignorée pour aujourd\'hui"', () => {
      const ctx = makeAppContext({ todayEnergy: null, todayEnergyStatus: 'skipped' })
      renderWithApp(<E30EnergyView />, ctx)
      expect(screen.getByText("Énergie ignorée pour aujourd'hui")).toBeDefined()
    })

    it('affiche le bouton "Faire mon check-in"', () => {
      const ctx = makeAppContext({ todayEnergy: null, todayEnergyStatus: 'skipped' })
      renderWithApp(<E30EnergyView />, ctx)
      expect(screen.getByRole('button', { name: 'Faire mon check-in' })).toBeDefined()
    })
  })

  describe('navigation', () => {
    it('le bouton check-in navigue vers energy-checkin', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E30EnergyView />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Faire mon check-in' }))
      expect(ctx.goTo).toHaveBeenCalledWith('energy-checkin')
    })

    it('Retour navigue vers dashboard', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E30EnergyView />, ctx)
      await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })
  })
})
