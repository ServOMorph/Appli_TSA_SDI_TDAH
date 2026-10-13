import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { db, taskRepo } from '@/app/repositories'
import { makeTask } from '@/test/factories'
import { usePlanningState } from './usePlanningState'

afterEach(async () => {
  await db.tasks.clear()
})

async function seedSeries() {
  const base = { recurrence_id: 'rec-1', status: 'planned' as const, scheduled_start: '09:00', scheduled_end: '09:30' }
  await taskRepo.create(makeTask({ id: 'occ-0', scheduled_date: '2026-10-05', ...base }))
  await taskRepo.create(makeTask({ id: 'occ-1', scheduled_date: '2026-10-12', ...base }))
  await taskRepo.create(makeTask({ id: 'occ-2', scheduled_date: '2026-10-19', recurrence_exception: true, ...base }))
  await taskRepo.create(makeTask({ id: 'occ-3', scheduled_date: '2026-10-26', ...base }))
}

describe('addSubTaskScoped (80dcd005)', () => {
  it("'occurrence' ajoute la sous-tâche uniquement à la tâche ouverte", async () => {
    await seedSeries()
    const { result } = renderHook(() => usePlanningState(vi.fn().mockResolvedValue(undefined)))
    await act(async () => {
      await result.current.addSubTaskScoped('occ-1', 'Chercher le numéro', 'occurrence')
    })
    expect((await taskRepo.getChildren('occ-1')).map((c) => c.title)).toEqual(['Chercher le numéro'])
    expect(await taskRepo.getChildren('occ-3')).toHaveLength(0)
  })

  it("'series' ajoute à l'occurrence ouverte et aux suivantes non détachées, pas aux précédentes", async () => {
    await seedSeries()
    const { result } = renderHook(() => usePlanningState(vi.fn().mockResolvedValue(undefined)))
    await act(async () => {
      await result.current.addSubTaskScoped('occ-1', 'Chercher le numéro', 'series')
    })
    expect(await taskRepo.getChildren('occ-0')).toHaveLength(0)
    expect(await taskRepo.getChildren('occ-1')).toHaveLength(1)
    expect(await taskRepo.getChildren('occ-2')).toHaveLength(0)
    expect(await taskRepo.getChildren('occ-3')).toHaveLength(1)
  })
})
