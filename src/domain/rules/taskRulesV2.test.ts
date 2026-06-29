import { describe, it, expect } from 'vitest'
import {
  createTaskV2,
  completeTaskV2,
  scheduleTaskV2,
  moveTaskToLaterV2,
  toggleEssentialV2,
  sortByPosition,
  nextPosition,
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
  })

  describe('moveTaskToLaterV2', () => {
    it('moves task to to_plan status', () => {
      const task: TaskV2 = {
        id: 'id-1',
        title: 'My task',
        status: 'planned',
        essential: true,
        position: 0,
        scheduled_date: '2026-06-30',
        scheduled_start: '10:00',
        scheduled_end: '11:00',
        created_at: now,
        updated_at: now,
        completed_at: null,
      }

      const later = moveTaskToLaterV2(task, now)

      expect(later.status).toBe('to_plan')
      expect(later.scheduled_date).toBeNull()
      expect(later.scheduled_start).toBeNull()
      expect(later.scheduled_end).toBeNull()
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
