import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E21CreateTaskV2 } from './E21CreateTaskV2'
import type { TaskCategory } from '@/domain/entities/taskCategory'

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

  it('propose les catégories de tâche configurées à la place du sélecteur natif (#35)', async () => {
    const category: TaskCategory = { id: 'cat-1', name: 'Voyage', color: '#4a7c99', position: 0, created_at: '2026-09-05T00:00:00Z' }
    renderWithApp(<E21CreateTaskV2 />, makeAppContext({ taskCategories: [category] }))
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Couleur' }))
    expect(screen.queryByLabelText('Choisir une couleur')).toBeNull()
    expect(screen.getByRole('button', { name: 'Voyage' })).toBeDefined()
  })

  it('réutilise le bandeau titre coloré partagé avec la fiche de tâche (#37)', async () => {
    const category: TaskCategory = { id: 'cat-1', name: 'Voyage', color: '#22aa55', position: 0, created_at: '2026-09-05T00:00:00Z' }
    renderWithApp(<E21CreateTaskV2 />, makeAppContext({ taskCategories: [category] }))
    expect(screen.getByRole('group', { name: 'Champs de la tâche' })).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Couleur' }))
    await userEvent.click(screen.getByRole('button', { name: 'Voyage' }))
    const label = screen.getByLabelText('Titre de la tâche')
    const banner = label.closest('div')?.parentElement?.parentElement as HTMLElement
    expect(banner.style.backgroundColor).toBe('rgb(34, 170, 85)')
  })

  it('E21 reprend le mode replié/dépliable au tap d\'E22 : un seul champ ouvert à la fois (#37)', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    expect(screen.getByRole('button', { name: 'Modifier Icône' })).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Icône' }))
    expect(screen.getByRole('button', { name: 'Modifier Icône' })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Couleur' }))
    expect(screen.getByRole('button', { name: 'Modifier Icône' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Modifier Couleur' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('Icône se referme après sélection d\'une valeur (#37)', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Icône' }))
    await userEvent.click(screen.getByRole('button', { name: 'Maison' }))
    expect(screen.getByRole('button', { name: 'Modifier Icône' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('Coût en énergie se referme après sélection d\'une valeur (#37)', async () => {
    renderWithApp(<E21CreateTaskV2 />)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Coût en énergie' }))
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    expect(screen.getByRole('button', { name: 'Modifier Coût en énergie' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('Horaire reste ouvert tant que "Fermer" n\'est pas cliqué (#37)', async () => {
    const ctx = makeAppContext({ originScreen: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Horaire' }))
    await userEvent.type(screen.getByLabelText('Heure de début'), '10:30')
    expect(screen.getByRole('button', { name: 'Modifier Horaire' })).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.getByRole('button', { name: 'Modifier Horaire' })).toHaveAttribute('aria-expanded', 'false')
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

  it("depuis Planning (originScreen 'planning') : heure de début et durée requises puis planifie directement la tâche (#25)", async () => {
    const ctx = makeAppContext({ originScreen: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis planning')
    expect(screen.getByRole('button', { name: 'Modifier Date' })).toBeDefined()
    const btn = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Horaire' }))
    expect(screen.getByText("L'heure de début est requise pour planifier la tâche.")).toBeDefined()
    await userEvent.type(screen.getByLabelText('Heure de début'), '10:30')
    expect(screen.queryByText("L'heure de début est requise pour planifier la tâche.")).toBeNull()
    // Durée encore vide : validation toujours bloquée (#25).
    expect(btn.disabled).toBe(true)
    expect(screen.getByText('La durée est obligatoire pour planifier la tâche.')).toBeDefined()
    await userEvent.selectOptions(screen.getByLabelText('Heures'), '1')
    expect(btn.disabled).toBe(false)
    expect(screen.queryByText('La durée est obligatoire pour planifier la tâche.')).toBeNull()
    await userEvent.click(btn)
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche depuis planning', status: 'planned', startTime: '10:30', durationMinutes: 60 }),
    )
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })

  it('le <main>, le formulaire et les champs Date/Heure gardent des contraintes de largeur (évite le débordement à droite) (#3)', async () => {
    const ctx = makeAppContext({ originScreen: 'planning' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    const main = document.querySelector('main') as HTMLElement
    expect(main.style.width).toBe('100%')
    expect(main.style.maxWidth).toBe('480px')
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Date' }))
    const dateInput = screen.getByLabelText('Date') as HTMLInputElement
    const form = dateInput.closest('form') as HTMLFormElement
    expect(form.style.width).toBe('100%')
    expect(form.style.minWidth).toBe('0')
    expect(dateInput.style.maxWidth).toBe('100%')
    expect(dateInput.style.minWidth).toBe('0')
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Horaire' }))
    const timeInput = screen.getByLabelText('Heure de début') as HTMLInputElement
    expect(timeInput.style.maxWidth).toBe('100%')
    expect(timeInput.style.minWidth).toBe('0')
  })

  it("depuis Accueil (originScreen 'dashboard') : planifie directement la tâche", async () => {
    const ctx = makeAppContext({ originScreen: 'dashboard' })
    renderWithApp(<E21CreateTaskV2 />, ctx)
    await userEvent.type(screen.getByLabelText('Titre de la tâche'), 'Tâche depuis accueil')
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Horaire' }))
    await userEvent.type(screen.getByLabelText('Heure de début'), '08:00')
    await userEvent.selectOptions(screen.getByLabelText('Heures'), '1')
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tâche depuis accueil', status: 'planned', startTime: '08:00', durationMinutes: 60 }),
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
    await userEvent.click(screen.getByRole('button', { name: 'Modifier Coût en énergie' }))
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    expect(ctx.createDetailedTask).toHaveBeenCalledWith(expect.objectContaining({ energyCost: 5 }))
  })
})
