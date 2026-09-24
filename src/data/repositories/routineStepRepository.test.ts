import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { RoutineStep } from '@/domain/entities/routineStep'
import { RoutineStepRepository } from './routineStepRepository'

describe('RoutineStepRepository', () => {
  let db: AppDatabase
  let repo: RoutineStepRepository

  const step = (overrides: Partial<RoutineStep> = {}): RoutineStep => ({
    id: 'step-1',
    routine_id: 'routine-1',
    title: 'Se brosser les dents',
    position: 0,
    duration_minutes: 5,
    weekday: null,
    created_at: '2026-09-23T00:00:00Z',
    updated_at: '2026-09-23T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`routine-step-${crypto.randomUUID()}`)
    repo = new RoutineStepRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes a step', async () => {
    await repo.create(step())
    expect(await repo.getById('step-1')).toEqual(step())

    await repo.update(step({ title: 'Se laver les mains' }))
    expect(await repo.getById('step-1')).toMatchObject({ title: 'Se laver les mains' })

    await repo.delete('step-1')
    expect(await repo.getById('step-1')).toBeUndefined()
  })

  it('retrieves steps by routine, ordered by position', async () => {
    await repo.create(step({ id: 'other-routine-step', routine_id: 'routine-2', position: 5 }))
    await repo.create(step({ id: 'second', position: 1 }))
    await repo.create(step({ id: 'first', position: 0 }))

    expect((await repo.getByRoutineId('routine-1')).map((item) => item.id)).toEqual(['first', 'second'])
  })

  it('deletes several steps at once', async () => {
    await repo.create(step({ id: 'first', position: 0 }))
    await repo.create(step({ id: 'second', position: 1 }))
    await repo.create(step({ id: 'third', position: 2 }))

    await repo.deleteMany(['first', 'third'])

    expect((await repo.getByRoutineId('routine-1')).map((item) => item.id)).toEqual(['second'])
  })

  it('reorders steps to match the given id order', async () => {
    await repo.create(step({ id: 'first', position: 0 }))
    await repo.create(step({ id: 'second', position: 1 }))
    await repo.create(step({ id: 'third', position: 2 }))

    await repo.reorder(['third', 'first', 'second'])

    const ordered = await repo.getByRoutineId('routine-1')
    expect(ordered.map((item) => item.id)).toEqual(['third', 'first', 'second'])
    expect(ordered.map((item) => item.position)).toEqual([0, 1, 2])
  })
})
