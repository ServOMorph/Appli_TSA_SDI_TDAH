import { describe, expect, it } from 'vitest'
import {
  hasPendingManualTests,
  isManualTestValidated,
  latestManualTestResult,
  pendingManualTests,
} from '@/domain/rules/manualTestRules'
import type { ManualTest } from '@/domain/data/manualTestsCatalog'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'

function test(overrides: Partial<ManualTest> = {}): ManualTest {
  return { id: 't1', title: 'Test 1', category: 'Tâches', steps: ['étape'], ...overrides }
}

function result(overrides: Partial<ManualTestResult> = {}): ManualTestResult {
  return {
    id: 'r1',
    test_id: 't1',
    status: 'ok',
    comment: null,
    created_at: '2026-08-14T10:00:00.000Z',
    ...overrides,
  }
}

describe('latestManualTestResult', () => {
  it('retourne le résultat le plus récent pour un test', () => {
    const results = [
      result({ id: 'a', created_at: '2026-08-14T09:00:00.000Z' }),
      result({ id: 'b', created_at: '2026-08-14T11:00:00.000Z' }),
      result({ id: 'c', test_id: 'autre', created_at: '2026-08-14T12:00:00.000Z' }),
    ]
    expect(latestManualTestResult(results, 't1')?.id).toBe('b')
  })

  it('retourne undefined si aucun résultat', () => {
    expect(latestManualTestResult([], 't1')).toBeUndefined()
  })
})

describe('isManualTestValidated', () => {
  it('est faux sans résultat', () => {
    expect(isManualTestValidated(test(), undefined)).toBe(false)
  })

  it('est faux si le dernier résultat est un échec', () => {
    expect(isManualTestValidated(test(), result({ status: 'nok' }))).toBe(false)
  })

  it('est vrai si validé et le test n’a pas de révision', () => {
    expect(isManualTestValidated(test(), result())).toBe(true)
  })

  it('est faux si validé sur une révision antérieure', () => {
    expect(isManualTestValidated(test({ revision: 2 }), result({ test_revision: 1 }))).toBe(false)
  })

  it('est faux si validé sans révision alors que le test en a une', () => {
    expect(isManualTestValidated(test({ revision: 2 }), result())).toBe(false)
  })

  it('est vrai si validé sur la révision courante', () => {
    expect(isManualTestValidated(test({ revision: 2 }), result({ test_revision: 2 }))).toBe(true)
  })
})

describe('pendingManualTests / hasPendingManualTests', () => {
  const catalog = [test({ id: 'a' }), test({ id: 'b', revision: 2 })]

  it('liste les tests non validés dans leur révision courante', () => {
    const results = [
      result({ id: 'ra', test_id: 'a' }),
      result({ id: 'rb', test_id: 'b', test_revision: 1 }),
    ]
    expect(pendingManualTests(catalog, results).map((t) => t.id)).toEqual(['b'])
    expect(hasPendingManualTests(catalog, results)).toBe(true)
  })

  it('est vide quand tout est validé dans la révision courante', () => {
    const results = [
      result({ id: 'ra', test_id: 'a' }),
      result({ id: 'rb', test_id: 'b', test_revision: 2 }),
    ]
    expect(pendingManualTests(catalog, results)).toEqual([])
    expect(hasPendingManualTests(catalog, results)).toBe(false)
  })
})
