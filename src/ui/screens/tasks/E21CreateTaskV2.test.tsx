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

  it('affiche les 4 destinations', () => {
    renderWithApp(<E21CreateTaskV2 />)
    expect(screen.getByRole('button', { name: 'Todo' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Tâche du jour' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Planifier' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Mettre dans une liste' })).toBeDefined()
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

  it('chemin Todo : crée une tâche V1 inbox et navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche todo')
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskInbox).toHaveBeenCalledWith('Tâche todo')
    expect(ctx.createTaskV2Dest).not.toHaveBeenCalled()
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('chemin Planifier : place la tâche en attente (sans la persister) et navigue vers planning', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche planifiée')
    await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.startPlanTask).toHaveBeenCalledWith('Tâche planifiée')
    expect(ctx.createTaskV2Dest).not.toHaveBeenCalled()
    expect(ctx.goTo).toHaveBeenCalledWith('planning')
  })

  it('chemin liste : ouvre le sélecteur, crée un ListItem dans la liste choisie et navigue vers le détail de la liste', async () => {
    const ctx = makeAppContext({
      lists: [{ id: 'list-1', name: 'Courses', created_at: '2026-07-05', updated_at: '2026-07-05' }],
    })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche liste')
    await userEvent.click(screen.getByRole('button', { name: 'Mettre dans une liste' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter à Courses' }))
    expect(ctx.addListItem).toHaveBeenCalledWith('list-1', 'Tâche liste')
    expect(ctx.selectList).toHaveBeenCalledWith('list-1')
    expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
  })

  it("chemin Tâche du jour : crée directement la tâche today et navigue vers today", async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche du jour')
    await userEvent.click(screen.getByRole('button', { name: 'Tâche du jour' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.addTask).toHaveBeenCalledWith('Tâche du jour')
    expect(ctx.goTo).toHaveBeenCalledWith('today')
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
