import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppDatabase } from '@/data/db'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'
import { RoutineScheduleRepository } from './routineScheduleRepository'

describe('RoutineScheduleRepository', () => {
  let db: AppDatabase
  let repo: RoutineScheduleRepository

  const schedule = (overrides: Partial<RoutineSchedule> = {}): RoutineSchedule => ({
    id: 'schedule-1',
    routine_id: 'routine-1',
    weekday: 1,
    time: '07:30',
    steps_overridden: false,
    created_at: '2026-09-23T00:00:00Z',
    updated_at: '2026-09-23T00:00:00Z',
    ...overrides,
  })

  beforeEach(async () => {
    db = new AppDatabase(`routine-schedule-${crypto.randomUUID()}`)
    repo = new RoutineScheduleRepository(db)
    await db.open()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates, retrieves, updates and deletes a schedule', async () => {
    await repo.create(schedule())
    expect(await repo.getById('schedule-1')).toEqual(schedule())

    await repo.update(schedule({ time: '08:00' }))
    expect(await repo.getById('schedule-1')).toMatchObject({ time: '08:00' })

    await repo.delete('schedule-1')
    expect(await repo.getById('schedule-1')).toBeUndefined()
  })

  it('retrieves schedules by routine, ordered by weekday', async () => {
    await repo.create(schedule({ id: 'other-routine-schedule', routine_id: 'routine-2', weekday: 0 }))
    await repo.create(schedule({ id: 'friday', weekday: 5 }))
    await repo.create(schedule({ id: 'monday', weekday: 1 }))

    expect((await repo.getByRoutineId('routine-1')).map((item) => item.id)).toEqual(['monday', 'friday'])
  })

  it('retrieves schedules across routines for a given weekday', async () => {
    await repo.create(schedule({ id: 'r1-monday', routine_id: 'routine-1', weekday: 1 }))
    await repo.create(schedule({ id: 'r2-monday', routine_id: 'routine-2', weekday: 1 }))
    await repo.create(schedule({ id: 'r1-tuesday', routine_id: 'routine-1', weekday: 2 }))

    expect((await repo.getByWeekday(1)).map((item) => item.id).sort()).toEqual(['r1-monday', 'r2-monday'])
  })
})
