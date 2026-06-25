import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E03Energy } from './E03Energy'

describe('E03Energy', () => {
  it('affiche la question du souffle', () => {
    renderWithApp(<E03Energy />)
    expect(screen.getByText(/combien de souffle/i)).toBeDefined()
  })

  it('affiche les 10 options numériques', () => {
    renderWithApp(<E03Energy />)
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeDefined()
    }
  })

  it('le bouton Valider est désactivé sans sélection', () => {
    renderWithApp(<E03Energy />)
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('sélectionne une valeur et valide', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E03Energy />, ctx)
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    const valider = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(valider.disabled).toBe(false)
    await userEvent.click(valider)
    expect(ctx.saveTodayEnergy).toHaveBeenCalledWith(5)
    expect(ctx.goTo).toHaveBeenCalledWith('first-task')
  })

  it('navigue vers first-task en ignorant', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E03Energy />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }))
    expect(ctx.skipTodayEnergy).toHaveBeenCalled()
    expect(ctx.goTo).toHaveBeenCalledWith('first-task')
  })
})
