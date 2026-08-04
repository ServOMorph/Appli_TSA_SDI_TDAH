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

  it('chemin Todo : crée la tâche en réception et navigue vers inbox', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche todo')
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche todo', status: 'inbox' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('chemin Planifier : affiche date/heure/durée, désactive Valider tant que l\'heure n\'est pas choisie', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche planifiée')
    await userEvent.click(screen.getByRole('button', { name: 'Planifier' }))
    expect(screen.getByLabelText('Date')).toBeDefined()
    expect(screen.getByLabelText('Heure de début')).toBeDefined()
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(screen.getByText("L'heure de début est requise pour planifier la tâche.")).toBeDefined()
    await userEvent.type(screen.getByLabelText('Heure de début'), '09:00')
    expect(btn.disabled).toBe(false)
    expect(screen.queryByText("L'heure de début est requise pour planifier la tâche.")).toBeNull()
    await userEvent.click(btn)
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche planifiée', status: 'planned', startTime: '09:00' }),
    )
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
    expect(ctx.goToPath).toHaveBeenCalledWith(['lists', 'list-detail'])
  })

  it("chemin Tâche du jour : crée directement la tâche today et navigue vers l'accueil", async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche du jour')
    await userEvent.click(screen.getByRole('button', { name: 'Tâche du jour' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche du jour', status: 'today' }))
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('ne crée pas si le titre est uniquement des espaces', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).not.toHaveBeenCalled()
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
    expect(ctx.back).toHaveBeenCalledWith('inbox')
  })

  it("depuis Todo (originScreen 'inbox') : aucun choix de destination affiché, Valider crée directement une tâche todo", async () => {
    const ctx = makeAppContext({ originScreen: 'inbox' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Tâche du jour' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mettre dans une liste' })).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis todo')
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    await userEvent.click(btn)
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche depuis todo', status: 'inbox' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("depuis Outils (originScreen 'tools') : aucun choix de destination affiché, Valider crée directement une tâche todo", async () => {
    const ctx = makeAppContext({ originScreen: 'tools' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis outils')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche depuis outils', status: 'inbox' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("depuis Planning (originScreen 'planning') : aucun choix de destination affiché, l'heure de début est requise puis planifie directement la tâche", async () => {
    const ctx = makeAppContext({ originScreen: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis planning')
    await userEvent.type(screen.getByLabelText('Heure de début'), '10:30')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche depuis planning', status: 'planned', startTime: '10:30' }),
    )
    expect(ctx.goTo).toHaveBeenCalledWith('planning')
  })

  it("depuis Accueil (originScreen 'dashboard') : aucun choix de destination affiché, planifie directement la tâche", async () => {
    const ctx = makeAppContext({ originScreen: 'dashboard' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis accueil')
    await userEvent.type(screen.getByLabelText('Heure de début'), '08:00')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche depuis accueil', status: 'planned', startTime: '08:00' }),
    )
    expect(ctx.goTo).toHaveBeenCalledWith('planning')
  })

  it("depuis Listes (originScreen 'lists') : aucun choix de destination affiché, Valider ouvre directement le sélecteur de liste", async () => {
    const ctx = makeAppContext({
      originScreen: 'lists',
      lists: [{ id: 'list-1', name: 'Courses', created_at: '2026-07-05', updated_at: '2026-07-05' }],
    })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    expect(screen.queryByText('Que faire de cette tâche ?')).toBeNull()
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis listes')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByRole('dialog', { name: 'Choisir une liste' })).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter à Courses' }))
    expect(ctx.addListItem).toHaveBeenCalledWith('list-1', 'Tâche depuis listes')
    expect(ctx.goToPath).toHaveBeenCalledWith(['lists', 'list-detail'])
  })

  it("depuis Listes (originScreen 'lists') : le sélecteur de liste permet de créer une nouvelle liste", async () => {
    const ctx = makeAppContext({ originScreen: 'lists', lists: [] })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche nouvelle liste')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    await userEvent.type(screen.getByLabelText('Nom de la nouvelle liste'), 'Bricolage')
    await userEvent.click(screen.getByRole('button', { name: 'Créer' }))
    expect(ctx.createList).toHaveBeenCalledWith('Bricolage')
    expect(ctx.goToPath).toHaveBeenCalledWith(['lists', 'list-detail'])
  })

  it('la destination sélectionnée a aria-pressed=true', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    const btn = screen.getByRole('button', { name: 'Todo' })
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('permet d\'ajouter et retirer des sous-tâches', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    await userEvent.type(screen.getByLabelText('Nouvelle sous-tâche'), 'Étape 1')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(screen.getByText('Étape 1')).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Retirer Étape 1' }))
    expect(screen.queryByText('Étape 1')).toBeNull()
  })

  it('transmet les sous-tâches créées à addSubTask après la création de la tâche', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche avec sous-tâches')
    await userEvent.type(screen.getByLabelText('Nouvelle sous-tâche'), 'Étape 1')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.addSubTask).toHaveBeenCalledWith('task-1', 'Étape 1')
  })

  it('transmet le coût en énergie choisi à createDetailedTask', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche énergie')
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('button', { name: 'Todo' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ energyCost: 5 }))
  })
})
