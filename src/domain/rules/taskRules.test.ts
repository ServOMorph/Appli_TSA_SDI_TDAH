import { describe, it, expect } from 'vitest'
import { sortByPosition, nextPosition, completeTask } from './taskRules'
import type { Task } from '@/domain/entities/task'

const mockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  title: 'Test task',
  status: 'today',
  position: 0,
  created_at: '2026-06-24T00:00:00Z',
  updated_at: '2026-06-24T00:00:00Z',
  completed_at: null,
  ...overrides,
})

describe('taskRules', () => {
  describe('sortByPosition', () => {
    it('sorts items by position ascending', () => {
      const items = [mockTask({ position: 2 }), mockTask({ position: 0 }), mockTask({ position: 1 })]
      const sorted = sortByPosition(items)
      expect(sorted.map((t) => t.position)).toEqual([0, 1, 2])
    })

    it('does not mutate input', () => {
      const items = [mockTask({ position: 2 }), mockTask({ position: 0 })]
      const original = [...items]
      sortByPosition(items)
      expect(items).toEqual(original)
    })
  })

  describe('nextPosition', () => {
    it('returns 0 for empty list', () => {
      expect(nextPosition([])).toBe(0)
    })

    it('returns max position + 1', () => {
      const items = [{ position: 1 }, { position: 3 }, { position: 2 }]
      expect(nextPosition(items)).toBe(4)
    })
  })

  describe('completeTask', () => {
    it('sets status to completed and sets completed_at', () => {
      const task = mockTask()
      const now = '2026-06-25T10:30:00Z'
      const completed = completeTask(task, now)
      expect(completed.status).toBe('completed')
      expect(completed.completed_at).toBe(now)
      expect(completed.updated_at).toBe(now)
    })

    it('does not mutate original', () => {
      const task = mockTask()
      const original = { ...task }
      completeTask(task, '2026-06-25T10:30:00Z')
      expect(task).toEqual(original)
    })
  })
})
