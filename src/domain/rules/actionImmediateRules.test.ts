import { describe, it, expect } from 'vitest'
import { getActionImmediate } from './actionImmediateRules'
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

describe('actionImmediateRules', () => {
  describe('getActionImmediate', () => {
    it('returns first today task when exists', () => {
      const tasks = [
        mockTask({ id: 't1', position: 0, status: 'today' }),
        mockTask({ id: 't2', position: 1, status: 'today' }),
      ]
      const result = getActionImmediate(tasks)
      expect(result.type).toBe('task')
      expect(result.task?.id).toBe('t1')
    })

    it('returns empty when no today tasks', () => {
      const tasks = [mockTask({ status: 'inbox' })]
      const result = getActionImmediate(tasks)
      expect(result.type).toBe('empty')
      expect(result.task).toBeUndefined()
    })

    it('returns first by position', () => {
      const tasks = [
        mockTask({ id: 't1', position: 2, status: 'today' }),
        mockTask({ id: 't2', position: 0, status: 'today' }),
      ]
      const result = getActionImmediate(tasks)
      expect(result.task?.id).toBe('t2')
    })

    it('returns empty when list empty', () => {
      const result = getActionImmediate([])
      expect(result.type).toBe('empty')
    })
  })
})
