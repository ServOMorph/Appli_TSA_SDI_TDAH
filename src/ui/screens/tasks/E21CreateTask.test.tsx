import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E21CreateTask } from './E21CreateTask'

describe('E21CreateTask', () => {
  it('affiche le champ titre', () => {
    renderWithApp(<E21CreateTask />)
    expect(screen.getByLabelText('Titre de la tâche')).toBeDefined()
  })

  it('le bouton Valider est désactivé si le titre est vide', () => {
    renderWithApp(<E21CreateTask />)
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('le bouton Valider est actif si le titre est renseigné', async () => {
    renderWithApp(<E21CreateTask />)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Ma tâche')
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('Valider appelle createTaskInbox et navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTask />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Ma tâche')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskInbox).toHaveBeenCalledWith('Ma tâche')
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('Annuler navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTask />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('Retour navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTask />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('ne crée pas si le titre est uniquement des espaces', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTask />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskInbox).not.toHaveBeenCalled()
  })
})
