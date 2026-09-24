import { describe, it, expect } from 'vitest'
import {
  createRoutine,
  createRoutineStep,
  emptyKeypadDigits,
  isKeypadDigitAllowed,
  isRoutineOccurrenceCompleted,
  keypadTime,
  pressKeypadDigit,
  resolveRoutineStepsForWeekday,
  type KeypadDigits,
} from './routineRules'
import type { RoutineStep } from '@/domain/entities/routineStep'

describe('createRoutine', () => {
  it('crée une routine avec les champs attendus', () => {
    const now = '2026-09-23T10:00:00.000Z'
    const routine = createRoutine('routine-1', 'Routine du matin', now)
    expect(routine).toEqual({
      id: 'routine-1',
      name: 'Routine du matin',
      color: null,
      created_at: now,
      updated_at: now,
    })
  })

  it('accepte une couleur optionnelle', () => {
    const now = '2026-09-23T10:00:00.000Z'
    const routine = createRoutine('routine-2', 'Routine du soir', now, '#ff8800')
    expect(routine.color).toBe('#ff8800')
  })
})

describe('createRoutineStep', () => {
  it('crée une étape avec les champs attendus', () => {
    const now = '2026-09-23T10:00:00.000Z'
    const step = createRoutineStep('step-1', 'routine-1', 'Se brosser les dents', 0, now)
    expect(step).toEqual({
      id: 'step-1',
      routine_id: 'routine-1',
      title: 'Se brosser les dents',
      position: 0,
      duration_minutes: null,
      weekday: null,
      created_at: now,
      updated_at: now,
    })
  })

  it('accepte une durée optionnelle', () => {
    const now = '2026-09-23T10:00:00.000Z'
    const step = createRoutineStep('step-2', 'routine-1', 'Petit-déjeuner', 1, now, 15)
    expect(step.duration_minutes).toBe(15)
  })

  it('accepte un jour de semaine optionnel (étape propre à un jour détaché)', () => {
    const now = '2026-09-23T10:00:00.000Z'
    const step = createRoutineStep('step-3', 'routine-1', 'Petit-déjeuner', 0, now, null, 3)
    expect(step.weekday).toBe(3)
  })
})

describe('resolveRoutineStepsForWeekday', () => {
  function step(overrides: Partial<RoutineStep> = {}): RoutineStep {
    return {
      id: 'step',
      routine_id: 'routine-1',
      title: 'Étape',
      position: 0,
      duration_minutes: null,
      weekday: null,
      created_at: '2026-09-23T00:00:00.000Z',
      updated_at: '2026-09-23T00:00:00.000Z',
      ...overrides,
    }
  }

  it('renvoie les étapes communes triées par position quand le jour n\'est pas détaché', () => {
    const steps = [
      step({ id: 'commun-2', position: 1 }),
      step({ id: 'commun-1', position: 0 }),
      step({ id: 'mercredi-1', position: 0, weekday: 3 }),
    ]
    expect(resolveRoutineStepsForWeekday(steps, 3, false).map((s) => s.id)).toEqual(['commun-1', 'commun-2'])
  })

  it('renvoie uniquement les étapes propres au jour, triées par position, quand il est détaché', () => {
    const steps = [
      step({ id: 'commun-1', position: 0 }),
      step({ id: 'mercredi-2', position: 1, weekday: 3 }),
      step({ id: 'mercredi-1', position: 0, weekday: 3 }),
      step({ id: 'jeudi-1', position: 0, weekday: 4 }),
    ]
    expect(resolveRoutineStepsForWeekday(steps, 3, true).map((s) => s.id)).toEqual(['mercredi-1', 'mercredi-2'])
  })
})

describe('pavé numérique horaire', () => {
  it('accepte une saisie séquentielle valide et produit HH:MM', () => {
    let digits = emptyKeypadDigits()
    digits = pressKeypadDigit(digits, '0')
    digits = pressKeypadDigit(digits, '8')
    digits = pressKeypadDigit(digits, '3')
    digits = pressKeypadDigit(digits, '0')
    expect(digits).toEqual(['0', '8', '3', '0'])
    expect(keypadTime(digits)).toBe('08:30')
  })

  it('retourne null tant que les 4 chiffres ne sont pas saisis', () => {
    let digits = emptyKeypadDigits()
    expect(keypadTime(digits)).toBeNull()
    digits = pressKeypadDigit(digits, '1')
    expect(keypadTime(digits)).toBeNull()
  })

  it('interdit une dizaine d\'heures supérieure à 2', () => {
    const digits = emptyKeypadDigits()
    expect(isKeypadDigitAllowed(digits, '3')).toBe(false)
    expect(isKeypadDigitAllowed(digits, '2')).toBe(true)
  })

  it('limite l\'unité des heures à 3 quand la dizaine vaut 2 (23 max)', () => {
    const digits: KeypadDigits = ['2', null, null, null]
    expect(isKeypadDigitAllowed(digits, '4')).toBe(false)
    expect(isKeypadDigitAllowed(digits, '3')).toBe(true)
  })

  it('autorise n\'importe quelle unité d\'heures quand la dizaine vaut 0 ou 1', () => {
    const digits: KeypadDigits = ['1', null, null, null]
    expect(isKeypadDigitAllowed(digits, '9')).toBe(true)
  })

  it('interdit une dizaine de minutes supérieure à 5', () => {
    const digits: KeypadDigits = ['0', '8', null, null]
    expect(isKeypadDigitAllowed(digits, '6')).toBe(false)
    expect(isKeypadDigitAllowed(digits, '5')).toBe(true)
  })

  it('ignore un chiffre pressé une fois les 4 chiffres déjà saisis', () => {
    const complete: KeypadDigits = ['0', '8', '3', '0']
    expect(isKeypadDigitAllowed(complete, '5')).toBe(false)
    expect(pressKeypadDigit(complete, '5')).toEqual(complete)
  })

  it('remise à zéro : emptyKeypadDigits repart de zéro chiffre', () => {
    expect(emptyKeypadDigits()).toEqual([null, null, null, null])
  })
})

describe('isRoutineOccurrenceCompleted', () => {
  it('est terminée quand toutes les étapes sont dans les complétées', () => {
    expect(isRoutineOccurrenceCompleted(['s1', 's2'], new Set(['s1', 's2']))).toBe(true)
  })

  it('n\'est pas terminée si une étape manque', () => {
    expect(isRoutineOccurrenceCompleted(['s1', 's2'], new Set(['s1']))).toBe(false)
  })

  it('n\'est jamais terminée pour une routine sans étape', () => {
    expect(isRoutineOccurrenceCompleted([], new Set())).toBe(false)
  })
})
