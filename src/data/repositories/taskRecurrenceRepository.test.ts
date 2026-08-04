import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskRecurrenceRepository } from './taskRecurrenceRepository'
import { makeTaskRecurrence } from '@/test/factories'

let db: AppDatabase
let repo: TaskRecurrenceRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`task-recurrence-repo-test-${++testCount}`)
  repo = new TaskRecurrenceRepository(db)
})

describe('TaskRecurrenceRepository', () => {
  it('creates and retrieves a recurrence', async () => {
    const recurrence = makeTaskRecurrence()
    const id = await repo.create(recurrence)
    expect(await repo.getById(id)).toEqual(recurrence)
  })

  it('updates a recurrence', async () => {
    const recurrence = makeTaskRecurrence()
    await repo.create(recurrence)
    await repo.update({ ...recurrence, interval: 2 })
    expect((await repo.getById(recurrence.id))?.interval).toBe(2)
  })

  it('deletes a recurrence', async () => {
    const recurrence = makeTaskRecurrence()
    await repo.create(recurrence)
    await repo.delete(recurrence.id)
    expect(await repo.getById(recurrence.id)).toBeUndefined()
  })
})
