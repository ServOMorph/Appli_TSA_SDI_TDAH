import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E24EditTask } from './E24EditTask'
import type { Task } from '@/domain/entities/task'
import { makeTask as baseTask } from '@/test/factories'

function makeTask(overrides: Partial<Task> = {}): Task {
  return baseTask({
    title: 'Appeler le médecin',
    status: 'planned',
    scheduled_date: '2026-08-14',
    scheduled_start: '09:00',
    scheduled_end: '10:00',
    duration_minutes: 60,
    ...overrides,
  })
}

describe('E24EditTask', () => {
  it('pré-remplit le formulaire avec les valeurs de la tâche', async () => {
    const task = makeTask({ energy_cost: 5, essential: true })
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E24EditTask />, ctx)
    expect(await screen.findByDisplayValue('Appeler le médecin')).toBeDefined()
    expect(screen.getByDisplayValue('2026-08-14')).toBeDefined()
    expect(screen.getByDisplayValue('09:00')).toBeDefined()
  })

  it('enregistre les modifications et revient au détail', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E24EditTask />, ctx)
    const titleInput = await screen.findByDisplayValue('Appeler le médecin')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Appeler le dentiste')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await waitFor(() =>
      expect(ctx.updateTaskFields).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ title: 'Appeler le dentiste' }),
        'occurrence',
      ),
    )
    expect(ctx.goTo).toHaveBeenCalledWith('task-detail')
  })

  it('durée obligatoire quand une heure de début est renseignée (#25)', async () => {
    const task = makeTask({ scheduled_start: '09:00', scheduled_end: null, duration_minutes: null })
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E24EditTask />, ctx)
    await screen.findByDisplayValue('Appeler le médecin')
    const btn = screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(screen.getByText('La durée est obligatoire quand une heure de début est renseignée.')).toBeDefined()
    await userEvent.selectOptions(screen.getByLabelText('Heures'), '1')
    expect(btn.disabled).toBe(false)
    expect(screen.queryByText('La durée est obligatoire quand une heure de début est renseignée.')).toBeNull()
  })

  it('sans heure de début, la durée reste facultative (#25)', async () => {
    const task = makeTask({ status: 'inbox', scheduled_date: null, scheduled_start: null, scheduled_end: null, duration_minutes: null })
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E24EditTask />, ctx)
    await screen.findByDisplayValue('Appeler le médecin')
    expect((screen.getByRole('button', { name: 'Enregistrer' }) as HTMLButtonElement).disabled).toBe(false)
    expect(screen.queryByText('La durée est obligatoire quand une heure de début est renseignée.')).toBeNull()
  })

  it('le <main>, le formulaire et les champs Date/Heure gardent des contraintes de largeur (évite le débordement à droite) (#3)', async () => {
    const task = makeTask()
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E24EditTask />, ctx)
    await screen.findByDisplayValue('Appeler le médecin')
    const main = document.querySelector('main') as HTMLElement
    expect(main.style.width).toBe('100%')
    expect(main.style.maxWidth).toBe('480px')
    const form = screen.getByLabelText('Date').closest('form') as HTMLFormElement
    expect(form.style.width).toBe('100%')
    expect(form.style.minWidth).toBe('0')
    for (const label of ['Date', 'Heure de début']) {
      const input = screen.getByLabelText(label) as HTMLInputElement
      expect(input.style.maxWidth).toBe('100%')
      expect(input.style.minWidth).toBe('0')
    }
  })

  it('tâche récurrente : propose le choix occurrence/série avant d\'enregistrer', async () => {
    const task = makeTask({ recurrence_id: 'rec-1' })
    const ctx = makeAppContext({ selectedTaskId: 'task-1', inboxTasks: [task] })
    renderWithApp(<E24EditTask />, ctx)
    await screen.findByDisplayValue('Appeler le médecin')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(ctx.updateTaskFields).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Modifier la série récurrente' })).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Toutes les occurrences' }))
    await waitFor(() => expect(ctx.updateTaskFields).toHaveBeenCalledWith('task-1', expect.anything(), 'series'))
  })
})
