import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { Routine } from '@/domain/entities/routine'
import { RoutineRepository } from './routineRepository'

describe('RoutineRepository', () => {
  let db: AppDatabase
  let repo: RoutineRepository

  const routine = (overrides: Partial<Routine> = {}): Routine => ({
    id: 'routine-1',
    name: 'Routine du matin',
    color: null,
    created_at: '2026-09-23T00:00:00Z',
    updated_at: '2026-09-23T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`routine-${crypto.randomUUID()}`)
    repo = new RoutineRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes a routine', async () => {
    await repo.create(routine())
    expect(await repo.getById('routine-1')).toEqual(routine())

    await repo.update(routine({ name: 'Routine du soir', color: '#ff8800' }))
    expect(await repo.getById('routine-1')).toMatchObject({ name: 'Routine du soir', color: '#ff8800' })

    await repo.delete('routine-1')
    expect(await repo.getById('routine-1')).toBeUndefined()
  })

  it('retrieves all routines', async () => {
    await repo.create(routine({ id: 'routine-1' }))
    await repo.create(routine({ id: 'routine-2', name: 'Routine du soir' }))

    expect((await repo.getAll()).map((item) => item.id).sort()).toEqual(['routine-1', 'routine-2'])
  })
})
