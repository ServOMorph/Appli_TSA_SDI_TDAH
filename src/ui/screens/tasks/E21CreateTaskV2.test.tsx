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

  it('Valider est désactivé si le titre est vide', () => {
    renderWithApp(<E21CreateTaskV2 />)
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('sans écran d\'origine : destination forcée à Todo, Valider crée directement une tâche en réception', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche todo')
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    await userEvent.click(btn)
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche todo', status: 'inbox' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it('ne crée pas si le titre est uniquement des espaces', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), '   ')
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

  it("depuis Todo (originScreen 'inbox') : Valider crée directement une tâche todo", async () => {
    const ctx = makeAppContext({ originScreen: 'inbox' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis todo')
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    await userEvent.click(btn)
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche depuis todo', status: 'inbox' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("depuis Outils (originScreen 'tools') : Valider crée directement une tâche todo", async () => {
    const ctx = makeAppContext({ originScreen: 'tools' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis outils')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tâche depuis outils', status: 'inbox' }))
    expect(ctx.goTo).toHaveBeenCalledWith('inbox')
  })

  it("depuis Planning (originScreen 'planning') : affiche date/heure/durée, l'heure de début est requise puis planifie directement la tâche", async () => {
    const ctx = makeAppContext({ originScreen: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis planning')
    expect(screen.getByLabelText('Date')).toBeDefined()
    expect(screen.getByLabelText('Heure de début')).toBeDefined()
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(screen.getByText("L'heure de début est requise pour planifier la tâche.")).toBeDefined()
    await userEvent.type(screen.getByLabelText('Heure de début'), '10:30')
    expect(btn.disabled).toBe(false)
    expect(screen.queryByText("L'heure de début est requise pour planifier la tâche.")).toBeNull()
    await userEvent.click(btn)
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche depuis planning', status: 'planned', startTime: '10:30' }),
    )
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('le formulaire et les champs Date/Heure gardent des contraintes de largeur (évite le débordement à droite)', async () => {
    const ctx = makeAppContext({ originScreen: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    const form = screen.getByLabelText('Date').closest('form') as HTMLFormElement
    expect(form.style.minWidth).toBe('0')
    for (const label of ['Date', 'Heure de début']) {
      const input = screen.getByLabelText(label) as HTMLInputElement
      expect(input.style.maxWidth).toBe('100%')
      expect(input.style.minWidth).toBe('0')
    }
  })

  it("depuis Accueil (originScreen 'dashboard') : planifie directement la tâche", async () => {
    const ctx = makeAppContext({ originScreen: 'dashboard' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis accueil')
    await userEvent.type(screen.getByLabelText('Heure de début'), '08:00')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche depuis accueil', status: 'planned', startTime: '08:00' }),
    )
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
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
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.addSubTask).toHaveBeenCalledWith('task-1', 'Étape 1')
  })

  it('transmet le coût en énergie choisi à createDetailedTask', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche énergie')
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ energyCost: 5 }))
  })
})
