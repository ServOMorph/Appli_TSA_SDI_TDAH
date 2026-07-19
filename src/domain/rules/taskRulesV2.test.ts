import { describe, it, expect } from 'vitest'
import {
  createTaskV2,
  completeTaskV2,
  toggleTaskV2Completion,
  scheduleTaskV2,
  toggleEssentialV2,
  setEnergyCostV2,
  reportTaskV2,
  renameTaskV2,
  getRemainingPlannedCost,
  sortByPosition,
  nextPosition,
  taskSlotRange,
  taskOccupiesSlot,
} from './taskRulesV2'
import type { TaskV2 } from '@/domain/entities/taskV2'

describe('taskRulesV2', () => {
  const now = '2026-06-29T10:00:00Z'

  describe('createTaskV2', () => {
    it('creates a new task with defaults', () => {
      const task = createTaskV2('id-1', 'My task', 'todo', true, now)

      expect(task).toEqual({
        id: 'id-1',
        title: 'My task',
        status: 'todo',
        essential: true,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
      })
    })

    it('creates a task with planned status', () => {
      const task = createTaskV2('id-1', 'Scheduled task', 'planned', false, now)
      expect(task.status).toBe('planned')
      expect(task.essential).toBe(false)
    })
  })

  describe('taskSlotRange', () => {
    function planned(start: string | null, end: string | null): TaskV2 {
      return {
        ...createTaskV2('id-1', 'T', 'planned', false, now),
        scheduled_date: '2026-07-18',
        scheduled_start: start,
        scheduled_end: end,
      }
    }

    it('retourne null si aucun début planifié', () => {
      expect(taskSlotRange(planned(null, null))).toBeNull()
    })

    it('couvre un seul créneau pour une plage de 30 minutes', () => {
      expect(taskSlotRange(planned('10:00', '10:30'))).toEqual({ start: 20, end: 20 })
    })

    it('couvre plusieurs créneaux pour une plage plus longue', () => {
      expect(taskSlotRange(planned('10:00', '12:00'))).toEqual({ start: 20, end: 23 })
    })

    it('retombe sur le créneau de début si la fin est absente', () => {
      expect(taskSlotRange(planned('08:30', null))).toEqual({ start: 17, end: 17 })
    })

    it('ne descend jamais sous le créneau de début si la fin est antérieure', () => {
      expect(taskSlotRange(planned('10:00', '09:00'))).toEqual({ start: 20, end: 20 })
    })
  })

  describe('taskOccupiesSlot', () => {
    const task: TaskV2 = {
      ...createTaskV2('id-1', 'T', 'planned', false, now),
      scheduled_date: '2026-07-18',
      scheduled_start: '10:00',
      scheduled_end: '11:30',
    }

    it('occupe tous les créneaux de la plage', () => {
      expect(taskOccupiesSlot(task, 20)).toBe(true)
      expect(taskOccupiesSlot(task, 21)).toBe(true)
      expect(taskOccupiesSlot(task, 22)).toBe(true)
    })

    it("n'occupe pas les créneaux hors plage", () => {
      expect(taskOccupiesSlot(task, 19)).toBe(false)
      expect(taskOccupiesSlot(task, 23)).toBe(false)
    })

    it('retourne false pour une tâche non planifiée', () => {
      expect(taskOccupiesSlot(createTaskV2('id-2', 'T', 'todo', false, now), 20)).toBe(false)
    })
  })

  describe('completeTaskV2', () => {
    it('marks task as completed', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'My task',
        status: 'todo',
        essential: true,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const completed = completeTaskV2(task, now)

      expect(completed.status).toBe('completed')
      expect(completed.completed_at).toBe(now)
    })
  })

  describe('toggleTaskV2Completion', () => {
    it('rÃ©active une tÃ¢che terminÃ©e sans modifier son crÃ©neau', () => {
      const task: TaskV2 = {
        ...createTaskV2('id-1', 'My task', 'completed', false, now),
        scheduled_date: '2026-06-30',
        scheduled_start: '10:00',
        scheduled_end: '10:30',
        completed_at: now,
      }

      const reopened = toggleTaskV2Completion(task, '2026-06-30T11:00:00Z')

      expect(reopened).toMatchObject({
        status: 'planned',
        completed_at: null,
        scheduled_date: '2026-06-30',
        scheduled_start: '10:00',
        scheduled_end: '10:30',
      })
    })
  })

  describe('scheduleTaskV2', () => {
    it('schedules a task to a specific date and time', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'My task',
        status: 'todo',
        essential: true,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const scheduled = scheduleTaskV2(task, '2026-06-30', '10:00', '11:00', now)

      expect(scheduled.status).toBe('planned')
      expect(scheduled.scheduled_date).toBe('2026-06-30')
      expect(scheduled.scheduled_start).toBe('10:00')
      expect(scheduled.scheduled_end).toBe('11:00')
    })

    it('clears the postponed flag', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'My task',
        status: 'planned',
        essential: false,
        postponed: true,
        position: 0,
        scheduled_date: '2026-06-30',
        scheduled_start: '09:00',
        scheduled_end: '09:30',
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const scheduled = scheduleTaskV2(task, '2026-06-30', '10:00', '11:00', now)

      expect(scheduled.postponed).toBe(false)
    })
  })

  describe('toggleEssentialV2', () => {
    it('toggles essential flag from true to false', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'My task',
        status: 'todo',
        essential: true,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const toggled = toggleEssentialV2(task, now)

      expect(toggled.essential).toBe(false)
    })

    it('toggles essential flag from false to true', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'My task',
        status: 'todo',
        essential: false,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const toggled = toggleEssentialV2(task, now)

      expect(toggled.essential).toBe(true)
    })
  })

  describe('setEnergyCostV2', () => {
    const baseTask: TaskV2 = {
      id: 'id-1',
      title: 'My task',
      status: 'todo',
      essential: false,
      position: 0,
      scheduled_date: null,
      scheduled_start: null,
      scheduled_end: null,
      created_at: now,
      updated_at: now,
      completed_at: null,
    }

    it('sets a valid cost within 1-12', () => {
      const updated = setEnergyCostV2(baseTask, 5, now)
      expect(updated.energy_cost).toBe(5)
    })

    it('accepts null (aucune valeur imposée)', () => {
      const updated = setEnergyCostV2({ ...baseTask, energy_cost: 5 }, null, now)
      expect(updated.energy_cost).toBeNull()
    })

    it('ignores an out-of-range value', () => {
      const updated = setEnergyCostV2(baseTask, 13, now)
      expect(updated.energy_cost).toBeUndefined()
    })

    it('ignores a non-integer value', () => {
      const updated = setEnergyCostV2(baseTask, 3.5, now)
      expect(updated.energy_cost).toBeUndefined()
    })
  })

  describe('reportTaskV2', () => {
    const scheduledTask: TaskV2 = {
      id: 'id-1',
      title: 'My task',
      status: 'planned',
      essential: false,
      position: 0,
      scheduled_date: '2026-07-07',
      scheduled_start: '10:00',
      scheduled_end: '11:00',
      created_at: now,
      updated_at: now,
      completed_at: null,
    }

    it('reschedules the task to the chosen date and slot, marked as postponed', () => {
      const reported = reportTaskV2(scheduledTask, '2026-07-08', '14:00', '15:00', now)
      expect(reported.scheduled_date).toBe('2026-07-08')
      expect(reported.scheduled_start).toBe('14:00')
      expect(reported.scheduled_end).toBe('15:00')
      expect(reported.postponed).toBe(true)
      expect(reported.updated_at).toBe(now)
    })
  })

  describe('renameTaskV2', () => {
    it('updates the title and updated_at', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'Old title',
        status: 'planned',
        essential: false,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const renamed = renameTaskV2(task, 'New title', '2026-07-08T09:00:00Z')

      expect(renamed.title).toBe('New title')
      expect(renamed.updated_at).toBe('2026-07-08T09:00:00Z')
    })
  })


  describe('getRemainingPlannedCost', () => {
    function task(overrides: Partial<TaskV2>): TaskV2 {
      return {
        id: 'id',
        title: 't',
        status: 'planned',
        essential: false,
        position: 0,
        scheduled_date: null,
        scheduled_start: null,
        scheduled_end: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
        ...overrides,
      }
    }

    it('sums energy_cost of planned tasks', () => {
      const tasks = [task({ energy_cost: 3 }), task({ energy_cost: 5 })]
      expect(getRemainingPlannedCost(tasks)).toBe(8)
    })

    it('excludes completed tasks', () => {
      const tasks = [task({ energy_cost: 3 }), task({ energy_cost: 5, status: 'completed' })]
      expect(getRemainingPlannedCost(tasks)).toBe(3)
    })

    it('excludes todo tasks', () => {
      const tasks = [task({ energy_cost: 3 }), task({ energy_cost: 5, status: 'todo' })]
      expect(getRemainingPlannedCost(tasks)).toBe(3)
    })

    it('treats missing energy_cost as 0', () => {
      const tasks = [task({ energy_cost: null }), task({ energy_cost: 4 })]
      expect(getRemainingPlannedCost(tasks)).toBe(4)
    })

    it('returns 0 for empty array', () => {
      expect(getRemainingPlannedCost([])).toBe(0)
    })
  })

  describe('sortByPosition', () => {
    it('sorts items by position', () => {
      const items = [
        { position: 2, id: 'a' },
        { position: 0, id: 'c' },
        { position: 1, id: 'b' },
      ]

      const sorted = sortByPosition(items)

      expect(sorted).toEqual([
        { position: 0, id: 'c' },
        { position: 1, id: 'b' },
        { position: 2, id: 'a' },
      ])
    })

    it('does not mutate original array', () => {
      const items = [
        { position: 2, id: 'a' },
        { position: 0, id: 'c' },
      ]

      sortByPosition(items)

      expect(items[0].position).toBe(2)
    })
  })

  describe('nextPosition', () => {
    it('returns 0 for empty array', () => {
      expect(nextPosition([])).toBe(0)
    })

    it('returns max position + 1', () => {
      const items = [{ position: 5 }, { position: 3 }, { position: 2 }]
      expect(nextPosition(items)).toBe(6)
    })
  })
})
