import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { db } from '@/app/repositories'
import { useRoutineState } from './useRoutineState'

function RoutinePanel() {
  const { detachRoutineDay, deleteRoutineStep } = useRoutineState()
  const [result, setResult] = useState('')

  return (
    <>
      <output data-testid="result">{result}</output>
      <button
        onClick={async () => {
          await detachRoutineDay('routine-1', 3, '2026-09-23')
          setResult('detached')
        }}
      >
        Détacher
      </button>
      <button
        onClick={async () => {
          await deleteRoutineStep('step-1')
          setResult('deleted')
        }}
      >
        Supprimer
      </button>
    </>
  )
}

afterEach(async () => {
  await db.routines.clear()
  await db.routineSteps.clear()
  await db.routineSchedules.clear()
  await db.routineStepCompletions.clear()
})

describe('useRoutineState', () => {
  it('detachRoutineDay reporte la complétion du jour vers l’étape clonée et supprime l’originale', async () => {
    await db.routines.add({ id: 'routine-1', name: 'Routine du matin', color: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' })
    await db.routineSteps.add({ id: 'step-1', routine_id: 'routine-1', title: 'Se brosser les dents', position: 0, duration_minutes: null, weekday: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' })
    await db.routineSchedules.add({ id: 'schedule-1', routine_id: 'routine-1', weekday: 3, time: '07:15', steps_overridden: false, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' })
    await db.routineStepCompletions.add({ id: 'completion-1', routine_step_id: 'step-1', routine_id: 'routine-1', date: '2026-09-23', created_at: '2026-09-23T00:00:00.000Z' })

    render(<RoutinePanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Détacher' }))
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('detached'))

    const steps = await db.routineSteps.toArray()
    expect(steps).toHaveLength(2)
    const clonedStep = steps.find((s) => s.weekday === 3)
    expect(clonedStep).toBeDefined()

    const completions = await db.routineStepCompletions.toArray()
    expect(completions).toHaveLength(1)
    expect(completions[0].routine_step_id).toBe(clonedStep!.id)
    expect(completions[0].date).toBe('2026-09-23')

    const schedule = await db.routineSchedules.get('schedule-1')
    expect(schedule?.steps_overridden).toBe(true)
  })

  it('deleteRoutineStep supprime aussi les complétions de cette étape', async () => {
    await db.routineSteps.add({ id: 'step-1', routine_id: 'routine-1', title: 'Se brosser les dents', position: 0, duration_minutes: null, weekday: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' })
    await db.routineStepCompletions.add({ id: 'completion-1', routine_step_id: 'step-1', routine_id: 'routine-1', date: '2026-09-23', created_at: '2026-09-23T00:00:00.000Z' })
    await db.routineStepCompletions.add({ id: 'completion-2', routine_step_id: 'step-1', routine_id: 'routine-1', date: '2026-09-24', created_at: '2026-09-24T00:00:00.000Z' })

    render(<RoutinePanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('deleted'))

    expect(await db.routineSteps.toArray()).toEqual([])
    expect(await db.routineStepCompletions.toArray()).toEqual([])
  })
})
