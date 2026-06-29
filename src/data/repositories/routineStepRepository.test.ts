import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AppDatabase } from '@/data/db'
import { RoutineStepRepository } from './routineStepRepository'
import type { RoutineStep } from '@/domain/entities/routineStep'

describe('RoutineStepRepository', () => {
  let db: AppDatabase
  let repo: RoutineStepRepository

  beforeEach(async () => {
    db = new AppDatabase('test-routine-step')
    repo = new RoutineStepRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates a routine step', async () => {
    const step: RoutineStep = {
      id: '1',
      routine_id: 'routine-1',
      title: 'Lever',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    const id = await repo.create(step)
    expect(id).toBe('1')
  })

  it('retrieves a step by id', async () => {
    const step: RoutineStep = {
      id: '1',
      routine_id: 'routine-1',
      title: 'Douche',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(step)
    const retrieved = await repo.getById('1')
    expect(retrieved?.title).toBe('Douche')
  })

  it('retrieves steps by routine id', async () => {
    const step1: RoutineStep = {
      id: '1',
      routine_id: 'routine-1',
      title: 'Lever',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    const step2: RoutineStep = {
      id: '2',
      routine_id: 'routine-1',
      title: 'Douche',
      position: 1,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    const step3: RoutineStep = {
      id: '3',
      routine_id: 'routine-2',
      title: 'Diner',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(step1)
    await repo.create(step2)
    await repo.create(step3)
    const steps = await repo.getByRoutineId('routine-1')
    expect(steps).toHaveLength(2)
    expect(steps[0].id).toBe('1')
  })

  it('updates a step', async () => {
    const step: RoutineStep = {
      id: '1',
      routine_id: 'routine-1',
      title: 'Original',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(step)
    const updated = { ...step, title: 'Updated', is_completed: true }
    await repo.update(updated)
    const retrieved = await repo.getById('1')
    expect(retrieved?.title).toBe('Updated')
    expect(retrieved?.is_completed).toBe(true)
  })

  it('deletes a step', async () => {
    const step: RoutineStep = {
      id: '1',
      routine_id: 'routine-1',
      title: 'Lever',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(step)
    await repo.delete('1')
    const retrieved = await repo.getById('1')
    expect(retrieved).toBeUndefined()
  })

  it('reorders steps', async () => {
    const step1: RoutineStep = {
      id: '1',
      routine_id: 'routine-1',
      title: 'Step 1',
      position: 0,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    const step2: RoutineStep = {
      id: '2',
      routine_id: 'routine-1',
      title: 'Step 2',
      position: 1,
      is_completed: false,
      created_at: '2026-06-29T00:00:00Z',
    }
    await repo.create(step1)
    await repo.create(step2)
    await repo.reorder(['2', '1'])
    const s1 = await repo.getById('2')
    const s2 = await repo.getById('1')
    expect(s1?.position).toBe(0)
    expect(s2?.position).toBe(1)
  })
})
