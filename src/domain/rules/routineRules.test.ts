import { describe, it, expect } from 'vitest'
import { createRoutine, createRoutineStep, scheduleRoutine, toggleRoutineStep } from './routineRules'

describe('createRoutine', () => {
  it('crée une routine avec les champs de planification vides', () => {
    const routine = createRoutine('r1', 'Routine matin', 'morning', 90, '2026-07-01T08:00:00.000Z')
    expect(routine).toEqual({
      id: 'r1',
      name: 'Routine matin',
      type: 'morning',
      duration_minutes: 90,
      scheduled_date: null,
      scheduled_start: null,
      created_at: '2026-07-01T08:00:00.000Z',
      updated_at: '2026-07-01T08:00:00.000Z',
    })
  })
})

describe('createRoutineStep', () => {
  it('crée une étape non complétée', () => {
    const step = createRoutineStep('s1', 'r1', 'Lever', 0, '2026-07-01T08:00:00.000Z')
    expect(step).toEqual({
      id: 's1',
      routine_id: 'r1',
      title: 'Lever',
      position: 0,
      is_completed: false,
      created_at: '2026-07-01T08:00:00.000Z',
    })
  })
})

describe('scheduleRoutine', () => {
  it('affecte date et heure de début', () => {
    const routine = createRoutine('r1', 'Routine matin', 'morning', 90, '2026-07-01T08:00:00.000Z')
    const scheduled = scheduleRoutine(routine, '2026-07-02', '07:00', '2026-07-01T09:00:00.000Z')
    expect(scheduled.scheduled_date).toBe('2026-07-02')
    expect(scheduled.scheduled_start).toBe('07:00')
    expect(scheduled.updated_at).toBe('2026-07-01T09:00:00.000Z')
  })
})

describe('toggleRoutineStep', () => {
  it('inverse is_completed', () => {
    const step = createRoutineStep('s1', 'r1', 'Lever', 0, '2026-07-01T08:00:00.000Z')
    expect(toggleRoutineStep(step).is_completed).toBe(true)
    expect(toggleRoutineStep(toggleRoutineStep(step)).is_completed).toBe(false)
  })
})
