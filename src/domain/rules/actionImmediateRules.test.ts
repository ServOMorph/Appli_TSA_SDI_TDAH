import { describe, it, expect } from 'vitest'
import { getActionImmediate } from './actionImmediateRules'
import type { Task } from '@/domain/entities/task'
import type { SubTask } from '@/domain/entities/subTask'

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

const mockSubTask = (overrides?: Partial<SubTask>): SubTask => ({
  id: 'st-1',
  task_id: 'task-1',
  title: 'Sous-tâche',
  is_completed: false,
  position: 0,
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

    it('returns nextSubTask when task has incomplete subtasks', () => {
      const task = mockTask({ id: 'task-1' })
      const subTasksMap = {
        'task-1': [
          mockSubTask({ id: 'st-1', position: 0, is_completed: true }),
          mockSubTask({ id: 'st-2', position: 1, is_completed: false }),
          mockSubTask({ id: 'st-3', position: 2, is_completed: false }),
        ],
      }
      const result = getActionImmediate([task], subTasksMap)
      expect(result.nextSubTask?.id).toBe('st-2')
    })

    it('returns no nextSubTask when all subtasks completed', () => {
      const task = mockTask({ id: 'task-1' })
      const subTasksMap = {
        'task-1': [
          mockSubTask({ id: 'st-1', is_completed: true }),
        ],
      }
      const result = getActionImmediate([task], subTasksMap)
      expect(result.nextSubTask).toBeUndefined()
    })

    it('returns no nextSubTask when task has no subtasks', () => {
      const task = mockTask({ id: 'task-1' })
      const result = getActionImmediate([task], {})
      expect(result.nextSubTask).toBeUndefined()
    })

    it('returns nextSubTask by position order', () => {
      const task = mockTask({ id: 'task-1' })
      const subTasksMap = {
        'task-1': [
          mockSubTask({ id: 'st-b', position: 2, is_completed: false }),
          mockSubTask({ id: 'st-a', position: 0, is_completed: false }),
        ],
      }
      const result = getActionImmediate([task], subTasksMap)
      expect(result.nextSubTask?.id).toBe('st-a')
    })
  })
})
