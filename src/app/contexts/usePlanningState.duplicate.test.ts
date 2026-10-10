import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { taskRepo } from '@/app/repositories'
import { makeTask, makeSubTask } from '@/test/factories'
import { usePlanningState } from './usePlanningState'

describe('duplicateTaskById', () => {
  it('copie la tâche et ses sous-tâches sans modifier le titre, à la date et heure choisies', async () => {
    const original = makeTask({
      id: 'dup-src',
      title: 'Appeler le médecin',
      description: 'Prendre rendez-vous',
      status: 'planned',
      scheduled_date: '2026-10-01',
      scheduled_start: '09:00',
      scheduled_end: '09:30',
      duration_minutes: 30,
    })
    await taskRepo.create(original)
    await taskRepo.create(makeSubTask({ id: 'dup-st-1', parent_id: 'dup-src', title: 'Chercher le numéro' }))

    const { result } = renderHook(() => usePlanningState(vi.fn().mockResolvedValue(undefined)))
    let copyId: string | undefined
    await act(async () => {
      copyId = await result.current.duplicateTaskById('dup-src', { date: '2026-11-03', startTime: '14:30' })
    })

    const copy = await taskRepo.getById(copyId!)
    expect(copy?.title).toBe('Appeler le médecin')
    expect(copy?.description).toBe('Prendre rendez-vous')
    expect(copy?.scheduled_date).toBe('2026-11-03')
    expect(copy?.scheduled_start).toBe('14:30')
    expect(copy?.scheduled_end).toBe('15:00')
    expect(copy?.duration_minutes).toBe(30)
    const children = await taskRepo.getChildren(copyId!)
    expect(children.map((c) => c.title)).toEqual(['Chercher le numéro'])
    expect(children[0].id).not.toBe('dup-st-1')
  })
})
