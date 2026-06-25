import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E31EnergyCheckIn } from './E31EnergyCheckIn'

describe('E31EnergyCheckIn', () => {
  it('affiche 10 boutons de sélection (1-10)', () => {
    renderWithApp(<E31EnergyCheckIn />)
    for (let n = 1; n <= 10; n++) {
      expect(screen.getByRole('button', { name: String(n) })).toBeDefined()
    }
  })

  it('Valider est désactivé si aucune sélection', () => {
    renderWithApp(<E31EnergyCheckIn />)
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('sélectionner une valeur active Valider', async () => {
    renderWithApp(<E31EnergyCheckIn />)
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('Valider appelle saveTodayEnergy avec la valeur sélectionnée', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E31EnergyCheckIn />, ctx)
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.saveTodayEnergy).toHaveBeenCalledWith(5)
  })

  it('Valider navigue vers energy-view', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E31EnergyCheckIn />, ctx)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
  })

  it('Ignorer appelle skipTodayEnergy', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E31EnergyCheckIn />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }))
    expect(ctx.skipTodayEnergy).toHaveBeenCalled()
  })

  it('Ignorer navigue vers energy-view', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E31EnergyCheckIn />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }))
    expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
  })

  it('Retour navigue vers energy-view', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E31EnergyCheckIn />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('energy-view')
  })

  it('pré-sélectionne la valeur existante si todayEnergy renseigné', () => {
    const ctx = makeAppContext({ todayEnergy: 7 })
    renderWithApp(<E31EnergyCheckIn />, ctx)
    const btn7 = screen.getByRole('button', { name: '7' })
    expect(btn7.getAttribute('aria-pressed')).toBe('true')
  })
})
