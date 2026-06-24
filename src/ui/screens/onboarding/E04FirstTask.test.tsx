import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E04FirstTask } from './E04FirstTask'

describe('E04FirstTask', () => {
  it('affiche le champ texte', () => {
    renderWithApp(<E04FirstTask />)
    expect(screen.getByRole('textbox', { name: 'Titre de la tâche' })).toBeDefined()
  })

  it('affiche les boutons Ajouter et Ignorer', () => {
    renderWithApp(<E04FirstTask />)
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Ignorer' })).toBeDefined()
  })

  it('ajoute la tâche et navigue vers dashboard', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E04FirstTask />, ctx)
    await userEvent.type(screen.getByRole('textbox', { name: 'Titre de la tâche' }), 'Appeler le médecin')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(ctx.addTask).toHaveBeenCalledWith('Appeler le médecin')
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('navigue vers dashboard sans tâche si champ vide', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E04FirstTask />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(ctx.addTask).not.toHaveBeenCalled()
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('navigue vers dashboard via Ignorer', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E04FirstTask />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Ignorer' }))
    expect(ctx.addTask).not.toHaveBeenCalled()
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('soumet la tâche avec la touche Entrée', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E04FirstTask />, ctx)
    const input = screen.getByRole('textbox', { name: 'Titre de la tâche' })
    await userEvent.type(input, 'Faire la vaisselle{Enter}')
    expect(ctx.addTask).toHaveBeenCalledWith('Faire la vaisselle')
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })
})
