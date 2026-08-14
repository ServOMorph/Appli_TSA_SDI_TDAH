import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { ManualTestResult } from '@/domain/entities/manualTestResult'
import { ManualTestResultRepository } from './manualTestResultRepository'

describe('ManualTestResultRepository', () => {
  let db: AppDatabase
  let repo: ManualTestResultRepository

  const result = (overrides: Partial<ManualTestResult> = {}): ManualTestResult => ({
    id: 'result-1',
    test_id: 'creer-une-liste',
    status: 'ok',
    comment: null,
    created_at: '2026-08-14T10:00:00.000Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`manual-test-result-${crypto.randomUUID()}`)
    repo = new ManualTestResultRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('ajoute chaque résultat sans écraser les précédents', async () => {
    await repo.create(result())
    await repo.create(result({ id: 'result-2', status: 'nok', comment: 'Le bouton est introuvable', created_at: '2026-08-14T11:00:00.000Z' }))

    expect(await repo.getByTestId('creer-une-liste')).toEqual([
      result(),
      result({ id: 'result-2', status: 'nok', comment: 'Le bouton est introuvable', created_at: '2026-08-14T11:00:00.000Z' }),
    ])
  })
})
