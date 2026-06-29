import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { RoutineRepository } from './routineRepository'
import type { Routine } from '@/domain/entities/routine'

describe('RoutineRepository', () => {
  let db: AppDatabase
  let repo: RoutineRepository

  beforeEach(async () => {
    db = new AppDatabase('test-routine')
    repo = new RoutineRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a routine', async () => {
    const routine: Routine = {
      id: '1',
      name: 'Routine matin',
      type: 'morning',
      duration_minutes: 90,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    const id = await repo.create(routine)
    expect(id).toBe('1')
  })

  it('retrieves a routine by id', async () => {
    const routine: Routine = {
      id: '1',
      name: 'Routine soir',
      type: 'evening',
      duration_minutes: 60,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(routine)
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Routine soir')
  })

  it('retrieves all routines', async () => {
    const routine1: Routine = {
      id: '1',
      name: 'Routine matin',
      type: 'morning',
      duration_minutes: 90,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    const routine2: Routine = {
      id: '2',
      name: 'Routine soir',
      type: 'evening',
      duration_minutes: 60,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(routine1)
    await repo.create(routine2)
    const routines = await repo.getAll()
    expect(routines).toHaveLength(2)
  })

  it('retrieves routines by type', async () => {
    const routine1: Routine = {
      id: '1',
      name: 'Routine matin 1',
      type: 'morning',
      duration_minutes: 90,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    const routine2: Routine = {
      id: '2',
      name: 'Routine matin 2',
      type: 'morning',
      duration_minutes: 45,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    const routine3: Routine = {
      id: '3',
      name: 'Routine soir',
      type: 'evening',
      duration_minutes: 60,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(routine1)
    await repo.create(routine2)
    await repo.create(routine3)
    const mornings = await repo.getByType('morning')
    expect(mornings).toHaveLength(2)
  })

  it('updates a routine', async () => {
    const routine: Routine = {
      id: '1',
      name: 'Original',
      type: 'morning',
      duration_minutes: 90,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(routine)
    const updated = { ...routine, name: 'Updated', duration_minutes: 120 }
    await repo.update(updated)
    const retrieved = await repo.getById('1')
    expect(retrieved?.name).toBe('Updated')
    expect(retrieved?.duration_minutes).toBe(120)
  })

  it('deletes a routine', async () => {
    const routine: Routine = {
      id: '1',
      name: 'Routine matin',
      type: 'morning',
      duration_minutes: 90,
      created_at: '2026-06-29T00:00:00Z',
      updated_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(routine)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })
})
