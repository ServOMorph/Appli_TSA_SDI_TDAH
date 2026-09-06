import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { AppDatabase } from '@/data/db'
import { persistSeriesBatch } from './seriesPersistence'
import { makeTask, makeTaskRecurrence } from '@/test/factories'

let db: AppDatabase
let testCount = 0

beforeEach(() => {
  db = new AppDatabase(`series-persistence-test-${++testCount}`)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('persistSeriesBatch — chemin nominal', () => {
  it('crée la règle, la racine et les occurrences en une seule opération', async () => {
    const recurrence = makeTaskRecurrence({ id: 'rec-1' })
    const root = makeTask({ id: 'root', recurrence_id: 'rec-1', is_recurrence_root: true, scheduled_date: '2026-09-07' })
    const occ = makeTask({ id: 'occ-1', recurrence_id: 'rec-1', scheduled_date: '2026-09-14' })

    await persistSeriesBatch(db, { recurrenceToCreate: recurrence, tasksToCreate: [root, occ] })

    expect(await db.taskRecurrences.get('rec-1')).toEqual(recurrence)
    expect((await db.tasks.where('recurrence_id').equals('rec-1').toArray()).map((t) => t.id).sort()).toEqual([
      'occ-1',
      'root',
    ])
  })

  it('réécrit les occurrences ciblées', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: 'a', energy_cost: 3 }),
      makeTask({ id: 'b', energy_cost: 3 }),
    ])

    await persistSeriesBatch(db, {
      tasksToUpdate: [makeTask({ id: 'a', energy_cost: 7 }), makeTask({ id: 'b', energy_cost: 7 })],
    })

    expect((await db.tasks.get('a'))?.energy_cost).toBe(7)
    expect((await db.tasks.get('b'))?.energy_cost).toBe(7)
  })

  it('supprime les tâches ciblées avec leurs sous-étapes', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: 'p1' }),
      makeTask({ id: 'p1-child', parent_id: 'p1' }),
      makeTask({ id: 'p2' }),
      makeTask({ id: 'keep' }),
    ])

    await persistSeriesBatch(db, { taskIdsToDelete: ['p1', 'p2'] })

    expect(await db.tasks.get('p1')).toBeUndefined()
    expect(await db.tasks.get('p1-child')).toBeUndefined()
    expect(await db.tasks.get('p2')).toBeUndefined()
    expect(await db.tasks.get('keep')).toBeDefined()
  })

  it('supprime la tâche source et ses sous-étapes après insertion des nouvelles tâches', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: 'src' }),
      makeTask({ id: 'src-child', parent_id: 'src' }),
    ])

    await persistSeriesBatch(db, {
      tasksToCreate: [makeTask({ id: 'new-root' })],
      sourceIdToDelete: 'src',
    })

    expect(await db.tasks.get('src')).toBeUndefined()
    expect(await db.tasks.get('src-child')).toBeUndefined()
    expect(await db.tasks.get('new-root')).toBeDefined()
  })
})

describe('persistSeriesBatch — atomicité sur panne', () => {
  it('panne à la création de la règle : ni règle ni tâche persistée', async () => {
    vi.spyOn(db.taskRecurrences, 'add').mockRejectedValueOnce(new Error('panne règle'))

    await expect(
      persistSeriesBatch(db, {
        recurrenceToCreate: makeTaskRecurrence({ id: 'rec-x' }),
        tasksToCreate: [makeTask({ id: 'root-x', recurrence_id: 'rec-x' })],
      }),
    ).rejects.toThrow()

    expect(await db.taskRecurrences.get('rec-x')).toBeUndefined()
    expect(await db.tasks.get('root-x')).toBeUndefined()
  })

  it('panne à mi-série : règle annulée, aucune occurrence, source conservée', async () => {
    await db.tasks.add(makeTask({ id: 'src' }))
    vi.spyOn(db.tasks, 'bulkAdd').mockRejectedValueOnce(new Error('panne série'))

    await expect(
      persistSeriesBatch(db, {
        recurrenceToCreate: makeTaskRecurrence({ id: 'rec-y' }),
        tasksToCreate: [
          makeTask({ id: 'root-y', recurrence_id: 'rec-y' }),
          makeTask({ id: 'occ-y', recurrence_id: 'rec-y' }),
        ],
        sourceIdToDelete: 'src',
      }),
    ).rejects.toThrow()

    expect(await db.taskRecurrences.get('rec-y')).toBeUndefined()
    expect(await db.tasks.where('recurrence_id').equals('rec-y').count()).toBe(0)
    expect(await db.tasks.get('src')).toBeDefined()
  })

  it('panne avant suppression de la source : source conservée, création annulée', async () => {
    await db.tasks.add(makeTask({ id: 'src' }))
    vi.spyOn(db.tasks, 'bulkDelete').mockRejectedValueOnce(new Error('panne suppression'))

    await expect(
      persistSeriesBatch(db, {
        recurrenceToCreate: makeTaskRecurrence({ id: 'rec-z' }),
        tasksToCreate: [makeTask({ id: 'root-z', recurrence_id: 'rec-z' })],
        sourceIdToDelete: 'src',
      }),
    ).rejects.toThrow()

    expect(await db.tasks.get('src')).toBeDefined()
    expect(await db.tasks.get('root-z')).toBeUndefined()
    expect(await db.taskRecurrences.get('rec-z')).toBeUndefined()
  })

  it('panne pendant l’édition de série : aucune occurrence modifiée', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: 'a', energy_cost: 3 }),
      makeTask({ id: 'b', energy_cost: 3 }),
    ])
    const original = db.tasks.put.bind(db.tasks)
    let calls = 0
    vi.spyOn(db.tasks, 'put').mockImplementation((value: unknown) => {
      calls += 1
      if (calls === 2) return Promise.reject(new Error('panne édition')) as ReturnType<typeof db.tasks.put>
      return original(value as Parameters<typeof db.tasks.put>[0])
    })

    await expect(
      persistSeriesBatch(db, {
        tasksToUpdate: [makeTask({ id: 'a', energy_cost: 7 }), makeTask({ id: 'b', energy_cost: 7 })],
      }),
    ).rejects.toThrow()

    expect((await db.tasks.get('a'))?.energy_cost).toBe(3)
    expect((await db.tasks.get('b'))?.energy_cost).toBe(3)
  })

  it('panne pendant la suppression de série : toutes les occurrences conservées', async () => {
    await db.tasks.bulkAdd([
      makeTask({ id: 'r1', recurrence_id: 'rec' }),
      makeTask({ id: 'r2', recurrence_id: 'rec' }),
      makeTask({ id: 'r3', recurrence_id: 'rec' }),
    ])
    vi.spyOn(db.tasks, 'bulkDelete').mockRejectedValueOnce(new Error('panne suppression série'))

    await expect(
      persistSeriesBatch(db, { taskIdsToDelete: ['r1', 'r2', 'r3'] }),
    ).rejects.toThrow()

    expect(await db.tasks.where('recurrence_id').equals('rec').count()).toBe(3)
  })
})
