import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
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
    expect(screen.getByRole('button', { name: "Aujourd'hui" })).toBeDefined()
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

  it('chemin Planifier : crée avec status planned, sélectionne la tâche et navigue vers planning', async () => {
    const ctx = makeAppContext({ createTaskV2Dest: vi.fn().mockResolvedValue('tv2-1') })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche planifiée')
    await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskV2Dest).toHaveBeenCalledWith('Tâche planifiée', 'planned')
    expect(ctx.selectTask).toHaveBeenCalledWith('tv2-1')
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

  it("chemin Aujourd'hui : crée directement la tâche today et navigue vers today", async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche du jour')
    await userEvent.click(screen.getByRole('button', { name: "Aujourd'hui" }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.addTask).toHaveBeenCalledWith('Tâche du jour')
    expect(ctx.goTo).toHaveBeenCalledWith('today')
  })

  it("chemin Aujourd'hui à la limite : propose un remplacement avant de créer", async () => {
    const ctx = makeAppContext({
      todayTasks: [
        { id: 't1', title: 'Tâche 1', status: 'today', position: 0, created_at: '', updated_at: '', completed_at: null },
        { id: 't2', title: 'Tâche 2', status: 'today', position: 1, created_at: '', updated_at: '', completed_at: null },
        { id: 't3', title: 'Tâche 3', status: 'today', position: 2, created_at: '', updated_at: '', completed_at: null },
      ],
    })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche du jour')
    await userEvent.click(screen.getByRole('button', { name: "Aujourd'hui" }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.addTask).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Remplacer par Tâche 2' }))
    expect(ctx.moveTask).toHaveBeenCalledWith('t2', 'inbox')
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
