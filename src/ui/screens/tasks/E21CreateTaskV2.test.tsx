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

  it('Retour navigue vers inbox sans écran d’origine', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("Retour navigue vers l'écran d'origine", async () => {
    const ctx = makeAppContext({ taskCreateOrigin: 'dashboard' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it("depuis Todo (taskCreateOrigin 'inbox') : aucun choix de destination affiché, Valider crée directement une tâche todo", async () => {
    const ctx = makeAppContext({ taskCreateOrigin: 'inbox' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Tâche du jour' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mettre dans une liste' })).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis todo')
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    await userEvent.click(btn)
    expect(ctx.createTaskInbox).toHaveBeenCalledWith('Tâche depuis todo')
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("depuis Outils (taskCreateOrigin 'tools') : aucun choix de destination affiché, Valider crée directement une tâche todo", async () => {
    const ctx = makeAppContext({ taskCreateOrigin: 'tools' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis outils')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createTaskInbox).toHaveBeenCalledWith('Tâche depuis outils')
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("depuis Today (taskCreateOrigin 'today') : aucun choix de destination affiché, Valider crée directement une tâche today", async () => {
    const ctx = makeAppContext({ taskCreateOrigin: 'today' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis today')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.addTask).toHaveBeenCalledWith('Tâche depuis today')
    expect(ctx.goTo).toHaveBeenCalledWith('today')
  })

  it("depuis Planning (taskCreateOrigin 'planning') : aucun choix de destination affiché, Valider planifie directement la tâche", async () => {
    const ctx = makeAppContext({ taskCreateOrigin: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis planning')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.startPlanTask).toHaveBeenCalledWith('Tâche depuis planning')
    expect(ctx.goTo).toHaveBeenCalledWith('planning')
  })

  it("depuis Listes (taskCreateOrigin 'lists') : aucun choix de destination affiché, Valider ouvre directement le sélecteur de liste", async () => {
    const ctx = makeAppContext({
      taskCreateOrigin: 'lists',
      lists: [{ id: 'list-1', name: 'Courses', created_at: '2026-07-05', updated_at: '2026-07-05' }],
    })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis listes')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByRole('dialog', { name: 'Choisir une liste' })).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter à Courses' }))
    expect(ctx.addListItem).toHaveBeenCalledWith('list-1', 'Tâche depuis listes')
    expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
  })

  it("depuis Listes (taskCreateOrigin 'lists') : le sélecteur de liste permet de créer une nouvelle liste", async () => {
    const ctx = makeAppContext({ taskCreateOrigin: 'lists', lists: [] })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche nouvelle liste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.type(screen.getByLabelText('Nom de la nouvelle liste'), 'Bricolage')
    await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
    expect(ctx.createList).toHaveBeenCalledWith('Bricolage')
    expect(ctx.goTo).toHaveBeenCalledWith('list-detail')
  })

  it('la destination sélectionnée a aria-pressed=true', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    const btn = screen.getByRole('button', { name: 'Todo' })
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })
})
