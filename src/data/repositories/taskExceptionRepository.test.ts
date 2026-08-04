import { beforeEach, describe, it, expect } from 'vitest'
import { AppDatabase } from '@/data/db'
import { TaskExceptionRepository } from './taskExceptionRepository'
import { makeTaskException } from '@/test/factories'

let db: AppDatabase
let repo: TaskExceptionRepository
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`task-exception-repo-test-${++testCount}`)
  repo = new TaskExceptionRepository(db)
})

describe('TaskExceptionRepository', () => {
  it('creates and deletes an exception', async () => {
    const exception = makeTaskException()
    const id = await repo.create(exception)
    expect(await repo.getByRecurrence(exception.recurrence_id)).toEqual([exception])
    await repo.delete(id)
    expect(await repo.getByRecurrence(exception.recurrence_id)).toEqual([])
  })

  it('lists exceptions for a recurrence, excluding other series', async () => {
    await repo.create(makeTaskException({ id: 'e1', recurrence_id: 'rec-a', occurrence_date: '2026-08-10' }))
    await repo.create(makeTaskException({ id: 'e2', recurrence_id: 'rec-a', occurrence_date: '2026-08-17' }))
    await repo.create(makeTaskException({ id: 'e3', recurrence_id: 'rec-b', occurrence_date: '2026-08-10' }))

    const result = await repo.getByRecurrence('rec-a')
    expect(result.map((e) => e.id).sort()).toEqual(['e1', 'e2'])
  })

  it('checks whether a date is excluded', async () => {
    await repo.create(makeTaskException({ recurrence_id: 'rec-a', occurrence_date: '2026-08-10' }))

    expect(await repo.isExcluded('rec-a', '2026-08-10')).toBe(true)
    expect(await repo.isExcluded('rec-a', '2026-08-11')).toBe(false)
    expect(await repo.isExcluded('rec-b', '2026-08-10')).toBe(false)
  })
})
