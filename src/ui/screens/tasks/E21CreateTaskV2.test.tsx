import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E21CreateTaskV2 } from './E21CreateTaskV2'

describe('E21CreateTaskV2', () => {
  it('affiche le champ titre', () => {
    renderWithApp(<E21CreateTaskV2 />)
    expect(screen.getByLabelText('Titre de la tâche')).toBeDefined()
  })

  it('affiche les 3 destinations', () => {
    renderWithApp(<E21CreateTaskV2 />)
    expect(screen.getByRole('button', { name: 'Todo' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Planifier' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'A planifier plus tard' })).toBeDefined()
  })

  it('Valider est désactivé si le titre est vide', () => {
    renderWithApp(<E21CreateTaskV2 />)
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('Valider est désactivé si aucune destination choisie', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Ma tâche')
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('Valider est actif si titre + destination', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Ma tâche')
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('chemin Todo : crée avec status todo et navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche todo')
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskV2Dest).toHaveBeenCalledWith('Tâche todo', 'todo')
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('chemin Planifier : crée avec status planned et navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche planifiée')
    await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskV2Dest).toHaveBeenCalledWith('Tâche planifiée', 'planned')
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('chemin À planifier plus tard : crée avec status to_plan et navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche plus tard')
    await userEvent.click(screen.getByRole('button', { name: 'A planifier plus tard' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskV2Dest).toHaveBeenCalledWith('Tâche plus tard', 'to_plan')
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('ne crée pas si le titre est uniquement des espaces', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskV2Dest).not.toHaveBeenCalled()
  })

  it('Annuler navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('Retour navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('la destination sélectionnée a aria-pressed=true', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    const btn = screen.getByRole('button', { name: 'Todo' })
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })
})
