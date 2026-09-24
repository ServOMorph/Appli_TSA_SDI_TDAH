import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { RoutineStepCompletion } from '@/domain/entities/routineStepCompletion'
import { RoutineStepCompletionRepository } from './routineStepCompletionRepository'

describe('RoutineStepCompletionRepository', () => {
  let db: AppDatabase
  let repo: RoutineStepCompletionRepository

  const completion = (overrides: Partial<RoutineStepCompletion> = {}): RoutineStepCompletion => ({
    id: 'completion-1',
    routine_step_id: 'step-1',
    routine_id: 'routine-1',
    date: '2026-09-28',
    created_at: '2026-09-28T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`routine-step-completion-${crypto.randomUUID()}`)
    repo = new RoutineStepCompletionRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates and deletes a completion', async () => {
    await repo.create(completion())
    expect(await repo.getByRoutineAndDate('routine-1', '2026-09-28')).toEqual([completion()])

    await repo.delete('completion-1')
    expect(await repo.getByRoutineAndDate('routine-1', '2026-09-28')).toEqual([])
  })

  it('retrieves completions for a routine and a date only', async () => {
    await repo.create(completion({ id: 'c1', routine_step_id: 'step-1', date: '2026-09-28' }))
    await repo.create(completion({ id: 'c2', routine_step_id: 'step-2', date: '2026-09-28' }))
    await repo.create(completion({ id: 'c3', routine_step_id: 'step-1', date: '2026-09-29' }))
    await repo.create(completion({ id: 'c4', routine_id: 'routine-2', date: '2026-09-28' }))

    const result = await repo.getByRoutineAndDate('routine-1', '2026-09-28')
    expect(result.map((c) => c.id).sort()).toEqual(['c1', 'c2'])
  })
})
